const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// --- AUTHENTICATION APIS ---

// POST: User Login
router.post('/login', async (req, res) => {
    console.log(`\n[AUTH] ---------------------------------`);
    console.log(`[AUTH] Login attempt for email: ${req.body.email}`);
    
    try {
        const { email, password } = req.body;

        // 1. Check if the user exists in the database
        const user = await User.findOne({ email });
        if (!user) {
            console.log(`[AUTH] ❌ Rejecting: User not found in database.`);
            return res.status(404).json({ message: 'Invalid email or user not found.' });
        }

        console.log(`[AUTH] User found in DB. Verifying password...`);

        // 2. CRUCIAL SECURITY FIX: Compare the typed password with the hashed database password
        const isMatch = await bcrypt.compare(password, user.password);
        console.log(`[AUTH] Password match result: ${isMatch}`);
        
        // If the passwords DO NOT match, immediately stop and return an error status (400)
        if (!isMatch) {
            console.log(`[AUTH] ❌ Rejecting: Invalid password provided.`);
            return res.status(400).json({ message: 'Invalid password. Please try again.' });
        }

        console.log(`[AUTH] ✅ Success! Passwords match. Generating token...`);

        // 3. If password matches, generate the secure JWT token
        const token = jwt.sign(
            { id: user._id, role: user.role }, 
            process.env.JWT_SECRET || 'pharmacy_secure_secret_key', 
            { expiresIn: '1d' }
        );

        // 4. Send the success response back to the frontend
        res.status(200).json({ 
            token, 
            user: { 
                id: user._id, 
                name: user.name, 
                role: user.role, 
                email: user.email,
                avatarUrl: user.avatarUrl // Include avatarUrl in login response
            } 
        });

    } catch (error) {
        console.error("[AUTH] ❌ Critical Server Error:", error);
        res.status(500).json({ message: 'Server error during login.' });
    }
});

// PUT: Update Profile Details
router.put('/profile', async (req, res) => {
    console.log(`\n[AUTH] ---------------------------------`);
    console.log(`[AUTH] Profile update attempt for email: ${req.body.email}`);

    try {
        const { email, name, password, avatarUrl } = req.body;
        
        // Find the user by their email
        const user = await User.findOne({ email });
        
        if (!user) {
            console.log(`[AUTH] ❌ Rejecting: User not found.`);
            return res.status(404).json({ message: 'User not found.' });
        }

        // Update fields if they were provided in the request
        if (name) user.name = name;
        if (avatarUrl) user.avatarUrl = avatarUrl;
        
        // If the user provided a new password, hash it before saving
        if (password) {
            console.log(`[AUTH] Hashing new password...`);
            user.password = await bcrypt.hash(password, 10);
        }

        // Save the updated user to the database
        await user.save();
        console.log(`[AUTH] ✅ Profile successfully updated in DB.`);

        // Return the updated user info (excluding the password)
        res.status(200).json({ 
            user: { 
                id: user._id, 
                name: user.name, 
                role: user.role, 
                email: user.email, 
                avatarUrl: user.avatarUrl 
            } 
        });
    } catch (error) {
        console.error("[AUTH] ❌ Error updating profile:", error);
        res.status(500).json({ message: 'Error updating profile.' });
    }
});

module.exports = router;