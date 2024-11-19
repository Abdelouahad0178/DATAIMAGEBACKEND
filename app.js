const express = require('express');
const mongoose = require('./backend/config/db'); // Connexion à MongoDB
const facturesRoutes = require('./backend/routes/factures'); // Routes pour les factures
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();

// Configuration de Multer pour l'upload des images
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '/uploads')); // Dossier où enregistrer les fichiers
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`); // Nom unique pour chaque fichier
    },
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('Seuls les fichiers d\'image sont autorisés (jpg, jpeg, png, gif, webp).'));
        }
    },
});

// Vérification et création du dossier uploads
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('Le dossier "uploads" a été créé avec succès.');
}

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rendre le dossier uploads accessible pour le frontend
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// Servir les fichiers du frontend (public)
app.use(express.static('public'));

// Routes API pour les factures
app.use('/api/factures', facturesRoutes);

// Route pour l'upload d'images
app.post('/api/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'Aucun fichier téléchargé.' });
    }
    res.status(200).json({ filePath: `/uploads/${req.file.filename}` });
});

// Route pour la page d'accueil
app.get('/', (req, res) => {
    res.send('Bienvenue sur le serveur des factures! Accédez à /api/factures pour les opérations sur les factures.');
});

// Gestion des erreurs globales
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: err.message || 'Une erreur est survenue.',
        error: err,
    });
});

// Connexion à MongoDB
mongoose.connection.on('connected', () => {
    console.log('MongoDB connecté avec succès.');
});

mongoose.connection.on('error', (err) => {
    console.error('Erreur lors de la connexion à MongoDB :', err.message);
});

// Démarrage du serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
