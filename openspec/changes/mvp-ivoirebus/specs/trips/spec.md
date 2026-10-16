# Spec Delta

## Purpose

Gère les trajets interurbains proposés par IvoireBus : relations entre villes, horaires, prix et capacité de sièges, utilisés par la recherche et la réservation.

## ADDED Requirements

### Requirement: Consultation des trajets

Le système SHALL fournir aux administrateurs la liste des trajets existants, chaque trajet comportant une ville de départ, une ville d'arrivée, une date et heure de départ, un prix en francs CFA (XOF) et une capacité de sièges.

#### Scenario: Liste des trajets affichée

- **WHEN** un administrateur accède à la gestion des trajets
- **THEN** le système affiche la liste des trajets avec leurs villes de départ et d'arrivée, leur horaire, leur prix et leur capacité

### Requirement: Création d'un trajet

Le système SHALL permettre à un administrateur de créer un trajet à partir de deux villes existantes et distinctes, d'un horaire de départ, d'un prix strictement positif et d'une capacité de sièges strictement positive.

#### Scenario: Création réussie

- **WHEN** un administrateur soumet deux villes distinctes, une date et heure de départ, un prix positif et une capacité positive
- **THEN** le système crée le trajet et l'ajoute à la liste

#### Scenario: Villes identiques

- **WHEN** un administrateur soumet la même ville comme départ et comme arrivée
- **THEN** le système refuse la création et affiche une erreur

#### Scenario: Prix ou capacité invalide

- **WHEN** un administrateur soumet un prix ou une capacité nuls ou négatifs
- **THEN** le système bloque la création et affiche une erreur de validation

### Requirement: Modification d'un trajet

Le système SHALL permettre à un administrateur de modifier les informations d'un trajet existant, y compris son horaire, son prix et sa capacité.

#### Scenario: Modification réussie

- **WHEN** un administrateur modifie un trajet avec des valeurs valides
- **THEN** le système met à jour le trajet et affiche les nouvelles informations

#### Scenario: Capacité réduite sous le nombre de sièges réservés

- **WHEN** un administrateur réduit la capacité d'un trajet à une valeur inférieure au nombre de sièges déjà réservés
- **THEN** le système refuse la modification et explique que des sièges sont déjà réservés

### Requirement: Suppression d'un trajet

Le système SHALL permettre à un administrateur de supprimer un trajet qui ne comporte aucune réservation et SHALL refuser la suppression d'un trajet ayant au moins une réservation.

#### Scenario: Suppression d'un trajet sans réservation

- **WHEN** un administrateur supprime un trajet sans réservation
- **THEN** le système supprime le trajet et l'écarte de la liste

#### Scenario: Suppression d'un trajet réservé

- **WHEN** un administrateur tente de supprimer un trajet comportant au moins une réservation
- **THEN** le système refuse la suppression et explique que des réservations existent
