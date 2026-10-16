# Tasks

## 1. Fondations

- [x] 1.1 Créer l'arborescence `src/app/core` (models, services, guards) et `src/app/features/<capacité>`, puis vérifier que `ng build` compile sans erreur
- [x] 1.2 Définir les modèles typés (`User`, `Role`, `City`, `Trip`, `Booking`, `BookingStatus`) dans `src/app/core/models` et vérifier que `ng build` compile
- [x] 1.3 Implémenter `StorageService` encapsulant `localStorage` avec garde `isPlatformBrowser` et valeurs par défaut en SSR, puis vérifier par un test unitaire que la lecture renvoie une valeur neutre en environnement non navigateur
- [x] 1.4 Ajouter le chargement initial (seed) des villes, trajets et comptes de démonstration au premier lancement, puis vérifier manuellement que les données apparaissent sans erreur dans le stockage
- [x] 1.5 Mettre en place le squelette de routage (`app.routes.ts`) avec routes paresseuses et une page d'accueil pointant vers la recherche, puis vérifier la navigation dans `ng serve`

## 2. Authentification et rôles

- [x] 2.1 Implémenter `AuthService` (inscription, connexion, déconnexion, session persistante, hachage SHA-256 du mot de passe) et vérifier par des tests unitaires les cas inscription, connexion, identifiants invalides et déconnexion
- [x] 2.2 Créer les écrans d'inscription et de connexion avec formulaires réactifs et validation des champs, puis vérifier les scénarios de la spec `auth` manuellement (e-mail déjà utilisé, champs invalides)
- [x] 2.3 Implémenter `authGuard` et `adminGuard` et protéger les routes correspondantes, puis vérifier par des tests unitaires que chaque rôle est redirigé comme prévu
- [x] 2.4 Documenter le parcours d'authentification et ses limites de sécurité côté client dans `README.md`, puis vérifier que les commandes `ng serve` et `ng test` citées fonctionnent

## 3. Gestion des villes

- [x] 3.1 Implémenter `CityService` (liste, création, renommage, suppression avec contrôle d'unicité et de référence par un trajet) et vérifier par des tests unitaires les scénarios de la spec `cities`
- [x] 3.2 Créer l'écran d'administration des villes avec formulaires de création/modification/suppression et messages d'erreur, puis vérifier chaque scénario de la spec `cities` manuellement

## 4. Gestion des trajets

- [x] 4.1 Implémenter `TripService` (liste, création, modification, suppression, validation villes distinctes, prix et capacité positifs, capacité ≥ sièges réservés) et vérifier par des tests unitaires les scénarios de la spec `trips`
- [x] 4.2 Créer l'écran d'administration des trajets (sélecteurs de villes, horaire, prix, capacité) et vérifier chaque scénario de la spec `trips` manuellement

## 5. Recherche de trajets

- [x] 5.1 Implémenter la logique de recherche (destination, date, filtre optionnel de départ, exclusion des trajets passés, calcul des sièges disponibles) et vérifier par des tests unitaires les scénarios de la spec `trip-search`
- [x] 5.2 Créer l'écran de recherche avec formulaire (destination, date, départ) et liste de résultats affichant horaire, prix et sièges disponibles, puis vérifier les scénarios « résultats », « aucun résultat » et « trajet complet » manuellement

## 6. Sélection des sièges

- [x] 6.1 Implémenter la logique de disponibilité et de revalidation d'un siège à la confirmation dans `BookingService`/service dédié, puis vérifier par des tests unitaires les scénarios de la spec `seat-selection`
- [x] 6.2 Créer le composant de plan des sièges distinguant libres et occupés, avec sélection/désélection et blocage si aucun siège choisi, puis vérifier les scénarios de la spec `seat-selection` manuellement

## 7. Réservations

- [x] 7.1 Implémenter `BookingService` (création avec statut `CONFIRMEE`, contenu et montant calculé, annulation, historique par voyageur) et vérifier par des tests unitaires les scénarios de la spec `bookings`
- [x] 7.2 Créer l'écran de confirmation de réservation et l'écran d'historique (tri du plus récent au plus ancien, état vide, action d'annulation), puis vérifier les scénarios de la spec `bookings` manuellement
- [x] 7.3 Vérifier qu'un voyageur ne peut pas accéder à la réservation d'un autre utilisateur via une URL directe, puis confirmer le comportement attendu par un test du guard ou du service d'accès

## 8. Billet électronique

- [x] 8.1 Ajouter la dépendance de génération de QR code et implémenter le composant billet affichant identifiant, villes, horaire, siège, montant et nom du voyageur, puis vérifier les scénarios de la spec `e-ticket` manuellement
- [x] 8.2 Générer et afficher le QR code encodant les données de la réservation, sans appel réseau, puis vérifier par un test unitaire qu'un même billet produit le même contenu et qu'une réservation annulée n'affiche pas de billet valide
- [x] 8.3 Charger l'écran billet en route paresseuse et documenter le format des données encodées dans `README.md`, puis vérifier la commande de build de production

## 9. Tableau de bord administrateur

- [x] 9.1 Implémenter le calcul des indicateurs (totaux de réservations confirmées/annulées, trajets, villes) et du taux de remplissage, puis vérifier par des tests unitaires les scénarios de la spec `admin-dashboard`
- [x] 9.2 Créer l'écran tableau de bord avec cartes d'indicateurs, réservations récentes et remplissage par trajet, accessible uniquement via `adminGuard`, puis vérifier les scénarios de la spec `admin-dashboard` manuellement

## 10. Vérification d'intégration

- [x] 10.1 Exécuter `ng test` et confirmer que tous les tests unitaires passent sans erreur
- [x] 10.2 Exécuter le parcours complet (recherche → sélection du siège → réservation → billet QR → historique) sur `ng serve` avec un compte voyageur, puis confirmer le comportement attendu de bout en bout
- [x] 10.3 Exécuter le parcours administrateur (gestion villes/trajets + tableau de bord) et confirmer que les indicateurs reflètent les réservations créées

## Workflow follow-up

- Archiver le change après validation des spécifications et de l'implémentation par le projet.
- Vérifier le résultat archivé (specs fusionnées sous `openspec/specs/`).
