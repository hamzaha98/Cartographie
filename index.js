const express = require('express');
const mysql = require('mysql2');

const app = express();
app.use(express.json());

// Configuration de la connexion à la base de données
const pool = mysql.createPool({
  host: 'localhost',      
  user: 'root',           
  password: 'Raja1998.', 
  database: 'StageDb'
}).promise();  

// Route pour récupérer la liste des entreprises
app.get('/entreprises', async (req, res) => {
  try {
    const [results] = await pool.query('SELECT * FROM entreprises');
    res.json(results);
  } catch (error) {
    console.error('Erreur SQL:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des entreprises.' });
  }
});

// Route pour récupérer une entreprise par son ID
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

// Route pour ajouter une nouvelle entreprise
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
    res.status(201).json({ id: result.insertId, nom, logo, descriptif, lien_du_site, categorie, mots_cles, lieu });
  } catch (error) {
    console.error('Erreur SQL:', error);
    res.status(500).json({ error: "Erreur lors de l'ajout de l'entreprise." });
  }
});

// Démarrage du serveur sur le port 3000
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
});
