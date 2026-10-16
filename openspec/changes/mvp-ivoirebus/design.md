# Design

## Context

Le dépôt est un squelette Angular 21 en mode standalone avec SSR (`provideServerRendering`) et hydratation (`provideClientHydration(withEventReplay)`). Les routes sont vides (`src/app/app.routes.ts`) et la configuration applicative est centralisée dans `src/app/app.config.ts`. Les tests utilisent Vitest via `ng test`. Aucune bibliothèque d'état, de composants UI ou de génération de QR code n'est présente. Voir `proposal.md` pour la motivation et les capacités ; les `specs/*/spec.md` définissent le comportement attendu.

## Goals / Non-Goals

**Goals:**

- Fournir une architecture modulaire et testable pour les 8 capacités du MVP.
- Isoler la persistance derrière des services Angular injectables afin de pouvoir remplacer `localStorage` par une API plus tard sans toucher aux composants.
- Rendre l'accès aux données compatible SSR (pas d'accès direct à `window`/`localStorage` pendant le rendu serveur).
- Protéger les routes par rôle à l'aide de guards fonctionnels.

**Non-Goals:**

- Authentification ou autorisation côté serveur : le MVP valide tout côté client.
- Backend, base de données ou contrat d'API REST.
- Paiement en ligne, gestion des bagages, notifications, multilingue.
- Optimisation avancée du référencement ou de la performance.

## Decisions

- **Services injectables + `localStorage` comme source de vérité.** Chaque capacité expose un service (`AuthService`, `CityService`, `TripService`, `BookingService`). Une couche de persistance commune (`StorageService`) encapsule `localStorage` et retourne des valeurs par défaut quand l'accès n'est pas disponible (SSR). *Alternative écartée* : appels HTTP directs — inutiles sans backend.
- **État exposé via `signal` Angular.** Les services conservent leur état dans des signaux et les composants s'y abonnent, ce qui s'intègre nativement à Angular 21 et à l'hydratation. *Alternative écartée* : NgRx / RxJS BehaviorSubject — surdimensionné pour un MVP.
- **Modèles typés dans `src/app/core/models`.** Types `User`, `City`, `Trip`, `Booking`, `Seat` avec statuts `CONFIRMEE` / `ANNULEE` en union de littéraux.
- **Guards fonctionnels `authGuard` et `adminGuard`.** `authGuard` exige une session ; `adminGuard` exige le rôle `ADMIN`. *Alternative écartée* : guards de classe — pattern obsolète dans Angular moderne.
- **Génération du QR code côté client** via une bibliothèque légère (`qrcode`) appelée depuis le composant billet, sans service distant. *Alternative écartée* : API QR externe — dépendance réseau non souhaitée.
- **Formulaires réactifs** (`ReactiveFormsModule`) pour l'inscription, la connexion et les formulaires CRUD, afin de centraliser les validations.
- **Persistance des mots de passe en clair dans `localStorage`** assumée comme limite du MVP ; un hachage simple (Web Crypto SHA-256) est appliqué pour éviter le stockage brut. *Alternative écartée* : authentification serveur — hors périmètre.
- **Structure de dossiers** : `src/app/core` (modèles, services, guards), `src/app/features/<capacité>` (composants + routes), routes paresseuses (`loadComponent` / `loadChildren`).

## Risks / Trade-offs

- [Sécurité côté client uniquement, contournable] → Limiter le MVP à la démonstration ; documenter que la production exigera une authentification serveur.
- [Données perdues si le stockage est vidé] → Centraliser la persistance et fournir un jeu de données de démonstration (seed) au premier lancement.
- [Conflit de réservation possible entre onglets] → Revalider la disponibilité du siège au moment de la confirmation ; s'appuyer sur une écriture unique côté `BookingService`.
- [SSR et `localStorage` indisponible] → `StorageService` détecte l'environnement (`isPlatformBrowser`) et retourne des valeurs neutres côté serveur.
- [Ajout d'une dépendance QR et de composants UI augmente le bundle] → Charger le composant billet en route paresseuse et privilégier une bibliothèque QR légère.
- [Validations dupliquées entre formulaires et services] → Garder les règles métier (unicité, disponibilité) dans les services et les règles de format dans les formulaires.

## Migration Plan

Aucune migration : le projet ne contient pas encore de fonctionnalité. L'implémentation s'ajoute à un squelette vierge. Retour arrière = suppression du code de la fonctionnalité et des données `localStorage` associées.

## Open Questions

- Bibliothèque de composants UI (Angular Material, Tailwind, CSS maison) : non tranchée, sans impact sur les specs ni sur le découpage des tâches.
