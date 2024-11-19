const express = require('express');
const Facture = require('../models/Facture'); // Modèle de la facture
const router = express.Router();
const multer = require('multer');
const path = require('path');

// Configuration de Multer pour l'upload d'images
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../../uploads')); // Définir le dossier de stockage
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`); // Nom unique pour chaque fichier
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // Limite de taille de fichier : 10 MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('Seuls les fichiers d\'image sont autorisés.'));
        }
    },
});

// GET : Récupérer toutes les factures
router.get('/', async (req, res) => {
    try {
        const factures = await Facture.find();
        res.json(factures);
    } catch (err) {
        res.status(500).json({ message: 'Erreur lors de la récupération des factures.', error: err.message });
    }
});

// POST : Ajouter une nouvelle facture
router.post('/', upload.single('image'), async (req, res) => {
    const { name, date } = req.body;
    const image = req.file ? `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}` : '';

    try {
        // Vérifier les doublons (name + date)
        const existingFacture = await Facture.findOne({ name, date });
        if (existingFacture) {
            return res.status(400).json({ message: 'Une facture avec le même nom et la même date existe déjà.' });
        }

        const facture = new Facture({ name, date, image });
        const newFacture = await facture.save();
        res.status(201).json(newFacture);
    } catch (err) {
        console.error('Erreur lors de l\'ajout de la facture :', err.message);
        res.status(400).json({ message: 'Erreur lors de l\'ajout de la facture.', error: err.message });
    }
});

// PUT : Modifier une facture existante
router.put('/:id', upload.single('image'), async (req, res) => {
    try {
        const facture = await Facture.findById(req.params.id);
        if (!facture) {
            return res.status(404).json({ message: 'Facture introuvable.' });
        }

        const { name, date } = req.body;
        if (name) facture.name = name;
        if (date) facture.date = date;

        // Si une nouvelle image est uploadée, mettre à jour l'image
        if (req.file) {
            facture.image = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
        }

        const updatedFacture = await facture.save();
        res.json(updatedFacture);
    } catch (err) {
        console.error('Erreur lors de la mise à jour de la facture :', err.message);
        res.status(500).json({ message: 'Erreur lors de la mise à jour de la facture.', error: err.message });
    }
});

// DELETE : Supprimer une facture
router.delete('/:id', async (req, res) => {
    try {
        const facture = await Facture.findById(req.params.id);
        if (!facture) {
            return res.status(404).json({ message: 'Facture introuvable.' });
        }

        await Facture.findByIdAndDelete(req.params.id);
        res.json({ message: 'Facture supprimée avec succès.' });
    } catch (err) {
        console.error('Erreur lors de la suppression de la facture :', err.message);
        res.status(500).json({ message: 'Erreur lors de la suppression de la facture.', error: err.message });
    }
});

module.exports = router;
