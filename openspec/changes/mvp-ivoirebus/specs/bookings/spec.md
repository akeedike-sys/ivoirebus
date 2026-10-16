# Spec Delta

## Purpose

Gère la création et le suivi des réservations d'un voyageur pour un trajet et un siège donnés, ainsi que l'historique consultable de ses réservations.

## ADDED Requirements

### Requirement: Création d'une réservation

Le système SHALL créer, à la demande d'un voyageur authentifié, une réservation associant un trajet, un siège libre et l'utilisateur, et SHALL lui attribuer un statut initial `CONFIRMEE`.

#### Scenario: Réservation créée

- **WHEN** un voyageur authentifié confirme la réservation d'un trajet avec un siège libre
- **THEN** le système enregistre la réservation avec le statut `CONFIRMEE` et l'associe à l'utilisateur

#### Scenario: Réservation par un visiteur non authentifié

- **WHEN** un visiteur non authentifié tente de confirmer une réservation
- **THEN** le système refuse la création et le redirige vers la page de connexion

#### Scenario: Réservation d'un siège occupé

- **WHEN** un voyageur confirme une réservation pour un siège déjà occupé
- **THEN** le système refuse la création et signale l'indisponibilité du siège

### Requirement: Contenu d'une réservation

Le système SHALL conserver pour chaque réservation la référence du trajet, le numéro de siège, l'identifiant du voyageur, la date de création et le statut, et SHALL calculer le montant à partir du prix du trajet.

#### Scenario: Montant calculé

- **WHEN** une réservation est créée pour un trajet dont le prix est défini
- **THEN** le montant de la réservation correspond au prix du trajet

### Requirement: Historique des réservations du voyageur

Le système SHALL permettre à un voyageur authentifié de consulter la liste de ses réservations, triées de la plus récente à la plus ancienne, avec leur statut.

#### Scenario: Historique affiché

- **WHEN** un voyageur authentifié ouvre son historique de réservations
- **THEN** le système affiche uniquement ses propres réservations, de la plus récente à la plus ancienne

#### Scenario: Historique vide

- **WHEN** un voyageur authentifié n'a encore aucune réservation
- **THEN** le système affiche un état vide invitant à rechercher un trajet

### Requirement: Annulation d'une réservation

Le système SHALL permettre à un voyageur d'annuler une réservation confirmée dont le départ n'a pas encore eu lieu, et SHALL libérer alors le siège associé.

#### Scenario: Annulation réussie

- **WHEN** un voyageur annule une réservation confirmée avant le départ du trajet
- **THEN** le système passe la réservation au statut `ANNULEE` et rend le siège à nouveau disponible

#### Scenario: Annulation après le départ

- **WHEN** un voyageur tente d'annuler une réservation dont le trajet est déjà parti
- **THEN** le système refuse l'annulation et indique que le délai est dépassé

#### Scenario: Annulation d'une réservation déjà annulée

- **WHEN** un voyageur tente d'annuler une réservation ayant déjà le statut `ANNULEE`
- **THEN** le système refuse l'opération sans modifier la réservation

### Requirement: Accès limité aux réservations

Le système SHALL empêcher un voyageur d'accéder aux réservations d'un autre voyageur.

#### Scenario: Accès à une réservation d'autrui

- **WHEN** un voyageur authentifié demande le détail d'une réservation qui appartient à un autre utilisateur
- **THEN** le système refuse l'accès
