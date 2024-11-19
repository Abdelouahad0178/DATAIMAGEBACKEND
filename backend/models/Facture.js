const mongoose = require('mongoose');

// Définir le schéma pour les factures
const factureSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Le nom de la facture est requis'],
            trim: true,
            minlength: [3, 'Le nom doit contenir au moins 3 caractères'],
            maxlength: [100, 'Le nom ne peut pas dépasser 100 caractères']
        },
        date: {
            type: Date,
            required: [true, 'La date de la facture est requise'],
            validate: {
                validator: (value) => value <= new Date(),
                message: 'La date ne peut pas être dans le futur'
            }
        },
        image: {
            type: String,
            required: [true, 'L\'URL de l\'image est requise'],
            validate: {
                validator: (value) => /\.(jpg|jpeg|png|gif|webp)$/i.test(value),
                message: 'Le chemin ou l\'URL de l\'image doit se terminer par .jpg, .jpeg, .png, .gif, ou .webp'
            }
        },
        description: {
            type: String,
            trim: true,
            maxlength: [500, 'La description ne peut pas dépasser 500 caractères']
        }
    },
    {
        timestamps: true // Ajoute automatiquement createdAt et updatedAt
    }
);

// Empêcher les doublons (name + date)
factureSchema.index({ name: 1, date: 1 }, { unique: true });

// Gestion des erreurs de validation (index unique)
factureSchema.post('save', function (error, doc, next) {
    if (error.name === 'MongoServerError' && error.code === 11000) {
        next(new Error('Une facture avec ce nom et cette date existe déjà.'));
    } else {
        next(error);
    }
});

// Exporter le modèle Facture
module.exports = mongoose.model('Facture', factureSchema);
