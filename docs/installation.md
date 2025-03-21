# Guide d'installation complet

Ce guide détaille les étapes pour installer et configurer l'application Cartographie de l'écosystème éducatif.

## Sommaire
1. [Prérequis](#prérequis)
2. [Installation de MySQL](#installation-de-mysql)
3. [Installation de l'application](#installation-de-lapplication)
4. [Configuration](#configuration)
5. [Initialisation de la base de données](#initialisation-de-la-base-de-données)
6. [Démarrage de l'application](#démarrage-de-lapplication)
7. [Vérification](#vérification)
8. [Résolution des problèmes courants](#résolution-des-problèmes-courants)

## Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- **Node.js** (v14.x ou supérieur) : [Télécharger Node.js](https://nodejs.org/)
- **npm** (généralement installé avec Node.js)
- **Git** : [Télécharger Git](https://git-scm.com/downloads)
- **MySQL** (v8.x ou supérieur) : [Guide d'installation de MySQL](installation-mysql.md)

## Installation de MySQL

MySQL est la base de données utilisée par l'application. Consultez le guide d'installation spécifique à votre système d'exploitation :

- [Installation de MySQL sur macOS](installation-mysql-macos.md)
- [Installation de MySQL sur Windows](installation-mysql-windows.md)
- [Installation de MySQL sur Linux](installation-mysql-linux.md)

## Installation de l'application

1. **Cloner le dépôt Git**

   ```bash
   git clone [url-du-repo]
   cd [nom-du-repo]
   ```

2. **Installer les dépendances**

   ```bash
   npm install
   ```

## Configuration

L'application utilise des variables d'environnement pour sa configuration. Ces variables sont stockées dans un fichier `.env` qui n'est pas versionné pour des raisons de sécurité.

1. **Créer le fichier `.env`**

   Copiez le fichier `.env.example` et renommez-le en `.env` :

   ```bash
   cp .env.example .env
   ```

2. **Configurer les variables**

   Modifiez le fichier `.env` avec vos paramètres :

   ```bash
   # Configuration du serveur
   PORT=3000
   NODE_ENV=development

   # Configuration de la base de données
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=votre_mot_de_passe
   DB_NAME=StageDb
   DB_PORT=3306

   # Configuration des chemins
   UPLOAD_PATH=./public/logos

   # Configuration de sécurité (pour l'authentification future)
   JWT_SECRET=votre_clef_secrete_tres_longue_et_complexe
   JWT_EXPIRES_IN=24h
   ```

   > **Important :** Remplacez `votre_mot_de_passe` par le mot de passe MySQL que vous avez défini lors de l'installation.

## Initialisation de la base de données

Une fois MySQL installé et configuré, vous devez initialiser la base de données :

```bash
npm run init-db
```

Ce script va :
1. Se connecter à MySQL
2. Créer la base de données si elle n'existe pas
3. Créer la table `entreprises` avec la structure nécessaire

## Démarrage de l'application

Vous avez plusieurs options pour démarrer l'application :

- **Mode production :**
  ```bash
  npm start
  ```

- **Mode développement avec rechargement automatique :**
  ```bash
  npm run dev
  ```

- **Initialisation de la base de données + démarrage :**
  ```bash
  npm run setup
  ```

## Vérification

1. **Vérifier que le serveur est démarré**

   Vous devriez voir dans la console :
   ```
   🚀 Serveur API démarré sur http://localhost:3000
   ```

2. **Accéder aux interfaces**

   - Interface publique : [http://localhost:3000/index.html](http://localhost:3000/index.html)
   - Interface d'administration : [http://localhost:3000/admin.html](http://localhost:3000/admin.html)

## Résolution des problèmes courants

### Problème : Impossible de se connecter à MySQL

**Symptôme :** Message d'erreur `ECONNREFUSED` lors du démarrage.

**Solutions :**
1. Vérifiez que MySQL est bien démarré
2. Vérifiez les informations de connexion dans le fichier `.env`
3. Essayez de vous connecter manuellement à MySQL pour confirmer les identifiants

### Problème : Port déjà utilisé

**Symptôme :** Message d'erreur `EADDRINUSE` lors du démarrage.

**Solution :**
Changez le port dans le fichier `.env` (par exemple, utilisez 3001 au lieu de 3000).

### Problème : Module non trouvé

**Symptôme :** Message d'erreur `Cannot find module 'xxx'`.

**Solution :**
```bash
npm install
```

Pour d'autres problèmes, consultez la [FAQ](faq.md) ou ouvrez une issue sur le dépôt Git.