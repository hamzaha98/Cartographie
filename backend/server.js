const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');
const { initializeDatabase } = require('./init-db');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// ✅ Correction : Servir les logos depuis /logos (à la racine du projet)
app.use('/logos', express.static(path.join(__dirname, '../logos')));

// ✅ Correction : Servir les fichiers statiques HTML, CSS, JS depuis le dossier frontend
app.use('/frontend', express.static(path.join(__dirname, '../frontend'))); 

// 📌 Configuration de la connexion à la base de données
const pool = mysql.createPool({
  host: process.env.DB_HOST,      
  user: process.env.DB_USER,          
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306
}).promise();

// 📌 Route pour récupérer toutes les entreprises
app.get('/entreprises', async (req, res) => {
  try {
    const [results] = await pool.query('SELECT * FROM entreprises');
    res.json(results);
  } catch (error) {
    console.error('Erreur SQL:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des entreprises.' });
  }
});

// 📌 Route pour rechercher une entreprise par mot-clé
app.get('/search', async (req, res) => {
  const searchTerm = req.query.q;  
  if (!searchTerm) {
    return res.status(400).json({ error: "Veuillez entrer un terme de recherche." });
  }

  try {
    const query = `
      SELECT * FROM entreprises 
      WHERE LOWER(nom) LIKE LOWER(?) 
      OR LOWER(descriptif) LIKE LOWER(?) 
      OR LOWER(mots_cles) LIKE LOWER(?)
    `;
    const [results] = await pool.query(query, [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`]);
    res.json(results);
  } catch (error) {
    console.error('Erreur SQL:', error);
    res.status(500).json({ error: 'Erreur lors de la recherche.' });
  }
});

// 📌 Route pour récupérer une entreprise par ID
app.get('/entreprises/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [results] = await pool.query('SELECT * FROM entreprises WHERE id = ?', [id]);
    if (results.length === 0) {
      return res.status(404).json({ error: "Entreprise non trouvée." });
    }
    res.json(results[0]);
  } catch (error) {
    console.error('Erreur SQL:', error);
    res.status(500).json({ error: "Erreur lors de la récupération de l'entreprise." });
  }
});

// 📌 Route pour ajouter une entreprise
app.post('/entreprises', async (req, res) => {
  const { nom, logo, descriptif, lien_du_site, categorie, mots_cles, lieu } = req.body;

  if (!nom) {
    return res.status(400).json({ error: "Veuillez fournir un nom pour l'entreprise." });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO entreprises (nom, logo, descriptif, lien_du_site, categorie, mots_cles, lieu) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [nom, logo, descriptif, lien_du_site, categorie, mots_cles, lieu]
    );
    res.status(201).json({ 
      id: result.insertId, 
      nom, 
      logo: `/logos/${categorie}/${logo}`, 
      descriptif, 
      lien_du_site, 
      categorie, 
      mots_cles, 
      lieu 
    });
  } catch (error) {
    console.error('Erreur SQL:', error);
    res.status(500).json({ error: "Erreur lors de l'ajout de l'entreprise." });
  }
});

// 📌 Route pour supprimer une entreprise par ID (DELETE)
app.delete('/entreprises/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query('DELETE FROM entreprises WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Entreprise non trouvée." });
    }

    res.json({ message: "Entreprise supprimée avec succès !" });
  } catch (error) {
    console.error('🔥 ERREUR SQL:', error);
    res.status(500).json({ error: "Erreur lors de la suppression." });
  }
});

// 📌 Route pour modifier une entreprise par ID (PUT)
app.put('/entreprises/:id', async (req, res) => {
  const { id } = req.params;
  const { nom, logo, descriptif, lien_du_site, categorie, mots_cles, lieu } = req.body;

  if (!nom) {
      return res.status(400).json({ error: "Le champ 'nom' est obligatoire." });
  }

  try {
      const [result] = await pool.query(
          `UPDATE entreprises 
           SET nom = ?, logo = ?, descriptif = ?, lien_du_site = ?, categorie = ?, mots_cles = ?, lieu = ?
           WHERE id = ?`,
          [nom, logo, descriptif, lien_du_site, categorie, mots_cles, lieu, id]
      );

      if (result.affectedRows === 0) {
          return res.status(404).json({ error: "Entreprise non trouvée." });
      }

      res.json({ message: "Entreprise modifiée avec succès !" });
  } catch (error) {
      console.error('🔥 ERREUR SQL:', error);
      res.status(500).json({ error: "Erreur lors de la modification." });
  }
});

// 📌 Démarrer le serveur
async function startServer() {
  try {
    await initializeDatabase();

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`🚀 Interface publique : http://localhost:${PORT}/frontend/user/index.html`);
      console.log(`🚀 Interface admin : http://localhost:${PORT}/frontend/admin/index.html`);
    });
  } catch (error) {
    console.error('❌ Erreur au démarrage du serveur:', error);
  }
}

startServer();
