const mongoose = require('mongoose');
const path = require('path');

// Ensure environment variables are loaded
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const connectDB = async () => {
  try {
    // Primary: MONGODB_URI (standard for MongoDB Atlas & cloud deployments)
    // Fallback: MONGO_URI or local instance
    const mongoURI =
      process.env.MONGODB_URI ||
      process.env.MONGO_URI ||
      'mongodb://127.0.0.1:27017/courier_tracking_db';

    // Mask credentials for safe logging (never expose password in console/logs)
    const maskedURI = mongoURI.replace(
      /(mongodb(?:\+srv)?:\/\/[^:]+:)([^@]+)(@.+)/i,
      '$1*****$3'
    );

    console.log(`[MongoDB] Connecting to: ${maskedURI}`);

    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s if host is unreachable
    });

    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host}`);
    console.log(`[MongoDB] Database Name: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`\n[MongoDB Connection Error] Failed to connect: ${error.message}`);
    console.error('------------------------------------------------------------------');
    console.error('📌 MongoDB Atlas / Local Connection Troubleshooting:');
    console.error('1. Check backend/.env file:');
    console.error('   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/courier_tracking_db?retryWrites=true&w=majority');
    console.error('2. MongoDB Atlas Network Access:');
    console.error('   - Ensure your IP is added, or add "0.0.0.0/0" (Allow Access from Anywhere).');
    console.error('3. Atlas Database User Credentials:');
    console.error('   - Verify your database username and password in Atlas -> Database Access.');
    console.error('   - If your password contains special characters (@, #, %, :, /), URL-encode them:');
    console.error('     e.g., "@" -> "%40", "#" -> "%23"');
    console.error('4. Local MongoDB (Alternative):');
    console.error('   - Ensure the MongoDB service is running on your machine:');
    console.error('     Windows: net start MongoDB');
    console.error('     Linux/Mac: sudo systemctl start mongod');
    console.error('------------------------------------------------------------------\n');
    return null;
  }
};

module.exports = connectDB;
