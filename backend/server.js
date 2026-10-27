const path = require('path');
const fs = require('fs');

// 1. Read environment variables from backend/.env (and root fallback)
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const connectDB = require('./config/db');

// Route imports
const authRoutes = require('./routes/authRoutes');
const shipmentRoutes = require('./routes/shipmentRoutes');
const trackingRoutes = require('./routes/trackingRoutes');

// Auto seed helper for first-time database initialization
const autoSeedIfEmpty = async () => {
  try {
    const Shipment = require('./models/Shipment');
    const User = require('./models/User');
    const TrackingEvent = require('./models/TrackingEvent');

    if (mongoose.connection.readyState !== 1) {
      return;
    }

    const shipmentCount = await Shipment.countDocuments();
    if (shipmentCount === 0) {
      console.log('[Auto-Seed] Database is empty. Inserting initial demonstration data...');

      // Admin user
      const adminUser = await User.create({
        name: process.env.ADMIN_NAME || 'Central Admin Logistics',
        email: process.env.ADMIN_EMAIL || 'admin@courier.com',
        password: process.env.ADMIN_PASSWORD || 'admin123',
        role: 'admin',
        phone: '+91 98765 43210',
        address: { city: 'Mumbai', state: 'Maharashtra', country: 'India' },
      });

      // Customer user
      const customerUser = await User.create({
        name: 'Rajesh Sharma',
        email: 'customer@courier.com',
        password: 'user123',
        role: 'customer',
        phone: '+91 91234 56789',
        address: { city: 'Bengaluru', state: 'Karnataka', country: 'India' },
      });

      // 1. In Transit
      const s1 = await Shipment.create({
        trackingNumber: 'TRK-892147',
        sender: { name: 'TechMart Solutions', phone: '+91 98220 11223', address: 'B-Wing MIDC', city: 'Mumbai', state: 'Maharashtra' },
        recipient: { name: 'Rajesh Sharma', phone: '+91 91234 56789', address: '15 Green Valley Residency', city: 'Bengaluru', state: 'Karnataka' },
        origin: 'Mumbai',
        destination: 'Bengaluru',
        currentCity: 'Pune Central Hub',
        status: 'In Transit',
        packageType: 'Electronics',
        weight: 2.5,
        serviceType: 'Express Air',
        cost: 320,
        estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        customer: customerUser._id,
        createdBy: adminUser._id,
      });

      await TrackingEvent.create([
        {
          shipmentId: s1._id,
          trackingNumber: s1.trackingNumber,
          status: 'Booked',
          location: 'Mumbai Sorting Hub',
          description: 'Shipment order booked and registered online.',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
          updatedBy: adminUser._id,
        },
        {
          shipmentId: s1._id,
          trackingNumber: s1.trackingNumber,
          status: 'Picked Up',
          location: 'Andheri East Logistics Center, Mumbai',
          description: 'Package picked up from seller warehouse.',
          timestamp: new Date(Date.now() - 16 * 60 * 60 * 1000),
          updatedBy: adminUser._id,
        },
        {
          shipmentId: s1._id,
          trackingNumber: s1.trackingNumber,
          status: 'In Transit',
          location: 'Pune Central Expressway Hub',
          description: 'Package in transit via highway air-express corridor.',
          timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
          updatedBy: adminUser._id,
        },
      ]);

      // 2. Out for Delivery
      const s2 = await Shipment.create({
        trackingNumber: 'TRK-451209',
        sender: { name: 'Apex Diagnostics', phone: '+91 80099 44332', address: 'Plot 7 HITEC', city: 'Hyderabad', state: 'Telangana' },
        recipient: { name: 'Dr. Sunita Deshmukh', phone: '+91 97654 32100', address: 'Room 204 City Care Hospital', city: 'Bengaluru', state: 'Karnataka' },
        origin: 'Hyderabad',
        destination: 'Bengaluru',
        currentCity: 'Bengaluru (Koramangala Branch)',
        status: 'Out for Delivery',
        packageType: 'Fragile Goods',
        weight: 1.2,
        serviceType: 'Same Day Delivery',
        cost: 450,
        estimatedDelivery: new Date(Date.now() + 4 * 60 * 60 * 1000),
        customer: customerUser._id,
        createdBy: adminUser._id,
      });

      await TrackingEvent.create([
        {
          shipmentId: s2._id,
          trackingNumber: s2.trackingNumber,
          status: 'Booked',
          location: 'Hyderabad Air Freight Center',
          description: 'Priority courier order booked.',
          timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
        },
        {
          shipmentId: s2._id,
          trackingNumber: s2.trackingNumber,
          status: 'Picked Up',
          location: 'Hyderabad Depot',
          description: 'Package scanned into secure container.',
          timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
        },
        {
          shipmentId: s2._id,
          trackingNumber: s2.trackingNumber,
          status: 'In Transit',
          location: 'Kempegowda Transit Hub, Bengaluru',
          description: 'Transferred to local city distribution node.',
          timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
        },
        {
          shipmentId: s2._id,
          trackingNumber: s2.trackingNumber,
          status: 'Out for Delivery',
          location: 'Koramangala Delivery Hub',
          description: 'Courier agent Vikram Singh dispatched for doorstep delivery.',
          timestamp: new Date(Date.now() - 30 * 60 * 1000),
        },
      ]);

      // 3. Delivered
      const s3 = await Shipment.create({
        trackingNumber: 'TRK-339812',
        sender: { name: 'National University Exam Cell', phone: '+91 11234 88776', address: 'Administrative Block', city: 'New Delhi', state: 'Delhi' },
        recipient: { name: 'Rajesh Sharma', phone: '+91 91234 56789', address: '15 Green Valley Residency', city: 'Bengaluru', state: 'Karnataka' },
        origin: 'New Delhi',
        destination: 'Bengaluru',
        currentCity: 'Bengaluru',
        status: 'Delivered',
        packageType: 'Document',
        weight: 0.4,
        serviceType: 'Standard Delivery',
        cost: 140,
        estimatedDelivery: new Date(Date.now() - 24 * 60 * 60 * 1000),
        customer: customerUser._id,
        createdBy: adminUser._id,
      });

      await TrackingEvent.create([
        {
          shipmentId: s3._id,
          trackingNumber: s3.trackingNumber,
          status: 'Booked',
          location: 'Connaught Place Hub, New Delhi',
          description: 'Document registered for cloud tracking dispatch.',
          timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000),
        },
        {
          shipmentId: s3._id,
          trackingNumber: s3.trackingNumber,
          status: 'Delivered',
          location: 'Koramangala, Bengaluru',
          description: 'Package successfully delivered. Signed by recipient.',
          timestamp: new Date(Date.now() - 22 * 60 * 60 * 1000),
        },
      ]);

      // 4. Arrived at Facility
      const s4 = await Shipment.create({
        trackingNumber: 'TRK-771234',
        sender: { name: 'South Cotton Textiles', phone: '+91 94441 55667', address: '12 T. Nagar', city: 'Chennai', state: 'Tamil Nadu' },
        recipient: { name: 'Rajesh Sharma', phone: '+91 91234 56789', address: '15 Green Valley Residency', city: 'Bengaluru', state: 'Karnataka' },
        origin: 'Chennai',
        destination: 'Bengaluru',
        currentCity: 'Bengaluru Regional Distribution Hub',
        status: 'Arrived at Facility',
        packageType: 'Large Parcel',
        weight: 4.8,
        serviceType: 'Standard Delivery',
        cost: 290,
        bookingDate: new Date(Date.now() - 30 * 60 * 60 * 1000),
        estimatedDelivery: new Date(Date.now() + 24 * 60 * 60 * 1000),
        customer: customerUser._id,
        createdBy: adminUser._id,
      });

      await TrackingEvent.create([
        {
          shipmentId: s4._id,
          trackingNumber: s4.trackingNumber,
          status: 'Booked',
          location: 'Chennai Main Post Hub',
          description: 'Consignment booked and label generated.',
          timestamp: new Date(Date.now() - 30 * 60 * 60 * 1000),
        },
        {
          shipmentId: s4._id,
          trackingNumber: s4.trackingNumber,
          status: 'Arrived at Facility',
          location: 'Bengaluru Regional Distribution Hub',
          description: 'Package received and verified at regional distribution center.',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        },
      ]);

      // 5. Delivery Failed
      const s5 = await Shipment.create({
        trackingNumber: 'TRK-552391',
        sender: { name: 'Pune Precision Tools', phone: '+91 92233 44556', address: 'B-14 Bhosari', city: 'Pune', state: 'Maharashtra' },
        recipient: { name: 'Amit Verma', phone: '+91 98112 33445', address: 'Flat 502 Prestige Tower', city: 'Bengaluru', state: 'Karnataka' },
        origin: 'Pune',
        destination: 'Bengaluru',
        currentCity: 'Whitefield Delivery Center, Bengaluru',
        status: 'Delivery Failed',
        packageType: 'Heavy Freight',
        weight: 6.2,
        serviceType: 'Express Air',
        cost: 470,
        bookingDate: new Date(Date.now() - 40 * 60 * 60 * 1000),
        estimatedDelivery: new Date(Date.now() + 12 * 60 * 60 * 1000),
        customer: customerUser._id,
        createdBy: adminUser._id,
      });

      await TrackingEvent.create([
        {
          shipmentId: s5._id,
          trackingNumber: s5.trackingNumber,
          status: 'Booked',
          location: 'Pune Cargo Hub',
          description: 'Industrial consignment registered.',
          timestamp: new Date(Date.now() - 40 * 60 * 60 * 1000),
        },
        {
          shipmentId: s5._id,
          trackingNumber: s5.trackingNumber,
          status: 'Delivery Failed',
          location: 'Whitefield, Bengaluru',
          description: 'Delivery attempt failed: Premises locked & recipient phone unreachable.',
          notes: 'Driver note: Gate security reported resident out of city.',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        },
      ]);

      console.log('[Auto-Seed] Initial demo data seeded successfully!');
    }
  } catch (err) {
    console.warn('[Auto-Seed] Notice: Could not auto-seed data (MongoDB may be connecting):', err.message);
  }
};

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: '*', // Allow all origins for seamless development and college presentations
    credentials: true,
  })
);

// Logging middleware
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// 3. Dynamic Health Check Endpoint - reports backend & DB connection status without exposing credentials
app.get('/api/health', (req, res) => {
  const readyStateMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  const stateCode = mongoose.connection.readyState;
  const dbStatus = readyStateMap[stateCode] || 'unknown';
  const isDbConnected = stateCode === 1;

  const distPath = path.resolve(__dirname, '../frontend/dist');
  const isFrontendBuilt = fs.existsSync(distPath);

  res.status(200).json({
    status: isDbConnected ? 'healthy' : 'degraded',
    service: 'Cloud-Based Courier Tracking System API',
    version: '1.0.0',
    uptime: `${Math.floor(process.uptime())}s`,
    timestamp: new Date().toISOString(),
    database: {
      status: dbStatus,
      connected: isDbConnected,
      host: isDbConnected ? mongoose.connection.host : null,
      name: isDbConnected ? mongoose.connection.name : null,
    },
    environment: process.env.NODE_ENV || 'development',
    port: Number(process.env.PORT) || 5000,
    endpoints: {
      auth: '/api/auth',
      shipments: '/api/shipments',
      tracking: '/api/tracking',
      health: '/api/health',
    },
    frontend: {
      singleOriginServed: isFrontendBuilt,
      viteDevUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
    },
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/shipments', shipmentRoutes);
app.use('/api/tracking', trackingRoutes);

// 404 Handler for undefined API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
  });
});

// 4. Configure Express to serve built React frontend for Single-Origin run + support Vite dev mode
const distPath = path.resolve(__dirname, '../frontend/dist');

if (fs.existsSync(distPath)) {
  // Serve built static assets from frontend/dist
  app.use(express.static(distPath));

  // Client-side SPA routing: all non-API paths serve index.html
  app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  // Helpful fallback landing page if frontend is not yet built
  app.get('/', (req, res) => {
    res.status(200).send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Courier Tracking System - API Online</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #0f172a;
            color: #f8fafc;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            padding: 20px;
            box-sizing: border-box;
          }
          .card {
            background: #1e293b;
            padding: 2.5rem;
            border-radius: 12px;
            border: 1px solid #334155;
            max-width: 620px;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4);
          }
          h1 { color: #38bdf8; margin-top: 0; font-size: 1.6rem; }
          p { color: #cbd5e1; line-height: 1.6; }
          .code {
            background: #0b1120;
            padding: 10px 14px;
            border-radius: 8px;
            font-family: Consolas, monospace;
            color: #38bdf8;
            margin: 10px 0;
          }
          .links { display: flex; gap: 12px; margin-top: 20px; }
          .btn { background: #0284c7; color: white; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-weight: 500; }
          .btn-outline { background: #334155; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>📦 Cloud-Based Courier Tracking API</h1>
          <p>The Express.js REST API server is actively running on port <strong>${process.env.PORT || 5000}</strong>.</p>
          
          <p><strong>Option 1: Vite Development Mode (Live HMR)</strong></p>
          <div class="code">npm run client   # Opens http://localhost:5173</div>

          <p><strong>Option 2: Single-Origin Production Run</strong></p>
          <p>Compile the React application to serve frontend and backend together:</p>
          <div class="code">npm run build    # Generates frontend/dist</div>

          <div class="links">
            <a href="/api/health" class="btn">API Health Status</a>
            <a href="http://localhost:5173" class="btn btn-outline">Vite Dev (5173)</a>
          </div>
        </div>
      </body>
      </html>
    `);
  });
}

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Global Error]:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

const PORT = process.env.PORT || 5000;

// Connect Database and launch server
const startServer = () => {
  const server = app.listen(PORT, () => {
    const isDistReady = fs.existsSync(distPath);

    console.log(`\n======================================================`);
    console.log(`🚀 Courier Tracking System - API Server Online`);
    console.log(`======================================================`);
    console.log(`📡 Backend API:         http://localhost:${PORT}`);
    console.log(`🔍 Health Check:        http://localhost:${PORT}/api/health`);
    console.log(`⚡ Vite Dev Mode:       http://localhost:5173`);
    console.log(`🌐 Single-Origin UI:    http://localhost:${PORT} ${isDistReady ? '(Ready - frontend/dist)' : '(Run npm run build)'}`);
    console.log(`======================================================\n`);
  });

  // Connect to MongoDB asynchronously without blocking HTTP server
  connectDB().then(async (conn) => {
    if (conn) {
      console.log(`[Server] MongoDB connected (${conn.connection.host}). Checking auto-seed...`);
      await autoSeedIfEmpty();
    } else {
      console.warn(`[Server] MongoDB not connected. Server running in disconnected mode.`);
      console.warn(`[Server] Check /api/health to inspect live database status.`);
    }
  });

  return server;
};

startServer();

module.exports = app;
