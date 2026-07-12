const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Import our modular route files
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const drugRoutes = require('./routes/drugRoutes');
const orderRoutes = require('./routes/orderRoutes');

const app = express();

// --- MIDDLEWARE ---
// Enable Cross-Origin Resource Sharing so the React frontend can talk to this backend
app.use(cors()); 

// Increase payload limits to allow Base64 image uploads (like the 2MB profile pictures)
app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// --- DATABASE CONNECTION ---
// Use the MONGO_URI from .env, or fallback to your local computer's MongoDB
const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pharmacy_db';

mongoose.connect(mongoURI)
    .then(() => console.log(`✅ Connected to MongoDB database!`))
    .catch((err) => {
        console.error("❌ MongoDB connection error:", err.message);
        process.exit(1); // Stop the server if the database fails to connect
    });

// --- API ROUTERS ---
// Mount the separate route files to their respective API paths
app.use('/api/auth', authRoutes);     // Handles Login and Profile Updates
app.use('/api/admin', adminRoutes);   // Handles Staff Management
app.use('/api/drugs', drugRoutes);    // Handles Inventory Management
app.use('/api/orders', orderRoutes);  // Handles Pharmacist POS and Cashier Queue

// --- BASE ROUTE (Health Check) ---
// A simple test route to verify the server is running when you visit http://localhost:5000
app.get('/', (req, res) => {
    res.status(200).json({ 
        message: '💊 PharmaSys Backend API is running successfully!',
        status: 'Online'
    });
});

// --- ERROR HANDLING MIDDLEWARE ---
// Catch requests to undefined routes
app.use((req, res, next) => {
    res.status(404).json({ message: "Route not found. Please check the URL." });
});

// --- START SERVER ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`\n🚀 Server is running and listening on port ${PORT}`);
    console.log(`👉 http://localhost:${PORT}`);
    console.log(`-------------------------------------------------`);
});