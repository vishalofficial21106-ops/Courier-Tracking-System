import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Package,
  Search,
  LayoutDashboard,
  Boxes,
  PlusCircle,
  Settings,
  LogIn,
  LogOut,
  UserPlus,
  Shield,
  Menu,
  X,
  Truck,
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header
      style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
      }}
    >
      <div
        style={{
          maxWidth: '1240px',
          margin: '0 auto',
          padding: '0.85rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Brand Logo */}
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            textDecoration: 'none',
          }}
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)',
            }}
          >
            <Truck size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span
                style={{
                  fontFamily: 'Outfit, sans-serif',
                  fontWeight: '800',
                  fontSize: '1.35rem',
                  color: '#0f172a',
                  letterSpacing: '-0.02em',
                }}
              >
                Cloud<span style={{ color: '#4f46e5' }}>Track</span>
              </span>
              <span
                style={{
                  fontSize: '0.65rem',
                  fontWeight: '700',
                  padding: '0.15rem 0.45rem',
                  borderRadius: '999px',
                  background: '#e0e7ff',
                  color: '#4338ca',
                  textTransform: 'uppercase',
                }}
              >
                v1.0
              </span>
            </div>
            <p style={{ fontSize: '0.7rem', color: '#64748b', margin: 0, fontWeight: 500 }}>
              Cloud-Based Courier Tracking
            </p>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.25rem',
          }}
          className="desktop-nav"
        >
          <Link
            to="/"
            style={{
              fontWeight: 600,
              fontSize: '0.925rem',
              color: isActive('/') ? '#4f46e5' : '#475569',
              padding: '0.5rem 0.75rem',
              borderRadius: '8px',
              backgroundColor: isActive('/') ? '#eef2ff' : 'transparent',
              transition: 'all 0.2s',
            }}
          >
            Home
          </Link>

          <Link
            to="/track"
            style={{
              fontWeight: 600,
              fontSize: '0.925rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: isActive('/track') ? '#4f46e5' : '#475569',
              padding: '0.5rem 0.75rem',
              borderRadius: '8px',
              backgroundColor: isActive('/track') ? '#eef2ff' : 'transparent',
              transition: 'all 0.2s',
            }}
          >
            <Search size={16} />
            Track Parcel
          </Link>

          {/* Authenticated Customer Links */}
          {isAuthenticated && !isAdmin && (
            <>
              <Link
                to="/dashboard"
                style={{
                  fontWeight: 600,
                  fontSize: '0.925rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  color: isActive('/dashboard') ? '#4f46e5' : '#475569',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '8px',
                  backgroundColor: isActive('/dashboard') ? '#eef2ff' : 'transparent',
                }}
              >
                <LayoutDashboard size={16} />
                Dashboard
              </Link>
              <Link
                to="/my-shipments"
                style={{
                  fontWeight: 600,
                  fontSize: '0.925rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  color: isActive('/my-shipments') ? '#4f46e5' : '#475569',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '8px',
                  backgroundColor: isActive('/my-shipments') ? '#eef2ff' : 'transparent',
                }}
              >
                <Boxes size={16} />
                My Shipments
              </Link>
            </>
          )}

          {/* Admin Links */}
          {isAuthenticated && isAdmin && (
            <>
              <Link
                to="/admin"
                style={{
                  fontWeight: 600,
                  fontSize: '0.925rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  color: isActive('/admin') ? '#4f46e5' : '#475569',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '8px',
                  backgroundColor: isActive('/admin') ? '#eef2ff' : 'transparent',
                }}
              >
                <LayoutDashboard size={16} />
                Admin Hub
              </Link>
              <Link
                to="/admin/create-shipment"
                style={{
                  fontWeight: 600,
                  fontSize: '0.925rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  color: isActive('/admin/create-shipment') ? '#4f46e5' : '#475569',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '8px',
                  backgroundColor: isActive('/admin/create-shipment') ? '#eef2ff' : 'transparent',
                }}
              >
                <PlusCircle size={16} />
                Create Shipment
              </Link>
              <Link
                to="/admin/manage-shipments"
                style={{
                  fontWeight: 600,
                  fontSize: '0.925rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  color: isActive('/admin/manage-shipments') ? '#4f46e5' : '#475569',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '8px',
                  backgroundColor: isActive('/admin/manage-shipments') ? '#eef2ff' : 'transparent',
                }}
              >
                <Settings size={16} />
                Manage Shipments
              </Link>
            </>
          )}
        </nav>

        {/* Right Authentication CTA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }} className="desktop-nav">
          {!isAuthenticated ? (
            <>
              <Link to="/login" className="btn btn-secondary btn-sm">
                <LogIn size={15} />
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                <UserPlus size={15} />
                Register
              </Link>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.35rem 0.75rem',
                  background: '#f1f5f9',
                  borderRadius: '999px',
                }}
              >
                <span
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    background: isAdmin ? '#4f46e5' : '#059669',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                  }}
                >
                  {isAdmin ? <Shield size={14} /> : user?.name?.[0]?.toUpperCase() || 'U'}
                </span>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b' }}>
                  {user?.name?.split(' ')[0] || 'User'}
                </span>
                <span
                  style={{
                    fontSize: '0.7rem',
                    padding: '0.1rem 0.4rem',
                    borderRadius: '4px',
                    background: isAdmin ? '#e0e7ff' : '#d1fae5',
                    color: isAdmin ? '#3730a3' : '#065f46',
                    fontWeight: 700,
                  }}
                >
                  {user?.role?.toUpperCase()}
                </span>
              </div>

              <button
                onClick={handleLogout}
                className="btn btn-secondary btn-sm"
                title="Log out"
                style={{ padding: '0.4rem 0.6rem' }}
              >
                <LogOut size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{
            display: 'none',
            padding: '0.5rem',
            color: '#334155',
          }}
          className="mobile-toggle"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          style={{
            background: '#ffffff',
            borderTop: '1px solid #e2e8f0',
            padding: '1rem 1.5rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}
        >
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            style={{ fontWeight: 600, padding: '0.5rem', color: '#1e293b' }}
          >
            Home
          </Link>
          <Link
            to="/track"
            onClick={() => setMobileMenuOpen(false)}
            style={{ fontWeight: 600, padding: '0.5rem', color: '#1e293b' }}
          >
            Track Parcel
          </Link>

          {isAuthenticated && !isAdmin && (
            <>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                style={{ fontWeight: 600, padding: '0.5rem', color: '#1e293b' }}
              >
                Customer Dashboard
              </Link>
              <Link
                to="/my-shipments"
                onClick={() => setMobileMenuOpen(false)}
                style={{ fontWeight: 600, padding: '0.5rem', color: '#1e293b' }}
              >
                My Shipments
              </Link>
            </>
          )}

          {isAuthenticated && isAdmin && (
            <>
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                style={{ fontWeight: 600, padding: '0.5rem', color: '#1e293b' }}
              >
                Admin Hub
              </Link>
              <Link
                to="/admin/create-shipment"
                onClick={() => setMobileMenuOpen(false)}
                style={{ fontWeight: 600, padding: '0.5rem', color: '#1e293b' }}
              >
                Create Shipment
              </Link>
              <Link
                to="/admin/manage-shipments"
                onClick={() => setMobileMenuOpen(false)}
                style={{ fontWeight: 600, padding: '0.5rem', color: '#1e293b' }}
              >
                Manage Shipments
              </Link>
            </>
          )}

          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '0.75rem' }}>
            {!isAuthenticated ? (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn btn-secondary btn-full btn-sm"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn btn-primary btn-full btn-sm"
                >
                  Register
                </Link>
              </div>
            ) : (
              <button onClick={handleLogout} className="btn btn-danger btn-full btn-sm">
                Log Out ({user?.name})
              </button>
            )}
          </div>
        </div>
      )}

      {/* Inline styles for media query responsive toggle */}
      <style>{`
        @media (max-width: 860px) {
          .desktop-nav { display: none !important; }
          .mobile-toggle { display: block !important; }
        }
      `}</style>
    </header>
  );
};

export default Navbar;
