import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Layout Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import TrackParcelPage from './pages/TrackParcelPage';
import CustomerDashboard from './pages/CustomerDashboard';
import MyShipmentsPage from './pages/MyShipmentsPage';
import AdminDashboard from './pages/AdminDashboard';
import CreateShipmentPage from './pages/CreateShipmentPage';
import ManageShipmentsPage from './pages/ManageShipmentsPage';
import ShipmentDetailsPage from './pages/ShipmentDetailsPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app-container">
          <Navbar />
          <main className="main-content">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/track" element={<TrackParcelPage />} />
              <Route path="/shipment/:id" element={<ShipmentDetailsPage />} />

              {/* Customer Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <CustomerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-shipments"
                element={
                  <ProtectedRoute>
                    <MyShipmentsPage />
                  </ProtectedRoute>
                }
              />

              {/* Admin Protected Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute adminOnly={true}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/create-shipment"
                element={
                  <ProtectedRoute adminOnly={true}>
                    <CreateShipmentPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/manage-shipments"
                element={
                  <ProtectedRoute adminOnly={true}>
                    <ManageShipmentsPage />
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
