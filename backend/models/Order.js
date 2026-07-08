const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    pharmacistName: { 
        type: String, 
        required: true 
    },
    cashierName: { 
        type: String, 
        default: null // Will be filled when the cashier processes it
    },
    items: [{
        drugId: { type: mongoose.Schema.Types.ObjectId, ref: 'Drug', required: true },
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        unitPrice: { type: Number, required: true },
        subtotal: { type: Number, required: true }
    }],
    totalAmount: { 
        type: Number, 
        required: true 
    },
    paymentMethod: {
        type: String,
        enum: ['Cash', 'Transfer', 'Card', 'Pending'],
        default: 'Pending'
    },
    status: {
        type: String,
        enum: ['Pending', 'Paid', 'Cancelled'],
        default: 'Pending'
    }
}, { 
    timestamps: true 
});

module.exports = mongoose.model('Order', orderSchema);