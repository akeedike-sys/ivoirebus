# Ivoirebus

Application Angular de réservation de billets de bus interurbains en Côte d'Ivoire (MVP).

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.2.24.

## Fonctionnalités du MVP

- Authentification avec deux rôles : `ADMIN` et `VOYAGEUR`.
- Gestion des villes et des trajets (CRUD réservé aux administrateurs).
- Recherche de trajets par destination, date et ville de départ optionnelle.
- Sélection d'un siège sur un plan de bus, réservation et annulation.
- Billet électronique avec QR code, et historique des réservations.
- Tableau de bord administrateur (indicateurs, réservations récentes, remplissage).

Les données sont persistées côté navigateur dans `localStorage` (aucun backend pour le MVP).

### Comptes de démonstration

| Rôle | E-mail | Mot de passe |
| --- | --- | --- |
| ADMIN | `admin@ivoirebus.ci` | `admin123` |
| VOYAGEUR | `voyageur@ivoirebus.ci` | `voyageur123` |

## Authentification et sécurité

Parcours : un visiteur s'inscrit via `/inscription` (rôle `VOYAGEUR` attribué) ou se connecte via `/connexion`. La session est conservée dans `localStorage` et restaurée au rechargement. La déconnexion efface la session.

- `authGuard` exige une session authentifiée pour la sélection de siège, la réservation, l'historique et le billet.
- `adminGuard` restreint `/admin/**` au rôle `ADMIN` ; un voyageur est redirigé vers `/recherche`, un visiteur anonyme vers `/connexion`.
- `bookingOwnerGuard` empêche un voyageur d'accéder au détail ou au billet d'une réservation qui ne lui appartient pas.

**Limites de sécurité (assumées pour le MVP)** : toute l'authentification et l'autorisation sont réalisées côté client. Les mots de passe sont hachés avec SHA-256 (Web Crypto) avant stockage, mais le stockage et les contrôles d'accès restent contournables par un utilisateur averti. Une mise en production exige une authentification et une autorisation côté serveur.

## Format du QR code du billet

Le billet (`/billet/:bookingId`, chargé en route paresseuse) encode une sérialisation JSON déterministe afin qu'un même billet produise toujours le même QR code. La charge utile est un tableau :

```
["IVOIREBUS", bookingId, seatNumber, passenger, from, to, departureAt, amount, status]
```

Une réservation dont le statut n'est pas `CONFIRMEE` ne génère aucun billet valide.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
