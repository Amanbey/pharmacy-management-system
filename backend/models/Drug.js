const mongoose = require('mongoose');

const drugSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    category: { 
        type: String, 
        required: true 
    },
    stock: { 
        type: Number, 
        required: true, 
        default: 0 
    },
    minStock: { 
        type: Number, 
        required: true, 
        default: 20 
    },
    // Changed from unitPrice to price to perfectly match the frontend form
    price: { 
        type: Number, 
        required: true 
    },
    // Added to track expiration dates from the new frontend form
    expiryDate: { 
        type: String, 
        required: true 
    } 
}, { 
    timestamps: true 
});

module.exports = mongoose.model('Drug', drugSchema);