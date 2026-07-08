const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// 1. Get all staff members (excluding the admin)
router.get('/staff', async (req, res) => {
    try {
        const staff = await User.find({ role: { $ne: 'admin' } }).select('-password').sort({ createdAt: -1 });
        res.status(200).json(staff);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch staff", error: error.message });
    }
});

// 2. Add a new staff member
router.post('/staff', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "Email already in use." });

        const hashedPassword = await bcrypt.hash(password, 10);
        
        const newUser = new User({
            name, email, password: hashedPassword, role, status: 'Active'
        });

        const savedUser = await newUser.save();
        savedUser.password = undefined; // Hide password in response
        
        res.status(201).json(savedUser);
    } catch (error) {
        res.status(400).json({ message: "Failed to create staff", error: error.message });
    }
});

// 3. Update staff status (Deactivate / Activate)
router.put('/staff/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        
        if (!['Active', 'Inactive'].includes(status)) {
            return res.status(400).json({ message: "Invalid status value." });
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.params.id, 
            { status }, 
            { new: true }
        ).select('-password');

        if (!updatedUser) return res.status(404).json({ message: "Staff member not found." });
        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: "Failed to update status", error: error.message });
    }
});

// 4. Permanently Delete a staff member
router.delete('/staff/:id', async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);
        if (!deletedUser) return res.status(404).json({ message: "Staff member not found." });
        
        res.status(200).json({ message: "Staff member deleted successfully." });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete staff", error: error.message });
    }
});

module.exports = router;