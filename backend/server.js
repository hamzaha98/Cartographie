const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');
const { initializeDatabase } = require('./init-db');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// ✅ Servir les logos
app.use('/logos', express.static(path.join(__dirname, '../logos')));

// 📌 Configuration de la base de données
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306
}).promise();

// 📌 GET toutes les entreprises
app.get('/entreprises', async (req, res) => {
  try {
    const [results] = await pool.query('SELECT * FROM entreprises');
    res.json(results);
  } catch (error) {
    console.error('Erreur SQL:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des entreprises.' });
  }
});

// 📌 Recherche par mot-clé
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

// 📌 GET entreprise par ID
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

// 📌 POST ajouter une entreprise (✅ corrigée avec setHeader)
app.post('/entreprises', async (req, res) => {
  const { nom, logo, descriptif, lien_du_site, categorie, mots_cles, lieu } = req.body;

  if (!nom) {
    return res.status(400).json({ success: false, error: "Veuillez fournir un nom pour l'entreprise." });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO entreprises (nom, logo, descriptif, lien_du_site, categorie, mots_cles, lieu) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [nom, logo, descriptif, lien_du_site, categorie, mots_cles, lieu]
    );

    const newEntreprise = {
      id: result.insertId,
      nom,
      logo: `/logos/${categorie}/${logo}`,
      descriptif,
      lien_du_site,
      categorie,
      mots_cles,
      lieu
    };

    // ✅ Ajout du Content-Type explicite
    res.setHeader('Content-Type', 'application/json');
    res.status(201).json({
      success: true,
      message: "Entreprise ajoutée avec succès.",
      entreprise: newEntreprise
    });

  } catch (error) {
    console.error('Erreur SQL:', error);
    res.status(500).json({ success: false, error: "Erreur lors de l'ajout de l'entreprise." });
  }
});

// 📌 DELETE entreprise
app.delete('/entreprises/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query('DELETE FROM entreprises WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Entreprise non trouvée." });
    }

    res.json({ success: true, message: "Entreprise supprimée avec succès !" });
  } catch (error) {
    console.error('🔥 ERREUR SQL:', error);
    res.status(500).json({ success: false, error: "Erreur lors de la suppression." });
  }
});

// 📌 PUT modifier une entreprise
app.put('/entreprises/:id', async (req, res) => {
  const { id } = req.params;
  const { nom, logo, descriptif, lien_du_site, categorie, mots_cles, lieu } = req.body;

  if (!nom) {
    return res.status(400).json({ success: false, error: "Le champ 'nom' est obligatoire." });
  }

  try {
    const [result] = await pool.query(
      `UPDATE entreprises 
       SET nom = ?, logo = ?, descriptif = ?, lien_du_site = ?, categorie = ?, mots_cles = ?, lieu = ?
       WHERE id = ?`,
      [nom, logo, descriptif, lien_du_site, categorie, mots_cles, lieu, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: "Entreprise non trouvée." });
    }

    res.json({ success: true, message: "Entreprise modifiée avec succès !" });
  } catch (error) {
    console.error('🔥 ERREUR SQL:', error);
    res.status(500).json({ success: false, error: "Erreur lors de la modification." });
  }
});

// 📌 Lancer le serveur
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
