# Spec Delta

## Purpose

Offre aux administrateurs une vue d'ensemble de l'activité : réservations, trajets et indicateurs clés, pour piloter l'offre et le remplissage.

## ADDED Requirements

### Requirement: Accès réservé aux administrateurs

Le système SHALL réserver le tableau de bord aux utilisateurs de rôle `ADMIN`.

#### Scenario: Accès administrateur

- **WHEN** un utilisateur de rôle `ADMIN` ouvre le tableau de bord
- **THEN** le système affiche le tableau de bord

#### Scenario: Accès refusé à un voyageur

- **WHEN** un utilisateur de rôle `VOYAGEUR` tente d'ouvrir le tableau de bord
- **THEN** le système refuse l'accès et le redirige vers une page autorisée

### Requirement: Indicateurs clés

Le système SHALL afficher au moins le nombre total de réservations, le nombre de réservations confirmées, le nombre de réservations annulées, le nombre de trajets et le nombre de villes.

#### Scenario: Indicateurs affichés

- **WHEN** un administrateur ouvre le tableau de bord
- **THEN** le système affiche les totaux de réservations (confirmées et annulées), de trajets et de villes

#### Scenario: Aucune donnée

- **WHEN** l'application ne contient encore ni trajet ni réservation
- **THEN** le système affiche les indicateurs à zéro sans erreur

### Requirement: Vue des réservations récentes

Le système SHALL afficher au tableau de bord les réservations les plus récentes avec le voyageur, le trajet, le siège et le statut.

#### Scenario: Réservations récentes listées

- **WHEN** des réservations existent
- **THEN** le système affiche les réservations les plus récentes avec le voyageur, le trajet, le siège et le statut

### Requirement: Taux de remplissage d'un trajet

Le système SHALL afficher pour chaque trajet le nombre de sièges réservés et le taux de remplissage par rapport à sa capacité.

#### Scenario: Remplissage calculé

- **WHEN** un trajet comporte des réservations confirmées
- **THEN** le système affiche le nombre de sièges réservés et le taux de remplissage correspondant
