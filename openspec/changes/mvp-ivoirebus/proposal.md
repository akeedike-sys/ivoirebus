# Proposal

## Why

Il n'existe aujourd'hui aucune application de réservation de billets de bus interurbains pour la Côte d'Ivoire : les voyageurs dépendent du passage en gare et de la disponibilité au guichet. Le projet IvoireBus vise un MVP web (Angular) qui permet de rechercher un trajet, choisir un siège, réserver en ligne et présenter un billet électronique avec QR code.

## What Changes

- Mise en place d'une application Angular 21 (SSR) structurée en modules fonctionnels : authentification, villes, trajets, recherche, réservation, billet, historique et administration.
- Authentification des utilisateurs avec deux rôles : `ADMIN` et `VOYAGEUR`.
- Gestion (CRUD) des villes desservies par les administrateurs.
- Gestion (CRUD) des trajets : ville de départ, ville d'arrivée, date/heure de départ, prix, capacité et sièges.
- Recherche de trajets par destination et date, avec liste des résultats disponibles.
- Sélection des sièges sur un plan de bus, avec indication des sièges déjà occupés.
- Création et gestion d'une réservation rattachée à un voyageur et à un trajet.
- Génération d'un billet électronique avec QR code à partir d'une réservation confirmée.
- Consultation de l'historique des réservations du voyageur.
- Tableau de bord administrateur : vue des réservations, trajets et indicateurs clés.
- Persistance des données via une couche de services Angular en mémoire avec persistance `localStorage` (aucun backend pour le MVP).
- Aucun backend/API externe n'est introduit dans ce change.

## Capabilities

### New Capabilities

- `auth`: authentification, inscription/connexion, session utilisateur et autorisation par rôle (`ADMIN`, `VOYAGEUR`).
- `cities`: gestion des villes desservies (création, consultation, modification, suppression).
- `trips`: gestion des trajets et de leurs horaires, prix et capacité de sièges.
- `trip-search`: recherche de trajets disponibles par ville de destination et date.
- `seat-selection`: représentation de la disponibilité des sièges et sélection d'un siège pour un trajet.
- `bookings`: création, statut et historique des réservations d'un voyageur.
- `e-ticket`: génération et présentation du billet électronique avec QR code pour une réservation confirmée.
- `admin-dashboard`: tableau de bord administrateur (réservations, trajets, indicateurs).

### Modified Capabilities

<!-- Aucune : le projet ne contient encore aucune spécification existante. -->

## Impact

- **Code** : nouvelle structure sous `src/app` (composants, services, guards, modèles, routes). Le squelette Angular existe déjà (`src/app/app.routes.ts`, `src/app/app.config.ts`).
- **Dépendances** : ajout d'une bibliothèque de génération de QR code côté client et, si nécessaire, d'une bibliothèque de composants UI et de formulaires réactifs.
- **Persistance** : `localStorage` du navigateur ; données perdues si le stockage est vidé. Le SSR ne doit pas dépendre du stockage navigateur (accès protégé par des vérifications de plateforme).
- **Sécurité** : authentification côté client uniquement, sans vérification serveur — limites acceptées pour un MVP.
- **Tests** : ajout de tests unitaires Vitest pour les services (authentification, réservation, disponibilité des sièges) et les guards de rôle.
