# Spec Delta

## Purpose

Permet à un voyageur de trouver les trajets disponibles à partir d'une ville de destination et d'une date de départ, avant d'entamer une réservation.

## ADDED Requirements

### Requirement: Recherche par destination et date

Le système SHALL retourner les trajets dont la ville d'arrivée correspond à la destination demandée et dont la date de départ correspond à la date demandée.

#### Scenario: Résultats correspondants

- **WHEN** un voyageur recherche une destination et une date pour lesquelles au moins un trajet existe
- **THEN** le système affiche les trajets correspondants avec leur ville de départ, leur horaire, leur prix et leurs sièges disponibles

#### Scenario: Aucun résultat

- **WHEN** un voyageur recherche une destination et une date pour lesquelles aucun trajet n'existe
- **THEN** le système affiche un message indiquant qu'aucun trajet ne correspond

#### Scenario: Critères manquants

- **WHEN** un voyageur lance la recherche sans destination ou sans date
- **THEN** le système bloque la recherche et demande de renseigner les critères obligatoires

### Requirement: Recherche restreinte aux trajets futurs

Le système SHALL exclure des résultats les trajets dont l'horaire de départ est déjà passé.

#### Scenario: Trajet déjà parti exclu

- **WHEN** un voyageur recherche une date dont certains trajets sont déjà partis
- **THEN** le système n'affiche pas ces trajets dans les résultats

### Requirement: Filtrage optionnel par ville de départ

Le système SHALL permettre à un voyageur de restreindre les résultats en précisant une ville de départ, en plus de la destination et de la date.

#### Scenario: Filtrage par ville de départ

- **WHEN** un voyageur précise une ville de départ en plus de la destination et de la date
- **THEN** le système n'affiche que les trajets partant de cette ville

### Requirement: Affichage de la disponibilité

Le système SHALL indiquer, pour chaque trajet retourné, le nombre de sièges encore disponibles et SHALL permettre d'initier une réservation depuis un résultat.

#### Scenario: Sièges disponibles affichés

- **WHEN** un voyageur consulte un résultat de recherche
- **THEN** le système affiche le nombre de sièges disponibles pour ce trajet

#### Scenario: Trajet complet

- **WHEN** un trajet n'a plus aucun siège disponible
- **THEN** le système indique que le trajet est complet et empêche d'initier une réservation

#### Scenario: Sélection d'un résultat

- **WHEN** un voyageur choisit un trajet disponible dans les résultats
- **THEN** le système ouvre l'étape de sélection des sièges pour ce trajet
