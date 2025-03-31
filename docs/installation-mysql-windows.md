# Installation de MySQL sur Windows

Ce guide vous explique comment installer et configurer MySQL sur Windows pour l'application Cartographie de l'écosystème éducatif.

## Prérequis
- Droits d'administrateur sur votre machine Windows
- Connexion internet pour télécharger l'installateur

## Étapes d'installation

### 1. Télécharger l'installateur MySQL

1. Rendez-vous sur [la page de téléchargement MySQL](https://dev.mysql.com/downloads/installer/)
2. Téléchargez la version "MySQL Installer for Windows" (choisissez la version la plus récente)
3. Vous pouvez choisir la version "web" (plus légère) ou "community" (complète)

### 2. Installer MySQL

1. **Lancez l'installateur** téléchargé et acceptez les conditions d'utilisation

2. **Choisissez le type d'installation**
   - Pour une installation standard, choisissez "Developer Default" (recommandé)
   - Pour une installation minimale, choisissez "Server only"

3. **Vérifiez les dépendances** et installez celles qui sont nécessaires

4. **Configurez le serveur MySQL**
   - **Type and Networking** : Gardez les paramètres par défaut (port 3306)
   - **Authentication Method** : Choisissez "Use Strong Password Encryption" (recommandé)
   - **Accounts and Roles** : Définissez un mot de passe root sécurisé et notez-le pour une utilisation ultérieure
   - **Windows Service** : Gardez les paramètres par défaut (démarrage automatique)

5. **Appliquez la configuration** et terminez l'installation

6. Assurez-vous que le service MySQL est bien **démarré** à la fin de l'installation

### 3. Vérifier l'installation

1. Ouvrez l'invite de commande Windows (cmd) ou PowerShell

2. Connectez-vous à MySQL
   ```
   mysql -u root -p
   ```

3. Entrez le mot de passe défini pendant l'installation

4. Si vous voyez l'invite `mysql>`, l'installation est réussie

### 4. Créer la base de données pour le projet

Dans l'invite MySQL, exécutez :

```sql
CREATE DATABASE StageDb;
SHOW DATABASES;  # Pour vérifier que la base a bien été créée
exit;
```

## Utilisation de MySQL Workbench (optionnel)

L'installateur MySQL a probablement installé MySQL Workbench, une interface graphique pour gérer vos bases de données :

1. Lancez MySQL Workbench depuis le menu Démarrer
2. Connectez-vous à l'instance locale (localhost)
3. Vous pouvez exécuter les mêmes commandes SQL que dans l'invite de commande
4. Utilisez l'interface graphique pour explorer et gérer votre base de données

## Commandes utiles pour gérer MySQL sur Windows

| Commande | Description |
|---------|-------------|
| `net start mysql80` | Démarrer le service MySQL (remplacez "mysql80" par le nom exact de votre service) |
| `net stop mysql80` | Arrêter le service MySQL |
| `mysql -u root -p` | Se connecter à MySQL en tant qu'utilisateur root |
| `mysql -u root -p StageDb` | Se connecter directement à la base StageDb |

> **Note** : Vous pouvez également gérer le service MySQL via l'application "Services" de Windows (services.msc).

## Configuration du pare-feu Windows

Si vous rencontrez des problèmes de connexion, vous devrez peut-être configurer le pare-feu Windows :

1. Ouvrez le **Panneau de configuration** > **Système et sécurité** > **Pare-feu Windows Defender**
2. Cliquez sur **Paramètres avancés**
3. Sélectionnez **Règles de trafic entrant** > **Nouvelle règle**
4. Sélectionnez **Port** > **TCP** > entrez le port **3306**
5. Sélectionnez **Autoriser la connexion**
6. Appliquez la règle pour les profils appropriés (Domaine, Privé, Public)
7. Donnez un nom à la règle (par exemple "MySQL Server")

## Résolution des problèmes courants

### Erreur "ER_ACCESS_DENIED_ERROR"

**Problème :** Accès refusé lors de la connexion à MySQL.

**Solutions :**
1. Vérifiez que vous utilisez le bon nom d'utilisateur et mot de passe
2. Assurez-vous que l'utilisateur a les permissions nécessaires

### Service MySQL non démarré

**Problème :** Impossible de se connecter à MySQL.

**Solutions :**
1. Ouvrez l'application "Services" (services.msc)
2. Recherchez le service "MySQL" et vérifiez son état
3. Démarrez le service s'il est arrêté

### Port déjà utilisé

**Problème :** Le port 3306 est déjà utilisé par une autre application.

**Solutions :**
1. Modifiez le port MySQL dans le fichier de configuration (my.ini)
   - Généralement situé dans `C:\ProgramData\MySQL\MySQL Server 8.0\`
   - Modifiez la ligne `port=3306` par `port=3307` (ou un autre port)
2. Redémarrez le service MySQL
3. Mettez à jour votre fichier `.env` avec le nouveau port

## Ressources supplémentaires

- [Documentation officielle MySQL](https://dev.mysql.com/doc/)
- [Guide d'installation détaillé MySQL pour Windows](https://dev.mysql.com/doc/refman/8.0/en/windows-installation.html)
- [MySQL Workbench Manual](https://dev.mysql.com/doc/workbench/en/)