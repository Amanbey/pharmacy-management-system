const express = require('express');
const router = express.Router();
const Drug = require('../models/Drug');

// GET: Fetch all drugs (For Admin & Pharmacist)
router.get('/', async (req, res) => {
    try {
        const drugs = await Drug.find().sort({ createdAt: -1 });
        res.status(200).json(drugs);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch drugs", error: error.message });
    }
});

// POST: Add a new drug (Admin only)
router.post('/', async (req, res) => {
    try {
        const newDrug = new Drug(req.body);
        const savedDrug = await newDrug.save();
        res.status(201).json(savedDrug);
    } catch (error) {
        res.status(400).json({ message: "Failed to add drug", error: error.message });
    }
});

module.exports = router;