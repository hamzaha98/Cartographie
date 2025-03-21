# Cartographie de l'écosystème éducatif - Créativité Québec

Une application web pour cartographier et gérer les organisations de l'écosystème éducatif québécois.

## 📋 Description

Ce projet est une application web qui permet de visualiser et gérer une base de données d'organisations liées à l'écosystème éducatif québécois. L'application comporte deux interfaces principales :

1. **Interface publique** : Permet aux utilisateurs de consulter les différentes organisations par catégorie et d'effectuer des recherches.
2. **Interface d'administration** : Permet aux administrateurs d'ajouter, modifier et supprimer des organisations dans la base de données.

## 🚀 Fonctionnalités

### Interface publique
- Recherche d'organisations par mot-clé
- Filtrage par catégorie
- Affichage des informations détaillées (logo, nom, description, lien du site)
- Interface responsive

### Interface d'administration
- Ajout de nouvelles organisations
- Modification des organisations existantes
- Suppression d'organisations
- Tableau de gestion avec aperçu des organisations

## 🛠️ Technologies utilisées

- **Frontend** : HTML5, CSS3, JavaScript (Vanilla), Bootstrap 5.3
- **Backend** : Node.js, Express.js, MySQL / MySQL2

## 🚀 Installation rapide

### Prérequis
- Node.js
- MySQL

### Installation basique

1. **Cloner le projet**
   ```bash
   git clone [url-du-repo]
   cd [nom-du-repo]
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configurer le fichier `.env`**
   ```bash
   # Copier le fichier exemple
   cp .env.example .env
   # Modifier les valeurs selon votre environnement
   ```

4. **Initialiser la base de données et démarrer le serveur**
   ```bash
   npm run setup
   ```

5. **Accéder à l'application**
- Interface publique : http://localhost:3000/frontend/user/index.html
- Interface d'administration : http://localhost:3000/frontend/admin/index.html

Pour des instructions détaillées, consultez les guides dans le dossier [docs/](docs/):

- [Guide d'installation complet](docs/installation.md)
- [Installation de MySQL par système d'exploitation](docs/installation-mysql.md)
- [Documentation de l'API](docs/api.md)
- [Guide de déploiement](docs/deployment.md)
- [Structure détaillée de la base de données](docs/database.md)

## 📦 Structure du projet

```
projet/
├── backend/              # Code serveur
│   ├── init-db.js        # Script d'initialisation de la base de données
│   ├── server.js         # Serveur API Express
│   └── test-mysql.js     # Script de test de connexion MySQL
├── frontend/             # Interface utilisateur
│   ├── admin/            # Interface d'administration
│   │   ├── admin.js      # Logique d'administration
│   │   └── index.html    # Page d'administration
│   └── user/             # Interface publique
│       ├── index.html    # Page principale
│       ├── script.js     # Logique de l'interface publique
│       └── styles.css    # Styles CSS
├── public/               # Ressources statiques
│   └── logos/            # Logos des organisations
├── docs/                 # Documentation
├── package.json          # Dépendances et scripts
├── .env.example          # Exemple de variables d'environnement
└── .gitignore            # Fichiers à ignorer dans Git
```

## 📝 Auteurs
- Équipe de développement - Collège de Bois-de-Boulogne

## 📄 Licence
Ce projet est sous licence MIT.