# Spec Delta

## Purpose

Représente le plan des sièges d'un trajet et permet à un voyageur de choisir un siège libre avant de confirmer sa réservation.

## ADDED Requirements

### Requirement: Affichage du plan des sièges

Le système SHALL afficher un plan des sièges du trajet dont le nombre de places correspond à la capacité du trajet, en distinguant visuellement les sièges libres des sièges occupés.

#### Scenario: Plan cohérent avec la capacité

- **WHEN** un voyageur ouvre la sélection des sièges d'un trajet
- **THEN** le système affiche autant de sièges que la capacité du trajet

#### Scenario: Sièges occupés distingués

- **WHEN** des sièges sont déjà rattachés à des réservations existantes
- **THEN** le système les affiche comme occupés et non sélectionnables

### Requirement: Sélection d'un siège libre

Le système SHALL permettre à un voyageur de sélectionner un seul siège libre pour un trajet donné et SHALL conserver ce choix jusqu'à la confirmation ou l'annulation de la réservation.

#### Scenario: Sélection d'un siège libre

- **WHEN** un voyageur clique sur un siège libre
- **THEN** le système marque ce siège comme sélectionné

#### Scenario: Changement de siège

- **WHEN** un voyageur clique sur un autre siège libre alors qu'un siège est déjà sélectionné
- **THEN** le système désélectionne l'ancien siège et sélectionne le nouveau

#### Scenario: Sélection d'un siège occupé

- **WHEN** un voyageur clique sur un siège déjà occupé
- **THEN** le système refuse la sélection et indique que ce siège n'est pas disponible

### Requirement: Siège devenu indisponible

Le système SHALL vérifier la disponibilité du siège au moment de la confirmation et SHALL refuser la validation si le siège a été réservé entre-temps.

#### Scenario: Conflit de réservation

- **WHEN** un voyageur confirme sa réservation avec un siège qui a été réservé par un autre utilisateur entre-temps
- **THEN** le système refuse la confirmation, signale l'indisponibilité du siège et invite à en choisir un autre

### Requirement: Poursuite de la réservation

Le système SHALL empêcher la poursuite du parcours de réservation tant qu'aucun siège libre n'est sélectionné.

#### Scenario: Confirmation sans siège

- **WHEN** un voyageur tente de passer à l'étape suivante sans avoir sélectionné de siège
- **THEN** le système bloque la progression et demande de choisir un siège
