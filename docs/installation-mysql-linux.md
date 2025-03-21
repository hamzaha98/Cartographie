# Installation de MySQL sur Linux

Ce guide vous explique comment installer et configurer MySQL sur les distributions Linux les plus courantes pour l'application Cartographie de l'écosystème éducatif.

## Sommaire
- [Installation sur Ubuntu/Debian](#installation-sur-ubuntudebian)
- [Installation sur Fedora/Red Hat/CentOS](#installation-sur-fedorared-hatcentos)
- [Configuration post-installation](#configuration-post-installation)
- [Création de la base de données](#création-de-la-base-de-données)
- [Résolution des problèmes courants](#résolution-des-problèmes-courants)

## Installation sur Ubuntu/Debian

### 1. Mettre à jour les paquets

```bash
sudo apt update
sudo apt upgrade
```

### 2. Installer MySQL Server

```bash
sudo apt install mysql-server
```

### 3. Vérifier l'état du service

```bash
sudo systemctl status mysql
```

Si le service n'est pas démarré automatiquement :

```bash
sudo systemctl start mysql
```

### 4. Activer le démarrage automatique

```bash
sudo systemctl enable mysql
```

## Installation sur Fedora/Red Hat/CentOS

### 1. Mettre à jour les paquets

```bash
sudo dnf update
```

### 2. Installer MySQL Server

Pour Fedora :
```bash
sudo dnf install @mysql
```

Pour RHEL/CentOS 8 ou supérieur :
```bash
sudo dnf install mysql-server
```

Pour RHEL/CentOS 7 :
```bash
sudo yum install mysql-server
```

### 3. Démarrer et activer le service

```bash
sudo systemctl start mysqld
sudo systemctl enable mysqld
```

### 4. Vérifier l'état du service

```bash
sudo systemctl status mysqld
```

## Configuration post-installation

### 1. Sécuriser l'installation

Pour toutes les distributions Linux, exécutez le script de sécurisation :

```bash
sudo mysql_secure_installation
```

Ce script interactif vous guidera à travers les étapes suivantes :
- Configuration du plugin de validation du mot de passe (recommandé)
- Définition d'un mot de passe root
- Suppression des utilisateurs anonymes
- Désactivation de la connexion root à distance
- Suppression de la base de données test
- Rechargement des privilèges

### 2. Se connecter à MySQL

```bash
sudo mysql -u root -p
```

Ou si l'authentification utilise le plugin socket pour l'utilisateur root (cas par défaut sur Ubuntu) :

```bash
sudo mysql
```

## Création de la base de données

Dans l'invite MySQL, exécutez :

```sql
CREATE DATABASE StageDb;
SHOW DATABASES;  # Pour vérifier que la base a bien été créée
exit;
```

## Création d'un utilisateur dédié (recommandé)

Il est recommandé de créer un utilisateur spécifique pour l'application plutôt que d'utiliser root :

```sql
CREATE USER 'stageapp'@'localhost' IDENTIFIED BY 'mot_de_passe_securise';
GRANT ALL PRIVILEGES ON StageDb.* TO 'stageapp'@'localhost';
FLUSH PRIVILEGES;
```

N'oubliez pas de mettre à jour le fichier `.env` avec ces nouvelles informations d'identification.

## Commandes utiles pour gérer MySQL sur Linux

| Commande | Description |
|---------|-------------|
| `sudo systemctl start mysql` | Démarrer MySQL (Ubuntu/Debian) |
| `sudo systemctl start mysqld` | Démarrer MySQL (RHEL/CentOS/Fedora) |
| `sudo systemctl stop mysql` | Arrêter MySQL (Ubuntu/Debian) |
| `sudo systemctl stop mysqld` | Arrêter MySQL (RHEL/CentOS/Fedora) |
| `sudo systemctl restart mysql` | Redémarrer MySQL (Ubuntu/Debian) |
| `sudo systemctl restart mysqld` | Redémarrer MySQL (RHEL/CentOS/Fedora) |
| `sudo systemctl status mysql` | Vérifier l'état (Ubuntu/Debian) |
| `sudo systemctl status mysqld` | Vérifier l'état (RHEL/CentOS/Fedora) |
| `mysql -u root -p` | Se connecter en tant que root avec mot de passe |
| `sudo mysql` | Se connecter en tant que root via socket (Ubuntu) |

## Configuration du pare-feu

Si vous utilisez un pare-feu, vous devrez peut-être l'ouvrir pour les connexions MySQL :

### UFW (Ubuntu)

```bash
sudo ufw allow mysql
```

### Firewalld (Fedora/RHEL/CentOS)

```bash
sudo firewall-cmd --permanent --add-service=mysql
sudo firewall-cmd --reload
```

## Modifier la configuration MySQL

Le fichier de configuration principal est généralement situé à :
- Ubuntu/Debian : `/etc/mysql/mysql.conf.d/mysqld.cnf`
- RHEL/CentOS/Fedora : `/etc/my.cnf` ou `/etc/my.cnf.d/mysql-server.cnf`

Pour modifier la configuration (par exemple, changer le port) :

```bash
sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf
```

Après toute modification, redémarrez MySQL :

```bash
sudo systemctl restart mysql
```

## Résolution des problèmes courants

### Problème : Connexion refusée

**Symptôme :** L'application affiche une erreur "Connection refused".

**Solutions :**
1. Vérifiez que MySQL est bien démarré : `sudo systemctl status mysql`
2. Vérifiez la configuration du pare-feu
3. Vérifiez que MySQL écoute sur le bon port : `sudo netstat -tunlp | grep mysql`

### Problème : Accès refusé

**Symptôme :** Erreur "Access denied for user..."

**Solutions :**
1. Vérifiez les informations d'identification dans le fichier `.env`
2. Vérifiez les privilèges de l'utilisateur dans MySQL :
   ```sql
   SELECT user, host FROM mysql.user;
   SHOW GRANTS FOR 'user'@'localhost';
   ```

### Problème : MySQL utilise trop de mémoire

**Solutions :**
1. Modifiez les paramètres de performance dans le fichier de configuration
   ```
   # Réduire l'utilisation de la mémoire
   innodb_buffer_pool_size = 128M
   ```
2. Redémarrez MySQL après la modification

## Pour aller plus loin

### Surveillance de MySQL

Pour surveiller les performances MySQL :

```bash
sudo apt install mytop  # Sur Ubuntu/Debian
```

Puis lancez :

```bash
mytop -u root -p
```

### Sauvegarde et restauration

Sauvegarde :
```bash
mysqldump -u root -p StageDb > backup.sql
```

Restauration :
```bash
mysql -u root -p StageDb < backup.sql
```

## Ressources supplémentaires

- [Documentation officielle MySQL](https://dev.mysql.com/doc/)
- [Documentation Ubuntu pour MySQL](https://help.ubuntu.com/lts/serverguide/mysql.html)
- [Documentation RHEL pour MySQL](https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/8/html/deploying_different_types_of_servers/using-mysql_deploying-different-types-of-servers)