# Installation de MySQL sur macOS

Ce guide vous explique comment installer et configurer MySQL sur macOS pour l'application Cartographie de l'écosystème éducatif.

## Prérequis
- [Homebrew](https://brew.sh/) (gestionnaire de paquets pour macOS)
- Terminal macOS

## Étapes d'installation

### 1. Installer Homebrew (si vous ne l'avez pas déjà)

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

Suivez les instructions à l'écran pour terminer l'installation.

### 2. Installer MySQL via Homebrew

```bash
brew install mysql
```

L'installation peut prendre quelques minutes.

### 3. Démarrer le service MySQL

```bash
brew services start mysql
```

Vous devriez voir une confirmation : `Successfully started 'mysql'`

### 4. Sécuriser l'installation de MySQL

```bash
mysql_secure_installation
```

Suivez les étapes du processus interactif :
- Choisissez le niveau de complexité du mot de passe (recommandé : moyen ou fort)
- Définissez un mot de passe pour l'utilisateur root
- Supprimez les utilisateurs anonymes (répondez "Y")
- Désactivez la connexion root à distance (répondez "Y")
- Supprimez la base de données de test (répondez "Y")
- Rechargez les privilèges (répondez "Y")

### 5. Vérifier que MySQL fonctionne correctement

```bash
mysql -u root -p
```

Saisissez le mot de passe root que vous venez de configurer. Vous devriez voir l'invite MySQL (`mysql>`).

### 6. Créer la base de données pour le projet

Dans l'invite MySQL, exécutez :

```sql
CREATE DATABASE StageDb;
SHOW DATABASES;  # Pour vérifier que la base a bien été créée
exit;
```

## Commandes utiles pour gérer MySQL sur macOS

| Commande | Description |
|---------|-------------|
| `brew services start mysql` | Démarrer MySQL |
| `brew services stop mysql` | Arrêter MySQL |
| `brew services restart mysql` | Redémarrer MySQL |
| `brew services list` | Vérifier l'état des services Homebrew |
| `mysql -u root -p` | Se connecter à MySQL en tant qu'utilisateur root |
| `mysql -u root -p StageDb` | Se connecter directement à la base StageDb |

## Résolution des problèmes courants

### Erreur "ECONNREFUSED"

**Problème :** L'application ne peut pas se connecter à MySQL.

**Solutions :**
1. Vérifiez que MySQL est bien démarré avec `brew services list`
2. Vérifiez le port utilisé (par défaut 3306)

### Mot de passe oublié

Si vous avez oublié le mot de passe root MySQL :

1. Arrêtez MySQL
   ```bash
   brew services stop mysql
   ```

2. Démarrez MySQL en mode sans authentification
   ```bash
   mysql.server start --skip-grant-tables
   ```

3. Connectez-vous sans mot de passe
   ```bash
   mysql -u root
   ```

4. Réinitialisez le mot de passe
   ```sql
   FLUSH PRIVILEGES;
   ALTER USER 'root'@'localhost' IDENTIFIED BY 'nouveau_mot_de_passe';
   exit;
   ```

5. Redémarrez MySQL normalement
   ```bash
   mysql.server stop
   brew services start mysql
   ```

### Port occupé

Si le port 3306 est déjà utilisé, vous pouvez modifier le port MySQL :

1. Modifiez le fichier de configuration MySQL
   ```bash
   sudo nano /usr/local/etc/my.cnf
   ```

2. Ajoutez ou modifiez la ligne suivante
   ```
   port=3307
   ```

3. Redémarrez MySQL
   ```bash
   brew services restart mysql
   ```

4. Mettez à jour votre fichier `.env` avec le nouveau port

## Ressources supplémentaires

- [Documentation officielle MySQL](https://dev.mysql.com/doc/)
- [Guide Homebrew pour MySQL](https://formulae.brew.sh/formula/mysql)