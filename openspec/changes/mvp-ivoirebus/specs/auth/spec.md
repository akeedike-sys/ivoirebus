# Spec Delta

## Purpose

Permet aux utilisateurs de s'inscrire et de se connecter, de maintenir une session, et restreint l'accès aux fonctionnalités selon le rôle (`ADMIN` ou `VOYAGEUR`).

## ADDED Requirements

### Requirement: Inscription d'un voyageur

Le système SHALL permettre la création d'un compte avec un nom, une adresse e-mail unique et un mot de passe. Tout nouveau compte créé via le parcours public SHALL recevoir le rôle `VOYAGEUR`.

#### Scenario: Inscription réussie

- **WHEN** un visiteur soumet un nom, un e-mail non utilisé et un mot de passe valide
- **THEN** le système crée le compte avec le rôle `VOYAGEUR` et ouvre une session pour cet utilisateur

#### Scenario: E-mail déjà utilisé

- **WHEN** un visiteur soumet une adresse e-mail déjà associée à un compte
- **THEN** le système refuse la création et affiche un message indiquant que cet e-mail est déjà utilisé

#### Scenario: Champs invalides

- **WHEN** un visiteur soumet un formulaire avec un champ obligatoire vide ou un format d'e-mail invalide
- **THEN** le système bloque la soumission et affiche les erreurs de validation correspondantes

### Requirement: Connexion d'un utilisateur

Le système SHALL authentifier un utilisateur à partir de son e-mail et de son mot de passe et SHALL rejeter les identifiants invalides sans révéler lequel des deux champs est incorrect.

#### Scenario: Connexion réussie

- **WHEN** un utilisateur soumet un e-mail et un mot de passe correspondant à un compte existant
- **THEN** le système ouvre une session et redirige l'utilisateur selon son rôle

#### Scenario: Identifiants invalides

- **WHEN** un utilisateur soumet un e-mail inconnu ou un mot de passe incorrect
- **THEN** le système refuse la connexion et affiche un message d'erreur générique

### Requirement: Session persistante

Le système SHALL conserver la session de l'utilisateur authentifié au rechargement de la page et SHALL la restaurer tant que l'utilisateur ne s'est pas déconnecté.

#### Scenario: Restauration de session

- **WHEN** un utilisateur authentifié recharge l'application
- **THEN** le système restaure sa session et son rôle sans nouvelle saisie d'identifiants

#### Scenario: Déconnexion

- **WHEN** un utilisateur authentifié déclenche la déconnexion
- **THEN** le système met fin à la session et redirige vers la page de connexion

### Requirement: Autorisation par rôle

Le système SHALL réserver l'accès aux fonctionnalités d'administration aux utilisateurs de rôle `ADMIN` et SHALL exiger une authentification pour les fonctionnalités de réservation.

#### Scenario: Accès administrateur autorisé

- **WHEN** un utilisateur de rôle `ADMIN` demande une page d'administration
- **THEN** le système autorise l'accès

#### Scenario: Accès administrateur refusé à un voyageur

- **WHEN** un utilisateur de rôle `VOYAGEUR` demande une page d'administration
- **THEN** le système refuse l'accès et le redirige vers une page autorisée

#### Scenario: Accès anonyme à une action protégée

- **WHEN** un visiteur non authentifié demande une action nécessitant une session
- **THEN** le système le redirige vers la page de connexion
