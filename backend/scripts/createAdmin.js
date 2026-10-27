/**
 * Secure Admin Account Creation Script
 *
 * Usage:
 *   node scripts/createAdmin.js
 *   node scripts/createAdmin.js <email> <password> "<name>"
 *
 * Or set environment variables in backend/.env:
 *   ADMIN_EMAIL=admin@courier.com
 *   ADMIN_PASSWORD=admin123
 *   ADMIN_NAME="Central Admin Logistics"
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const connectDB = require('../config/db');

const createOrPromoteAdmin = async () => {
  try {
    const conn = await connectDB();
    if (!conn) {
      console.error('\n❌ [Admin Setup Error] Cannot proceed: MongoDB connection failed.');
      console.error('Please verify your MONGODB_URI in backend/.env and ensure MongoDB is reachable.\n');
      process.exit(1);
    }

    const args = process.argv.slice(2);
    const email = (args[0] || process.env.ADMIN_EMAIL || 'admin@courier.com').toLowerCase().trim();
    const password = args[1] || process.env.ADMIN_PASSWORD || 'admin123';
    const name = args[2] || process.env.ADMIN_NAME || 'Central Admin Logistics';

    console.log(`\n======================================================`);
    console.log(`🔒 Initial Admin Account Setup`);
    console.log(`   Target Email: ${email}`);
    console.log(`======================================================`);

    let user = await User.findOne({ email }).select('+password');

    if (user) {
      console.log(`[Info] Existing account found for ${email}. Promoting to 'admin' role...`);
      user.role = 'admin';
      user.name = name || user.name;
      if (password) {
        user.password = password; // Will be hashed by pre-save hook
      }
      await user.save();
      console.log(`✅ User ${email} has been successfully promoted to Admin.`);
    } else {
      console.log(`[Info] No existing account for ${email}. Creating new Admin account...`);
      user = await User.create({
        name,
        email,
        password,
        role: 'admin',
        phone: '+91 98765 43210',
        address: {
          street: 'Central Logistics Dispatch Hub',
          city: 'Mumbai',
          state: 'Maharashtra',
          country: 'India',
        },
      });
      console.log(`✅ Admin account created successfully!`);
    }

    console.log(`\nAdmin Credentials Summary:`);
    console.log(`  Role:     ${user.role}`);
    console.log(`  Email:    ${user.email}`);
    console.log(`  Name:     ${user.name}`);
    console.log(`  User ID:  ${user._id}`);
    console.log(`======================================================\n`);

    process.exit(0);
  } catch (error) {
    console.error(`❌ Failed to create/promote admin: ${error.message}`);
    process.exit(1);
  }
};

createOrPromoteAdmin();
