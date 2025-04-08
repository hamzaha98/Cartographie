// ✅ server.js complet — version adaptée aux tables entreprises_new, categories, entreprise_categories

const express = require('express');
const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const dotenv = require('dotenv');
const { initializeDatabase } = require('./init-db');
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('frontend'));
app.use(express.static('public'));
// Chemin de logos simplifié (sans sous-dossier par catégorie)
app.use('/logos', express.static(path.join(__dirname, '../logos')));
app.use('/frontend', express.static(path.join(__dirname, '../frontend')));

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME
});

function logAction(action, details) {
  const timestamp = new Date().toISOString();
  const ligne = `[${timestamp}] ${action} : ${details}\n`;
  fs.appendFile('admin-actions.log', ligne, err => {
    if (err) console.error('Erreur de journalisation :', err);
  });
}

// 🔍 Liste des catégories disponibles
app.get('/categories', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM categories ORDER BY nom ASC');
    res.json(rows);
  } catch (error) {
    console.error("Erreur lors de la récupération des catégories :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// 🔍 Liste des entreprises avec catégories (many-to-many)
app.get('/entreprises', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        e.*, 
        GROUP_CONCAT(c.nom SEPARATOR ', ') AS categories
      FROM entreprises_new e
      LEFT JOIN entreprise_categories ec ON e.id = ec.entreprise_id
      LEFT JOIN categories c ON ec.categorie_id = c.id
      GROUP BY e.id
      ORDER BY e.nom ASC
    `);
    res.json(rows);
  } catch (error) {
    console.error("Erreur lors de la récupération des entreprises :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// 🔍 Recherche
app.get('/search', async (req, res) => {
  const terme = `%${req.query.q || ''}%`;
  try {
    const [results] = await pool.query(`
      SELECT 
        e.id, e.nom, e.logo, e.descriptif, e.lien_du_site, e.mots_cles, e.lieu, 
        e.latitude, e.longitude, e.date_creation,
        e.public_cible, e.format, e.type_acteur,
        GROUP_CONCAT(c.nom SEPARATOR ', ') AS categorie
      FROM entreprises_new e
      LEFT JOIN entreprise_categories ec ON e.id = ec.entreprise_id
      LEFT JOIN categories c ON ec.categorie_id = c.id
      WHERE e.nom LIKE ? OR e.descriptif LIKE ? OR e.mots_cles LIKE ?
      GROUP BY e.id
    `, [terme, terme, terme]);
    res.json(results);
  } catch (error) {
    console.error('Erreur SQL /search:', error);
    res.status(500).json({ error: 'Erreur lors de la recherche.' });
  }
});

// 🔍 Détails d'une entreprise
app.get('/entreprises/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const [results] = await pool.query(`
      SELECT 
        e.*, 
        GROUP_CONCAT(c.nom SEPARATOR ', ') AS categorie
      FROM entreprises_new e
      LEFT JOIN entreprise_categories ec ON e.id = ec.entreprise_id
      LEFT JOIN categories c ON ec.categorie_id = c.id
      WHERE e.id = ?
      GROUP BY e.id
    `, [id]);
    if (results.length === 0) {
      return res.status(404).json({ error: 'Entreprise non trouvée' });
    }
    res.json(results[0]);
  } catch (error) {
    console.error('Erreur SQL /entreprises/:id:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ➕ Ajouter une entreprise (et ses catégories)
app.post('/entreprises', async (req, res) => {
  const { nom, logo, descriptif, lien_du_site, mots_cles, lieu, latitude, longitude, date_creation, public_cible, format, type_acteur, categories } = req.body;
  
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    // Insertion de l'entreprise
    const [result] = await connection.query(`
      INSERT INTO entreprises_new (nom, logo, descriptif, lien_du_site, mots_cles, lieu, latitude, longitude, date_creation, public_cible, format, type_acteur)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [nom, logo, descriptif, lien_du_site, mots_cles, lieu, latitude, longitude, date_creation, public_cible, format, type_acteur]);

    const entrepriseId = result.insertId;

    // Association des catégories
    if (Array.isArray(categories) && categories.length > 0) {
      for (const nomCategorie of categories) {
        const [cat] = await connection.query('SELECT id FROM categories WHERE nom = ?', [nomCategorie]);
        if (cat.length) {
          await connection.query('INSERT INTO entreprise_categories (entreprise_id, categorie_id) VALUES (?, ?)', [entrepriseId, cat[0].id]);
        }
      }
    }

    await connection.commit();
    logAction('Ajout', nom);
    res.json({ success: true });
  } catch (error) {
    await connection.rollback();
    console.error('Erreur SQL POST /entreprises:', error);
    res.status(500).json({ error: 'Erreur lors de l\'ajout.' });
  } finally {
    connection.release();
  }
});

// ✏️ Modifier une entreprise
app.put('/entreprises/:id', async (req, res) => {
  const id = req.params.id;
  const { nom, logo, descriptif, lien_du_site, mots_cles, lieu, latitude, longitude, date_creation, public_cible, format, type_acteur, categories } = req.body;
  
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    // Mise à jour de l'entreprise
    await connection.query(`
      UPDATE entreprises_new SET nom=?, logo=?, descriptif=?, lien_du_site=?, mots_cles=?, lieu=?, latitude=?, longitude=?, date_creation=?, public_cible=?, format=?, type_acteur=?
      WHERE id=?
    `, [nom, logo, descriptif, lien_du_site, mots_cles, lieu, latitude, longitude, date_creation, public_cible, format, type_acteur, id]);

    // Mise à jour des catégories
    await connection.query('DELETE FROM entreprise_categories WHERE entreprise_id = ?', [id]);
    
    if (Array.isArray(categories) && categories.length > 0) {
      for (const nomCategorie of categories) {
        const [cat] = await connection.query('SELECT id FROM categories WHERE nom = ?', [nomCategorie]);
        if (cat.length) {
          await connection.query('INSERT INTO entreprise_categories (entreprise_id, categorie_id) VALUES (?, ?)', [id, cat[0].id]);
        }
      }
    }

    await connection.commit();
    logAction('Modification', nom);
    res.json({ success: true });
  } catch (error) {
    await connection.rollback();
    console.error('Erreur SQL PUT /entreprises/:id:', error);
    res.status(500).json({ error: 'Erreur lors de la modification.' });
  } finally {
    connection.release();
  }
});

// ❌ Supprimer une entreprise
app.delete('/entreprises/:id', async (req, res) => {
  const id = req.params.id;
  
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    // Supprimer d'abord les liens vers les catégories
    await connection.query('DELETE FROM entreprise_categories WHERE entreprise_id = ?', [id]);
    
    // Puis supprimer l'entreprise
    await connection.query('DELETE FROM entreprises_new WHERE id = ?', [id]);
    
    await connection.commit();
    logAction('Suppression', `Entreprise ID ${id}`);
    res.json({ success: true });
  } catch (error) {
    await connection.rollback();
    console.error('Erreur SQL DELETE /entreprises/:id:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression.' });
  } finally {
    connection.release();
  }
});

// // 🔐 Authentification simplifiée pour accès admin (version test)
// app.post('/login', async (req, res) => {
//   const { username, password } = req.body;
//   try {
//     const [results] = await pool.query('SELECT * FROM utilisateurs WHERE username = ? AND password = ?', [username, password]);
//     if (results.length === 1) {
//       res.json({ success: true, message: 'Connexion réussie' });
//     } else {
//       res.status(401).json({ success: false, message: 'Identifiants invalides' });
//     }
//   } catch (error) {
//     console.error('Erreur SQL /login:', error);
//     res.status(500).json({ error: 'Erreur de connexion' });
//   }
// });

// // 🔑 Clés API exposées pour usage client (optionnel)
// app.get('/config/api-key', (req, res) => {
//   res.json({ apiKey: process.env.API_KEY || '' });
// });

// app.get('/config/maptiler-key', (req, res) => {
//   res.json({ key: process.env.MAPTILER_KEY || '' });
// });

// 🧪 Test simple
app.get('/ping', (req, res) => {
  res.send('pong');
});
initializeDatabase().then(() => {
// 🚀 Lancer le serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Serveur en cours d'exécution sur http://localhost:${PORT}`);
  console.log(`🚀 Interface publique : http://localhost:${PORT}/frontend/user/index.html`);
  console.log(`🚀 Interface admin : http://localhost:${PORT}/frontend/admin/index.html`);
});
});