const mysql = require('mysql2/promise');
require('dotenv').config();

async function initializeDatabase() {
  console.log('🔄 Initialisation de la base de données...');
  
  // Afficher les paramètres de connexion (sans le mot de passe pour des raisons de sécurité)
  console.log('Tentative de connexion avec:', {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    port: process.env.DB_PORT || 3306
  });

  try {
    // Connexion à MySQL sans spécifier de base de données
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT || 3306
    });
  
    try {
      // Créer la base de données si elle n'existe pas
      console.log('👉 Création de la base de données si nécessaire...');
      await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
      
      // Utiliser la base de données
      await connection.query(`USE ${process.env.DB_NAME}`);
      
      // Créer la table entreprises_new si elle n'existe pas
      await connection.query(`
        CREATE TABLE IF NOT EXISTS entreprises_new (
          id INT AUTO_INCREMENT PRIMARY KEY,
          nom VARCHAR(255) NOT NULL,
          logo VARCHAR(255),
          descriptif TEXT,
          lien_du_site VARCHAR(255),
          mots_cles VARCHAR(255),
          lieu VARCHAR(255),
          latitude DECIMAL(10, 8),
          longitude DECIMAL(11, 8),
          date_creation DATE,
          public_cible VARCHAR(255),
          format VARCHAR(255),
          type_acteur VARCHAR(255)
        )
      `);
      
      // Créer la table categories si elle n'existe pas
      await connection.query(`
        CREATE TABLE IF NOT EXISTS categories (
          id INT AUTO_INCREMENT PRIMARY KEY,
          nom VARCHAR(255) NOT NULL UNIQUE
        )
      `);
      
      // Créer la table entreprise_categories si elle n'existe pas
      await connection.query(`
        CREATE TABLE IF NOT EXISTS entreprise_categories (
          id INT AUTO_INCREMENT PRIMARY KEY,
          entreprise_id INT NOT NULL,
          categorie_id INT NOT NULL,
          FOREIGN KEY (entreprise_id) REFERENCES entreprises_new(id) ON DELETE CASCADE,
          FOREIGN KEY (categorie_id) REFERENCES categories(id) ON DELETE CASCADE,
          UNIQUE KEY unique_entreprise_categorie (entreprise_id, categorie_id)
        )
      `);
      
      // // Créer la table utilisateurs si elle n'existe pas(pour la table d'administrar)
      // console.log('👉 Création de la table utilisateurs si nécessaire...');
      // await connection.query(`
      //   CREATE TABLE IF NOT EXISTS utilisateurs (
      //     id INT AUTO_INCREMENT PRIMARY KEY,
      //     username VARCHAR(255) NOT NULL UNIQUE,
      //     password VARCHAR(255) NOT NULL
      //   )
      // `);
      
      console.log('✅ Initialisation de la base de données terminée avec succès !');
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation de la base de données:', error);
    } finally {
      // Fermer la connexion
      await connection.end();
    }
  } 
  catch (error) {
    console.error('❌ Erreur détaillée lors de la connexion:', error);
    process.exit(1);
  }
}

// Exécuter la fonction si le script est lancé directement
if (require.main === module) {
  initializeDatabase();
} 

// Exporter la fonction pour l'utiliser ailleurs si nécessaire
module.exports = { initializeDatabase };