const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User'); // Make sure your User model exists
require('dotenv').config();

const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pharmacy_db';

mongoose.connect(mongoURI)
    .then(async () => {
        console.log("✅ Connected to DB. Checking for Admin user...");
        
        // Check if admin already exists
        const adminExists = await User.findOne({ email: 'admin@pharmasys.com' });
        if (adminExists) {
            console.log("⚠️ Admin already exists! You can log in.");
            process.exit(0);
        }

        // Hash the password 'admin123'
        const hashedPassword = await bcrypt.hash('admin123', 10);

        // Create the Admin
        await User.create({
            name: 'Dr. Admin',
            email: 'admin@pharmasys.com',
            password: hashedPassword,
            role: 'admin',
            status: 'Active'
        });

        console.log("🎉 Success! Admin created.");
        console.log("👉 Email: admin@pharmasys.com");
        console.log("👉 Password: admin123");
        process.exit(0);
    })
    .catch((err) => {
        console.error("❌ Seeding error:", err);
        process.exit(1);
    });