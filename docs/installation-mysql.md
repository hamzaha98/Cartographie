# Installation de MySQL

Ce document centralise les informations pour installer MySQL sur différents systèmes d'exploitation. MySQL est la base de données utilisée par l'application Cartographie de l'écosystème éducatif.

## Choisissez votre système d'exploitation

Suivez le guide correspondant à votre système d'exploitation :

- [Installation sur macOS](installation-mysql-macos.md)
- [Installation sur Windows](installation-mysql-windows.md)
- [Installation sur Linux](installation-mysql-linux.md)

## Prérequis généraux

Quelle que soit votre plateforme, vous aurez besoin de :

- 512 Mo de RAM minimum (1 Go recommandé)
- 2 Go d'espace disque pour l'installation
- Droits administrateur sur votre machine

## Vérification de l'installation

Après l'installation, vérifiez que MySQL fonctionne correctement en vous connectant :

```bash
mysql -u root -p
```

Entrez le mot de passe défini pendant l'installation. Si vous voyez l'invite `mysql>`, l'installation est réussie.

## Configuration pour l'application

Une fois MySQL installé et fonctionnel, vous devez :

1. Créer la base de données pour