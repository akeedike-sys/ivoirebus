# Spec Delta

## Purpose

Gère le référentiel des villes desservies par IvoireBus, utilisé comme source des villes de départ et d'arrivée lors de la recherche et de la création de trajets.

## ADDED Requirements

### Requirement: Consultation des villes

Le système SHALL fournir la liste des villes desservies à tout utilisateur, chaque ville étant identifiée par un nom unique.

#### Scenario: Liste des villes affichée

- **WHEN** un utilisateur accède à la gestion des villes ou à un sélecteur de ville
- **THEN** le système affiche la liste des villes existantes

### Requirement: Création d'une ville

Le système SHALL permettre à un administrateur de créer une ville avec un nom obligatoire et SHALL refuser la création d'une ville dont le nom existe déjà (comparaison insensible à la casse et aux espaces superflus).

#### Scenario: Création réussie

- **WHEN** un administrateur soumet le nom d'une ville qui n'existe pas encore
- **THEN** le système crée la ville et l'ajoute à la liste affichée

#### Scenario: Nom en doublon

- **WHEN** un administrateur soumet un nom déjà existant
- **THEN** le système refuse la création et affiche un message indiquant que la ville existe déjà

#### Scenario: Nom vide

- **WHEN** un administrateur soumet un nom vide
- **THEN** le système bloque la création et affiche une erreur de validation

### Requirement: Modification d'une ville

Le système SHALL permettre à un administrateur de renommer une ville existante, en conservant la contrainte d'unicité du nom.

#### Scenario: Renommage réussi

- **WHEN** un administrateur renomme une ville avec un nom disponible
- **THEN** le système met à jour la ville et reflète le nouveau nom dans les listes et sélecteurs

#### Scenario: Renommage vers un nom existant

- **WHEN** un administrateur renomme une ville avec le nom d'une autre ville
- **THEN** le système refuse la modification et affiche une erreur

### Requirement: Suppression d'une ville

Le système SHALL permettre à un administrateur de supprimer une ville qui n'est référencée par aucun trajet et SHALL refuser la suppression d'une ville utilisée par au moins un trajet.

#### Scenario: Suppression d'une ville non utilisée

- **WHEN** un administrateur supprime une ville qu'aucun trajet ne référence
- **THEN** le système supprime la ville et l'écarte de la liste

#### Scenario: Suppression d'une ville utilisée

- **WHEN** un administrateur tente de supprimer une ville référencée par un trajet existant
- **THEN** le système refuse la suppression et explique que la ville est utilisée par un trajet
