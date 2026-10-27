# 📦 Cloud-Based Courier Tracking System

> **Enterprise-Grade Full-Stack Logistics & Parcel Telemetry Platform**  
> *Developed with React 19, Vite, Node.js, Express.js, MongoDB Atlas (Mongoose ODM), and JWT Authentication.*

---

## 📑 Table of Contents
1. [Project Overview](#-project-overview)
2. [Technology Stack](#-technology-stack)
3. [Project Directory Structure](#-project-directory-structure)
4. [Environment Variables Configuration](#-environment-variables-configuration)
5. [MongoDB Atlas Setup Guide](#-mongodb-atlas-setup-guide)
6. [Local Installation & Execution](#-local-installation--execution)
7. [Single-Origin Run vs Vite Development Mode](#-single-origin-run-vs-vite-development-mode)
8. [Database Seeding & Sample Data](#-database-seeding--sample-data)
9. [Secure Initial Admin Creation](#-secure-initial-admin-creation)
10. [REST API Documentation & Health Check](#-rest-api-documentation--health-check)
11. [Troubleshooting Guide](#-troubleshooting-guide)
12. [College Viva Voce & Defense Q&A](#-college-viva-voce--defense-qa)

---

## 🌟 Project Overview

The **Cloud-Based Courier Tracking System** is a full-stack logistics management application built for modern dispatch operations and transparent parcel telemetry. It addresses the real-world operational challenges of shipment tracking, sorting facility check-ins, linehaul transit visibility, and proof-of-delivery management.

### Key Capabilities
- **Public Parcel Tracking (No Login Required):** Real-time tracking by unique consignment ID (e.g., `TRK-892147`) featuring a dynamic multi-stage progression bar, chronological sorting hub checkpoints, and privacy-preserving data masking.
- **Admin Logistics Operations Portal:** Complete shipment lifecycle management, automatic collision-free tracking number generation, interactive timeline updater, weight-based automated freight calculator, and aggregate status/date reports with interactive charts.
- **Customer Consignment Portal:** Authenticated customer dashboard displaying live in-transit packages, estimated delivery countdowns, digital printable waybills, and historical delivery proofs.
- **Dynamic System Health API (`/api/health`):** Real-time status reporting of backend process uptime and MongoDB connection state without exposing sensitive connection strings or credentials.

---

## 🛠️ Technology Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Frontend Framework** | [React 19](https://react.dev/) + [Vite 8](https://vitejs.dev/) | High-performance Single Page Application (SPA) with sub-second HMR |
| **Styling** | Vanilla CSS3 (Custom Design System) | Modern design tokens, glassmorphism cards, micro-animations, responsive layout |
| **Routing** | [React Router v7](https://reactrouter.com/) | Client-side routing with role-based Route Guards |
| **Icons & Effects** | [Lucide React](https://lucide.dev/) + Canvas-Confetti | Modern SVG logistics icons and milestone celebratory particle animations |
| **Backend Framework** | [Node.js](https://nodejs.org/) + [Express.js](https://expressjs.com/) | RESTful API server with modular controllers, routes, and middleware |
| **Database** | [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) / Local MongoDB | Cloud NoSQL document database managed via [Mongoose ODM](https://mongoosejs.com/) |
| **Authentication** | [JWT (jsonwebtoken)](https://jwt.io/) + [Bcrypt.js](https://github.com/dcodeIO/bcrypt.js) | Stateless HTTP Bearer authentication and 10-round salted password hashing |

---

## 📁 Project Directory Structure

```text
Courier Tracking System/
├── backend/
│   ├── config/
│   │   └── db.js                 # Safe MongoDB connection & connection diagnostics
│   ├── controllers/
│   │   ├── authController.js     # User registration, login, and profile management
│   │   ├── shipmentController.js # Shipment CRUD, reports aggregation, and rate calculation
│   │   └── trackingController.js # Public tracking by number & audit checkpoint logs
│   ├── middleware/
│   │   └── authMiddleware.js     # JWT verification & role-based access control (RBAC)
│   ├── models/
│   │   ├── User.js               # Customer & Admin user schema with bcrypt pre-save hook
│   │   ├── Shipment.js           # Consignment details, sender/recipient, package specs
│   │   └── TrackingEvent.js      # Audit checkpoint history with UTC timestamps
│   ├── routes/
│   │   ├── authRoutes.js         # /api/auth endpoints
│   │   ├── shipmentRoutes.js     # /api/shipments endpoints
│   │   └── trackingRoutes.js     # /api/tracking endpoints
│   ├── scripts/
│   │   └── createAdmin.js        # Secure administrative account creation CLI script
│   ├── .env                      # Local environment configuration (PORT, MONGODB_URI, JWT)
│   ├── .env.example              # Environment template with placeholder values only
│   ├── .gitignore                # Backend git exclusions (node_modules, .env)
│   ├── package.json              # Backend dependencies and execution scripts
│   ├── seedData.js               # Standalone demo data seeder script
│   └── server.js                 # Express server, /api/health, and single-origin static handler
│
├── frontend/
│   ├── public/                   # Public web assets and icons
│   ├── src/
│   │   ├── components/
│   │   │   ├── BarcodeVisual.jsx # SVG/CSS logistics barcode and QR code preview
│   │   │   ├── Footer.jsx        # Footer with quick evaluation test links
│   │   │   ├── Navbar.jsx        # Responsive navigation with role indicators
│   │   │   ├── ProtectedRoute.jsx# Role guard wrapper (admin/customer)
│   │   │   ├── ReportCharts.jsx  # Interactive SVG distribution charts and timeline trends
│   │   │   ├── StatusBadge.jsx   # Color-coded pulsing status badges
│   │   │   └── Timeline.jsx      # Chronological sorting hub checkpoint timeline
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # Global authentication and session state
│   │   ├── pages/
│   │   │   ├── AdminDashboard.jsx      # Operations overview, metrics, charts & filters
│   │   │   ├── CreateShipmentPage.jsx  # Booking form with real-time freight calculator
│   │   │   ├── CustomerDashboard.jsx   # Recipient overview and active parcel tracking
│   │   │   ├── HomePage.jsx            # Hero search bar and quick test credentials
│   │   │   ├── LoginPage.jsx           # Sign-in with one-click test autofill
│   │   │   ├── ManageShipmentsPage.jsx # Status advance modal, search & pagination
│   │   │   ├── MyShipmentsPage.jsx     # Customer consignment directory
│   │   │   ├── RegisterPage.jsx        # Customer account registration
│   │   │   ├── ShipmentDetailsPage.jsx # Printable digital waybill manifest
│   │   │   └── TrackParcelPage.jsx     # Public tracker with milestone timeline
│   │   ├── services/
│   │   │   └── api.js            # Axios/Fetch client with graceful fallback resilience
│   │   ├── App.jsx               # Application routes and navigation structure
│   │   ├── index.css             # Unified CSS Design System (variables, utilities, cards)
│   │   └── main.jsx              # React root entry point
│   ├── .env                      # Frontend API connection URL
│   ├── .env.example              # Frontend environment template
│   ├── .gitignore                # Frontend git exclusions (node_modules, dist)
│   ├── index.html                # HTML5 entry with Google Fonts & SEO metadata
│   ├── package.json              # Frontend dependencies and Vite build scripts
│   └── vite.config.js            # Vite configuration
│
├── .env.example                  # Consolidated root environment template (placeholders only)
├── .gitignore                    # Project-level git exclusions
├── package.json                  # Root convenience scripts (install:all, dev, build, seed)
└── README.md                     # Comprehensive project documentation
```

---

## ⚙️ Environment Variables Configuration

The system uses environment variables to keep sensitive configuration separate from code.

### Backend Configuration (`backend/.env`)

A template file with **placeholder values only** is provided in `backend/.env.example`. Create `backend/.env` with your actual configuration:

```env
# Server Port & Mode
PORT=5000
NODE_ENV=development

# MongoDB Connection String (Atlas Cloud or Local MongoDB)
# Atlas Format:
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/courier_tracking_db?retryWrites=true&w=majority
# Local Format alternative:
# MONGODB_URI=mongodb://127.0.0.1:27017/courier_tracking_db

# JWT Authentication (generate a secure random 32+ character string)
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters_here
JWT_EXPIRE=30d

# Optional Admin Registration Secret Key (protects /api/auth/register-admin)
ADMIN_REGISTRATION_KEY=your_admin_registration_secret_key_here

# Initial Admin Credentials (used by 'npm run create-admin')
ADMIN_EMAIL=admin@courier.com
ADMIN_PASSWORD=admin123
ADMIN_NAME="Central Admin Logistics"

# Frontend Origin for CORS (Vite development default)
FRONTEND_URL=http://localhost:5173
```

### Frontend Configuration (`frontend/.env`)

```env
# URL of the backend API
VITE_API_URL=http://localhost:5000/api
```

---

## 🌐 MongoDB Atlas Setup Guide

To use a free cloud database on MongoDB Atlas:

### Step 1: Create a MongoDB Atlas Account
1. Visit [https://cloud.mongodb.com/](https://cloud.mongodb.com/) and register for a free account.
2. Sign in and create a new project (e.g. `Courier-Tracking`).

### Step 2: Deploy a Free M0 Cluster
1. Click **Create** under Database Deployments.
2. Select the **M0 Shared** (Free) tier.
3. Choose your preferred Cloud Provider (AWS / Google Cloud) and the region closest to you (e.g., `ap-south-1` Mumbai).
4. Name your cluster (e.g. `Cluster0`) and click **Create Deployment**.

### Step 3: Create a Database User
1. In the left navigation menu under **Security**, click **Database Access**.
2. Click **Add New Database User**.
3. Choose **Password** authentication method:
   - **Username**: `courier_admin` (or your choice)
   - **Password**: Create a secure password (e.g. `CourierDb2026!`)
4. Under **Database User Privileges**, select **Read and write to any database**.
5. Click **Add User**.

> [!IMPORTANT]
> If your password contains special characters like `@`, `#`, `:`, `%`, or `/`, they must be URL-encoded in the connection string:
> - `@` $\to$ `%40`
> - `#` $\to$ `%23`
> - `%` $\to$ `%25`
> - `:` $\to$ `%3A`

### Step 4: Configure Network Access (IP Whitelist)
1. In the left navigation menu under **Security**, click **Network Access**.
2. Click **Add IP Address**.
3. Select **Allow Access from Anywhere** (`0.0.0.0/0`).
4. Click **Confirm**. (This enables connections from your local machine and cloud hosts).

### Step 5: Copy Your Connection String
1. In the left navigation menu, click **Database** to view your clusters.
2. Click **Connect** on your cluster card.
3. Select **Drivers** (Node.js).
4. Copy the connection string format:
   ```text
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<username>` and `<password>` with your database user credentials.
6. Specify the database name by appending `courier_tracking_db` before the `?` query parameter:
   ```text
   mongodb+srv://courier_admin:YourPassword123@cluster0.xxxxx.mongodb.net/courier_tracking_db?retryWrites=true&w=majority
   ```
7. Open `backend/.env` and paste this value as `MONGODB_URI`:
   ```env
   MONGODB_URI=mongodb+srv://courier_admin:YourPassword123@cluster0.xxxxx.mongodb.net/courier_tracking_db?retryWrites=true&w=majority
   ```

---

## 💻 Local Installation & Execution

### Prerequisites
- **Node.js** v18+ or v20+ (`node -v`)
- **npm** v9+ (`npm -v`)
- **MongoDB** running locally (`mongodb://127.0.0.1:27017`) OR a **MongoDB Atlas** connection string configured in `backend/.env`.

### Step 1: Install Dependencies
From the project root directory, install dependencies for both backend and frontend:

```bash
npm run install:all
```

*(Alternatively: `cd backend && npm install`, then `cd ../frontend && npm install`)*

---

### Step 2: Choose Your Execution Mode

#### Option A: Vite Development Mode (Recommended for Development)
Runs the backend with auto-reload and Vite frontend with Hot Module Replacement (HMR) across two terminal windows:

**Terminal 1 — Backend API:**
```bash
npm run server
# Or: cd backend && npm run dev
```
- API URL: `http://localhost:5000`
- Dynamic Health Check: `http://localhost:5000/api/health`

**Terminal 2 — Frontend React App:**
```bash
npm run client
# Or: cd frontend && npm run dev
```
- Frontend Web App: `http://localhost:5173`

---

#### Option B: Single-Origin Production Run (Recommended for Viva/Presentations)
Builds the React frontend and configures Express to serve both the REST API and the frontend SPA from a single origin on port 5000:

```bash
# 1. Compile the React frontend
npm run build

# 2. Start the unified full-stack server
npm start
# Or: cd backend && npm start
```
- Full-Stack Application URL: `http://localhost:5000`
- REST API Base: `http://localhost:5000/api`
- Health Check: `http://localhost:5000/api/health`

---

## 🌱 Database Seeding & Sample Data

An optional seed script is included to populate your database with initial users, consignments, and chronological tracking events covering all 8 lifecycle statuses:

```bash
npm run seed
# Or: cd backend && npm run seed
```

### Seeded Demonstration Accounts
| Role | Email | Password | Privileges |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@courier.com` | `admin123` | Full access to Admin Hub, dispatch creation, status advancement modal, deletion |
| **Customer** | `customer@courier.com` | `user123` | Access to Customer Dashboard, My Shipments, and digital waybill manifest |

### Seeded Sample Tracking Numbers (Covering All 8 Statuses)
1. **`TRK-892147`** — **In Transit** (Mumbai $\to$ Bengaluru, Express Air, Electronics)
2. **`TRK-451209`** — **Out for Delivery** (Hyderabad $\to$ Bengaluru, Same Day Delivery, Diagnostic Supplies)
3. **`TRK-339812`** — **Delivered** (New Delhi $\to$ Bengaluru, Standard Delivery, Academic Transcript — *triggers confetti*)
4. **`TRK-771234`** — **Arrived at Facility** (Chennai $\to$ Bengaluru, Standard Delivery, Textiles)
5. **`TRK-552391`** — **Delivery Failed** (Pune $\to$ Bengaluru, Express Air, Heavy Freight Tools — *door locked/unreachable*)
6. **`TRK-664411`** — **Returned** (Kolkata $\to$ Bengaluru, Standard Delivery, Books — *returned to origin facility*)

---

## 🛡️ Secure Initial Admin Creation

To prevent unauthorized public users from granting themselves administrative privileges, public registration (`POST /api/auth/register`) strictly assigns the `customer` role.

To create or promote your first administrator account securely, run the documented CLI script:

```bash
cd backend

# Option A: Create admin using defaults from backend/.env (admin@courier.com / admin123)
npm run create-admin

# Option B: Create admin with custom credentials passed as CLI arguments
node scripts/createAdmin.js lead.admin@courier.com MyStrongPassword2026! "Head Logistics Administrator"
```

The script connects directly to MongoDB, hashes the password using bcrypt with 10 salt rounds, creates the user (or promotes an existing account if found), and assigns `role: 'admin'`.

---

## 📡 REST API Documentation & Health Check

### Dynamic Health Check Endpoint (`GET /api/health`)

Reports backend and database connection status dynamically **without exposing credentials, passwords, or connection strings**:

**Request:**
```http
GET /api/health HTTP/1.1
Host: localhost:5000
```

**Response (When Database is Connected):**
```json
{
  "status": "healthy",
  "service": "Cloud-Based Courier Tracking System API",
  "version": "1.0.0",
  "uptime": "142s",
  "timestamp": "2026-10-27T16:58:31.565Z",
  "database": {
    "status": "connected",
    "connected": true,
    "host": "cluster0.xxxxx.mongodb.net",
    "name": "courier_tracking_db"
  },
  "environment": "development",
  "port": 5000,
  "endpoints": {
    "auth": "/api/auth",
    "shipments": "/api/shipments",
    "tracking": "/api/tracking",
    "health": "/api/health"
  },
  "frontend": {
    "singleOriginServed": true,
    "viteDevUrl": "http://localhost:5173"
  }
}
```

---

### Complete API Endpoints Reference

#### 1. Authentication Routes (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register customer account (strictly forces customer role) |
| `POST` | `/api/auth/login` | Public | Authenticate user & return signed JWT token |
| `GET` | `/api/auth/profile` | Private | Retrieve authenticated user profile |
| `PUT` | `/api/auth/profile` | Private | Update user contact information and address |

#### 2. Public Tracking Routes (`/api/tracking`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/tracking/:trackingNumber` | **Public** | Look up package by tracking number (masks recipient privacy) |
| `POST` | `/api/tracking/:trackingNumber/checkpoint` | Private (Admin) | Append a manual checkpoint event to the tracking timeline |

#### 3. Shipment Management Routes (`/api/shipments`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/shipments` | Private | List shipments with pagination, status & date filters |
| `POST` | `/api/shipments` | Private (Admin) | Book consignment, calculate rate, and generate tracking ID |
| `GET` | `/api/shipments/stats/summary`| Private | Retrieve analytics metrics & revenue totals |
| `GET` | `/api/shipments/reports/analytics`| Private (Admin) | Aggregated reports grouped by status and date |
| `GET` | `/api/shipments/:id` | Private | Fetch single consignment with full checkpoint audit history |
| `PUT` | `/api/shipments/:id/status` | Private (Admin) | Advance shipment status and insert audit tracking event |
| `PUT` | `/api/shipments/:id` | Private (Admin) | Update parcel weight, dimensions, address details |
| `DELETE`| `/api/shipments/:id` | Private (Admin) | Remove shipment and associated tracking events |

---

## 🔧 Troubleshooting Guide

### 1. MongoDB Atlas Connection Timeout (`MongooseServerSelectionError`)
- **Symptom:** Server prints `[MongoDB Connection Error] Failed to connect: Server selection timed out after 5000 ms`.
- **Causes & Fixes:**
  1. **Network Access / IP Whitelist:** In MongoDB Atlas, go to **Network Access** and ensure your current IP address is added, or add `0.0.0.0/0` (Allow Access from Anywhere).
  2. **Special Characters in Password:** If your Atlas user password has special characters like `@`, `#`, `:`, `%`, URL-encode them (e.g., replace `@` with `%40`).
  3. **Local MongoDB Service Not Running:** If using `mongodb://127.0.0.1:27017`, start the service:
     - Windows (PowerShell as Admin): `net start MongoDB`
     - Linux / macOS: `sudo systemctl start mongod`

### 2. Port Already in Use (`EADDRINUSE: 5000`)
- **Symptom:** Server crashes with `Error: listen EADDRINUSE: address already in use :::5000`.
- **Fix:**
  - Find the PID using port 5000:
    ```powershell
    netstat -ano | findstr :5000
    ```
  - Terminate the process:
    ```powershell
    taskkill /PID <PID> /F
    ```
  - Or configure a different port in `backend/.env` (e.g. `PORT=5001`).

### 3. Port 5173 Already in Use by Vite
- **Symptom:** Vite starts on port 5174 instead of 5173.
- **Fix:** Either stop the other Vite instance or update `FRONTEND_URL=http://localhost:5174` in `backend/.env`.

### 4. Frontend Dist Not Found in Single-Origin Mode
- **Symptom:** Accessing `http://localhost:5000` displays the "API Online" landing card rather than the React app.
- **Fix:** Compile the React bundle by running:
  ```bash
  npm run build
  ```
  This creates `frontend/dist`, which Express automatically detects and serves.

### 5. JWT Authentication Errors (`401 Unauthorized`)
- **Symptom:** API requests return `Not authorized! Token is invalid or expired`.
- **Fix:** Clear browser localStorage (`localStorage.removeItem('courier_token')`), log in again through the login page to acquire a fresh JWT token, and ensure `JWT_SECRET` in `backend/.env` is consistent.

---

## 🎓 College Viva Voce & Defense Q&A

#### Q1: Why did you choose MongoDB instead of a relational database like MySQL?
> **Answer:** Logistics and courier tracking data is document-centric and hierarchically structured (consignor, consignee, nested dimensions, dynamic arrays of tracking events). MongoDB's flexible BSON document model allows us to index `trackingNumber` for $O(1)$ query performance and embed or reference tracking milestones without complex multi-table relational joins.

#### Q2: How does the tracking number generation work?
> **Answer:** In `shipmentController.js`, an automated generator produces standard `TRK-XXXXXX` identifiers and verifies uniqueness in the database before booking the order, ensuring no tracking collisions.

#### Q3: How is user authentication secured?
> **Answer:** Passwords are encrypted using **Bcrypt.js** with 10 salt rounds before being stored. Upon successful verification, the server issues a signed **JSON Web Token (JWT)** containing the user's ID. The client sends this token in the `Authorization: Bearer <token>` header for protected endpoints.

#### Q4: How is Role-Based Access Control (RBAC) enforced?
> **Answer:** On the backend, we implement middleware functions: `protect` (which decodes and verifies the JWT) and `adminOnly` (which asserts `req.user.role === 'admin'`). If an unauthorized customer attempts to update shipment statuses or delete records, the server returns an HTTP 403 Forbidden response.

#### Q5: Can users track their parcels without logging in?
> **Answer:** Yes. The `/api/tracking/:trackingNumber` endpoint and the frontend `/track` page are completely public. To preserve customer privacy, the backend masks recipient and sender personal names and excludes doorstep addresses from the public response.

#### Q6: How does the system calculate freight charges?
> **Answer:** The system dynamically computes rates based on the chosen Service Tier (Standard: ₹120, Express Air: ₹250, Same Day: ₹420) plus an incremental gross weight surcharge (₹35 per kg).

#### Q7: How are the tracking timeline checkpoints updated?
> **Answer:** Whenever an admin updates a shipment status via `PUT /api/shipments/:id/status`, the system updates the current location in the `Shipment` record and simultaneously inserts an immutable `TrackingEvent` document with a UTC timestamp, facility name, and operator remarks.

---

## 📜 Academic Declaration
This project is submitted in partial fulfillment of the requirements for the degree of Bachelor of Technology / Bachelor of Engineering in Computer Science & Engineering / Information Technology.

© 2026 **CloudTrack™** — All rights reserved.
