const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');
const { initializeDatabase } = require('./init-db');
require('dotenv').config();

// 📋 Simple audit log (fichier texte)
const fs = require('fs');
const logPath = path.join(__dirname, '../logs/audit.log');

function logAction(action, entreprise, user = "admin") {
  console.log("📢 logAction appelée:", action, entreprise.nom); // 🐞 debug log

  const lines = [`[${new Date().toISOString()}] ${user} a effectué: ${action} sur "${entreprise.nom}" (ID: ${entreprise.id || 'nouveau'})`];

  if (action === "Création") {
    lines.push(`  ➕ Données: ${JSON.stringify(entreprise)}`);
  }

  const logEntry = lines.join('\n') + '\n';
  fs.mkdirSync(path.dirname(logPath), { recursive: true });
  fs.appendFileSync(logPath, logEntry);
}

const app = express();
app.use(express.json());
app.use(cors());

app.use('/logos', express.static(path.join(__dirname, '../logos')));
app.use('/frontend', express.static(path.join(__dirname, '../frontend')));

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306
}).promise();

// ✅ Middleware de vérification d'authentification admin
function checkAdminAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader === 'Bearer admin123') {
    next();
  } else {
    res.status(401).json({ error: "Non autorisé" });
  }
}

app.get('/entreprises', async (req, res) => {
  try {
    const [results] = await pool.query('SELECT * FROM entreprises');
    res.json(results);
  } catch (error) {
    console.error('Erreur SQL:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des entreprises.' });
  }
});

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

app.get('/config/api-key', (req, res) => {
  res.json({ key: process.env.GOOGLE_MAPS_API_KEY });
});

app.get('/maptiler-key', (req, res) => {
  res.json({ key: process.env.MAPTILER_API_KEY });
});

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

// 🔒 Protéger la création d'une entreprise
app.post('/entreprises', checkAdminAuth, async (req, res) => {
  const { nom, logo, descriptif, lien_du_site, categorie, mots_cles, lieu } = req.body;
  if (!nom) {
    return res.status(400).json({ error: "Veuillez fournir un nom pour l'entreprise." });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO entreprises (nom, logo, descriptif, lien_du_site, categorie, mots_cles, lieu) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [nom, logo, descriptif, lien_du_site, categorie, mots_cles, lieu]
    );
    // 📋 Enregistrer l'action dans le journal
    logAction("Création", {
      nom,
      logo,
      descriptif,
      lien_du_site,
      categorie,
      mots_cles,
      lieu,
      id: result.insertId
    });
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

// 🔒 Protéger la suppression d'une entreprise
app.delete('/entreprises/:id', checkAdminAuth, async (req, res) => {
  const { id } = req.params;

  try {
    // 🔍 Récupérer nom avant suppression
    const [old] = await pool.query('SELECT nom FROM entreprises WHERE id = ?', [id]);

    const [result] = await pool.query('DELETE FROM entreprises WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Entreprise non trouvée." });
    }

    // 📋 Journaliser la suppression si entreprise existait
    if (old.length > 0) {
      logAction("Suppression", { nom: old[0].nom, id });
    }

    res.json({ message: "Entreprise supprimée avec succès !" });

  } catch (error) {
    console.error('🔥 ERREUR SQL:', error);
    res.status(500).json({ error: "Erreur lors de la suppression." });
  }
});


// 🔒 Protéger la modification d'une entreprise
app.put('/entreprises/:id', checkAdminAuth, async (req, res) => {
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
    // 📋 Journaliser la modification
    logAction("Modification", {
      id,
      nom,
      logo,
      descriptif,
      lien_du_site,
      categorie,
      mots_cles,
      lieu
    });
    res.json({ message: "Entreprise modifiée avec succès !" });
  } catch (error) {
    console.error('🔥 ERREUR SQL:', error);
    res.status(500).json({ error: "Erreur lors de la modification." });
  }
});

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
