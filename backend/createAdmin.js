/**
 * Create Admin User Script
 * Run: node createAdmin.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if admin exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('Admin already exists:', existingAdmin.email);
      process.exit(0);
    }

    // Create admin - CHANGE THESE VALUES!
    const admin = await User.create({
      firstName: 'Admin',
      lastName: 'OPTIMISTIC',
      email: 'admin@optimisticempire.com',  // Change this
      phone: '0500000000',                   // Change this
      password: 'Admin123!',                 // Change this!
      role: 'admin',
      isEmailVerified: true
    });

    console.log('✅ Admin created successfully!');
    console.log('Email:', admin.email);
    console.log('Password: Admin123! (change this immediately!)');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

createAdmin();
