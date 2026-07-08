const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Import our models
const Drug = require('./models/Drug');
const Order = require('./models/Order');

// Import our new route files
const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

// Middleware
app.use(cors()); 
app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Use the MONGO_URI from .env, or fallback to your local computer's MongoDB
const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pharmacy_db';

// Connect to MongoDB
mongoose.connect(mongoURI)
    .then(() => console.log(`✅ Connected to MongoDB database!`))
    .catch((err) => console.error("❌ MongoDB connection error:", err));

// --- REGISTER ROUTERS ---
// These lines activate the admin and login features we just built
app.use('/api/admin', adminRoutes); 
app.use('/api/auth', authRoutes);   

// --- INVENTORY API ROUTES ---

// 1. GET all drugs (Fetch inventory)
app.get('/api/drugs', async (req, res) => {
    try {
        const drugs = await Drug.find().sort({ createdAt: -1 }); // Newest first
        res.status(200).json(drugs);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch drugs", error: error.message });
    }
});

// 2. POST a new drug (Add to inventory)
app.post('/api/drugs', async (req, res) => {
    try {
        const newDrug = new Drug(req.body);
        const savedDrug = await newDrug.save();
        res.status(201).json(savedDrug);
    } catch (error) {
        res.status(400).json({ message: "Failed to add drug", error: error.message });
    }
});

// 3. PUT update a drug (Edit stock/info)
app.put('/api/drugs/:id', async (req, res) => {
    try {
        const updatedDrug = await Drug.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedDrug) return res.status(404).json({ message: "Drug not found" });
        res.status(200).json(updatedDrug);
    } catch (error) {
        res.status(400).json({ message: "Failed to update drug", error: error.message });
    }
});

// 4. DELETE a drug (Remove from inventory)
app.delete('/api/drugs/:id', async (req, res) => {
    try {
        const deletedDrug = await Drug.findByIdAndDelete(req.params.id);
        if (!deletedDrug) return res.status(404).json({ message: "Drug not found" });
        res.status(200).json({ message: "Drug deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete drug", error: error.message });
    }
});

// --- POS / ORDER API ROUTES ---

// 1. Create a Pending Order (Pharmacist Action)
app.post('/api/orders', async (req, res) => {
    try {
        const newOrder = new Order({
            ...req.body,
            status: 'Pending' // Explicitly set as Pending
        });
        const savedOrder = await newOrder.save();
        res.status(201).json(savedOrder);
    } catch (error) {
        res.status(400).json({ message: "Failed to create order", error: error.message });
    }
});

// 2. Get Pending Orders (Cashier Dashboard)
app.get('/api/orders/pending', async (req, res) => {
    try {
        // Oldest first, so the cashier serves the first patient who ordered
        const pendingOrders = await Order.find({ status: 'Pending' }).sort({ createdAt: 1 }); 
        res.status(200).json(pendingOrders);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch pending orders", error: error.message });
    }
});

// 3. Confirm Payment & Deduct Stock (Cashier Action)
app.put('/api/orders/:id/pay', async (req, res) => {
    try {
        const { cashierName, paymentMethod } = req.body;
        const orderId = req.params.id;

        // Find the order
        const order = await Order.findById(orderId);
        if (!order) return res.status(404).json({ message: "Order not found" });
        if (order.status === 'Paid') return res.status(400).json({ message: "Order is already paid" });

        // Start stock deduction logic!
        // Loop through each item in the order and subtract it from the Master Inventory
        for (let item of order.items) {
            const drug = await Drug.findById(item.drugId);
            if (drug) {
                // Ensure stock doesn't go below 0
                drug.stockLevel = Math.max(0, drug.stockLevel - item.quantity);
                await drug.save();
            }
        }

        // Update the order status to Paid
        order.status = 'Paid';
        order.cashierName = cashierName;
        order.paymentMethod = paymentMethod;
        const updatedOrder = await order.save();

        res.status(200).json(updatedOrder);
    } catch (error) {
        res.status(500).json({ message: "Failed to process payment", error: error.message });
    }
});

// 4. Get all orders (Admin/Reports)
app.get('/api/orders', async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 }); // Newest first
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch orders", error: error.message });
    }
});

// A simple test route to verify the server is working
app.get('/', (req, res) => {
    res.send('Pharmacy Backend is running successfully!');
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});