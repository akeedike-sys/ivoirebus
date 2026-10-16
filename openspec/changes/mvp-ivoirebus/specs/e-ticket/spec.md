# Spec Delta

## Purpose

Produit et présente le billet électronique d'une réservation confirmée, muni d'un QR code permettant de vérifier les informations du voyage.

## ADDED Requirements

### Requirement: Génération du billet électronique

Le système SHALL générer un billet électronique pour toute réservation ayant le statut `CONFIRMEE` et SHALL NE PAS générer de billet pour une réservation annulée.

#### Scenario: Billet généré pour une réservation confirmée

- **WHEN** un voyageur ouvre le billet d'une réservation confirmée
- **THEN** le système affiche le billet électronique correspondant

#### Scenario: Réservation annulée sans billet

- **WHEN** un voyageur demande le billet d'une réservation annulée
- **THEN** le système refuse d'afficher un billet valide et indique que la réservation est annulée

### Requirement: Contenu du billet

Le système SHALL faire figurer sur le billet l'identifiant de la réservation, les villes de départ et d'arrivée, la date et l'heure de départ, le numéro de siège, le montant et le nom du voyageur.

#### Scenario: Informations du voyage affichées

- **WHEN** un billet électronique est affiché
- **THEN** le système présente l'identifiant de réservation, les villes de départ et d'arrivée, l'horaire, le siège, le montant et le nom du voyageur

### Requirement: QR code du billet

Le système SHALL associer à chaque billet un QR code encodant les données d'identification de la réservation, généré et affiché sans dépendre d'un service distant.

#### Scenario: QR code affiché

- **WHEN** un billet électronique est affiché
- **THEN** le système affiche un QR code lisible contenant les données d'identification de la réservation

#### Scenario: Même données de référence

- **WHEN** un même billet est affiché à plusieurs reprises
- **THEN** le QR code encode les mêmes données d'identification de la réservation

### Requirement: Accès limité au billet

Le système SHALL permettre au voyageur propriétaire de la réservation de consulter son billet, ainsi qu'à un administrateur.

#### Scenario: Consultation par le propriétaire

- **WHEN** le voyageur propriétaire d'une réservation consulte son billet
- **THEN** le système affiche le billet

#### Scenario: Consultation par un autre voyageur

- **WHEN** un voyageur tente de consulter le billet d'une réservation qui ne lui appartient pas
- **THEN** le système refuse l'accès
