// test-mysql.js
const mysql = require('mysql2/promise');
require('dotenv').config();

async function testConnection() {
  console.log('🔍 Test de connexion MySQL...');
  console.log('Tentative de connexion avec:');
  console.log(`  - Hôte: ${process.env.DB_HOST}`);
  console.log(`  - Utilisateur: ${process.env.DB_USER}`);
  console.log(`  - Port: ${process.env.DB_PORT || 3306}`);
  
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT || 3306
    });
    
    console.log('✅ Connexion réussie à MySQL!');
    
    // Tester si on peut créer une base de données
    console.log('🔍 Test de création de base de données...');
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
    console.log(`✅ Base de données '${process.env.DB_NAME}' créée ou déjà existante.`);
    
    // Fermer la connexion
    await connection.end();
    console.log('👋 Connexion fermée.');
  } catch (error) {
    console.error('❌ Erreur de connexion:', error);
    
    // Ajouter des conseils spécifiques en fonction du code d'erreur
    if (error.code === 'ECONNREFUSED') {
      console.error('\n🔧 Conseils pour résoudre ECONNREFUSED:');
      console.error('1. Vérifiez que MySQL est installé et en cours d\'exécution');
      console.error('2. Vérifiez que le port MySQL est correct (par défaut 3306)');
      console.error('3. Assurez-vous que le pare-feu ne bloque pas les connexions');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n🔧 Conseils pour résoudre ER_ACCESS_DENIED_ERROR:');
      console.error('1. Vérifiez le nom d\'utilisateur et le mot de passe');
      console.error('2. Assurez-vous que l\'utilisateur a les droits suffisants');
    }
  }
}

testConnection();