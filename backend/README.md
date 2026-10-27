# 🚀 Cloud-Based Courier Tracking System - Backend API

> **Node.js, Express.js, MongoDB Atlas (Mongoose ODM), JWT, and Bcrypt.js**

---

## 🔒 Security Architecture Highlights

1. **Role-Based Access Control (RBAC)**:
   - Middleware `protect` verifies signed JWT tokens in the `Authorization: Bearer <token>` header.
   - Middleware `adminOnly` asserts `req.user.role === 'admin'`.
   - Untrusted roles from client payloads are strictly rejected: public registration forces `role = 'customer'`.
   - Customer ownership enforcement: Non-admin users can ONLY query and inspect shipments associated with their account.
2. **Public Tracking Privacy Masking**:
   - `GET /api/tracking/:trackingNumber` is completely public and intentionally masks recipient and sender names (`R***** S*****`) and excludes doorstep addresses, phone numbers, and financial freight costs.
3. **Password Security**:
   - Encrypted with `bcryptjs` using 10 salt rounds.
   - Mongoose schema utilizes `select: false` to ensure password hashes are never returned in queries or serialization.
4. **Credential Safety & Health Inspection**:
   - `GET /api/health` dynamically reports database connection state (`connected` / `disconnected` / `connecting`) without revealing database passwords or connection URIs.
   - Logs mask credentials in console output (`mongodb+srv://admin:*****@cluster0...`).

---

## ⚙️ Environment Variables (`backend/.env`)

A template file with placeholder values is provided in `backend/.env.example`:

```env
PORT=5000
NODE_ENV=development

# MongoDB Atlas URI (or local MongoDB)
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/courier_tracking_db?retryWrites=true&w=majority

# JWT Authentication
JWT_SECRET=your_jwt_secret_key_minimum_32_characters_here
JWT_EXPIRE=30d

# Optional Admin Registration Secret Key
ADMIN_REGISTRATION_KEY=your_admin_registration_secret_key_here

# Initial Admin Account Setup Defaults (used by 'npm run create-admin')
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your_secure_admin_password_here
ADMIN_NAME="Central Admin Logistics"

# Frontend Origin for CORS
FRONTEND_URL=http://localhost:5173
```

---

## 🛡️ Documented Method to Create the Initial Admin

To ensure that random public users cannot grant themselves administrator rights, public registration defaults strictly to `'customer'`. Use the dedicated CLI script to create or promote an admin account:

```bash
# 1. Using default parameters from .env
npm run create-admin

# 2. Or pass custom parameters directly:
node scripts/createAdmin.js lead.admin@courier.com MySecurePass2026! "Head of Dispatch"
```

---

## 📡 API Endpoints Reference

### 1. Dynamic Health Check (`/api/health`)
- `GET /api/health`: Reports server status, uptime, and live MongoDB connection state without exposing credentials.

### 2. Authentication (`/api/auth`)
- `POST /api/auth/register`: Register new customer (role forced to `customer`).
- `POST /api/auth/login`: Authenticate and receive signed JWT.
- `GET /api/auth/profile`: Protected profile retrieval.
- `PUT /api/auth/profile`: Update user contact and address.

### 3. Public Tracking (`/api/tracking`)
- `GET /api/tracking/:trackingNumber`: Public parcel lookup with milestone progression and privacy masking.
- `POST /api/tracking/:trackingNumber/checkpoint`: **(Admin Only)** Append manual audit checkpoint.

### 4. Shipments Management (`/api/shipments`)
- `POST /api/shipments`: **(Admin Only)** Book consignment, calculate rate, and generate unique tracking ID (`TRK-XXXXXX`).
- `GET /api/shipments`: Filter and search shipments (Admin sees all; Customer sees only owned) with pagination.
- `GET /api/shipments/:id`: Detailed waybill inspection (Admin or authorized owner).
- `PUT /api/shipments/:id/status`: **(Admin Only)** Update status, current hub city, and log checkpoint event.
- `PUT /api/shipments/:id`: **(Admin Only)** Modify consignment dimensions/specs.
- `DELETE /api/shipments/:id`: **(Admin Only)** Delete shipment and associated event logs.
- `GET /api/shipments/stats/summary`: Dashboard counters and financial metrics.
- `GET /api/shipments/reports/analytics`: Aggregated shipment counts by status and booking date.

---

## 🧪 Testing the API

```bash
# Run server in development mode (http://localhost:5000)
npm run dev

# Run automated seeder (creates sample shipments and tracking events)
npm run seed

# Create initial admin account
npm run create-admin
```
