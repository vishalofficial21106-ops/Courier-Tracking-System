import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert } from 'lucide-react';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '6rem 1rem' }}>
        <div className="stat-icon indigo" style={{ margin: '0 auto 1rem', width: '48px', height: '48px' }}>
          ⌛
        </div>
        <p style={{ color: '#64748b', fontWeight: 600 }}>Checking authentication session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    return (
      <div className="page-wrapper">
        <div className="alert alert-error" style={{ padding: '2rem', textAlign: 'center', display: 'block' }}>
          <ShieldAlert size={48} style={{ margin: '0 auto 1rem', color: '#dc2626' }} />
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem', color: '#991b1b' }}>
            Access Denied
          </h2>
          <p style={{ color: '#7f1d1d', marginBottom: '1.5rem' }}>
            Administrator authorization is required to view this dispatch management module.
          </p>
          <a href="/dashboard" className="btn btn-secondary">
            Return to Customer Dashboard
          </a>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
