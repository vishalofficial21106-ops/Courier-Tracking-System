import React from 'react';
import { Link } from 'react-router-dom';
import { Truck, ShieldCheck, Heart, Database, Server, Code } from 'lucide-react';

const Footer = () => {
  return (
    <footer
      style={{
        backgroundColor: '#0f172a',
        color: '#94a3b8',
        borderTop: '1px solid #1e293b',
        padding: '3.5rem 1.5rem 2rem',
        marginTop: 'auto',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '2.5rem',
          marginBottom: '2.5rem',
        }}
      >
        {/* Col 1: System Info */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
              }}
            >
              <Truck size={18} />
            </div>
            <span
              style={{
                fontFamily: 'Outfit, sans-serif',
                fontWeight: '700',
                fontSize: '1.2rem',
                color: '#ffffff',
              }}
            >
              Cloud<span style={{ color: '#818cf8' }}>Track</span>
            </span>
          </div>
          <p style={{ fontSize: '0.875rem', lineHeight: 1.6, color: '#94a3b8' }}>
            A comprehensive, cloud-native logistics & courier management solution built for real-time parcel visibility, dispatch tracking, and seamless delivery management.
          </p>
          <div
            style={{
              marginTop: '1rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.75rem',
              background: '#1e293b',
              padding: '0.35rem 0.75rem',
              borderRadius: '999px',
              color: '#38bdf8',
            }}
          >
            <ShieldCheck size={14} /> Full-Stack College Major Project
          </div>
        </div>

        {/* Col 2: Quick Links */}
        <div>
          <h4 style={{ color: '#ffffff', fontSize: '0.95rem', fontWeight: '700', marginBottom: '1rem' }}>
            Quick Navigation
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.875rem' }}>
            <li>
              <Link to="/" style={{ color: '#94a3b8', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = '#ffffff'} onMouseOut={e => e.target.style.color = '#94a3b8'}>
                Home Overview
              </Link>
            </li>
            <li>
              <Link to="/track" style={{ color: '#94a3b8', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = '#ffffff'} onMouseOut={e => e.target.style.color = '#94a3b8'}>
                Live Parcel Tracker
              </Link>
            </li>
            <li>
              <Link to="/login" style={{ color: '#94a3b8', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = '#ffffff'} onMouseOut={e => e.target.style.color = '#94a3b8'}>
                User & Admin Sign In
              </Link>
            </li>
            <li>
              <Link to="/register" style={{ color: '#94a3b8', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = '#ffffff'} onMouseOut={e => e.target.style.color = '#94a3b8'}>
                Create Customer Account
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 3: Tech Stack Highlights */}
        <div>
          <h4 style={{ color: '#ffffff', fontSize: '0.95rem', fontWeight: '700', marginBottom: '1rem' }}>
            Technology Architecture
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
            {['React.js (Vite)', 'Node.js', 'Express.js', 'MongoDB Atlas', 'Mongoose ODM', 'JWT Auth', 'Bcrypt.js', 'Modern CSS3', 'REST API'].map((tech) => (
              <span
                key={tech}
                style={{
                  background: '#1e293b',
                  color: '#cbd5e1',
                  fontSize: '0.75rem',
                  padding: '0.25rem 0.6rem',
                  borderRadius: '6px',
                  fontWeight: 500,
                  border: '1px solid #334155',
                }}
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Col 4: Viva / Demo Testing Identifiers */}
        <div>
          <h4 style={{ color: '#ffffff', fontSize: '0.95rem', fontWeight: '700', marginBottom: '1rem' }}>
            Viva Demo Track IDs
          </h4>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.75rem' }}>
            Click to test instant tracking in live demonstration:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.825rem' }}>
            <Link
              to="/track?num=TRK-892147"
              style={{ color: '#f59e0b', fontFamily: 'monospace', fontWeight: 600 }}
            >
              TRK-892147 <span style={{ color: '#64748b', fontSize: '0.75rem' }}>(In Transit)</span>
            </Link>
            <Link
              to="/track?num=TRK-451209"
              style={{ color: '#38bdf8', fontFamily: 'monospace', fontWeight: 600 }}
            >
              TRK-451209 <span style={{ color: '#64748b', fontSize: '0.75rem' }}>(Out for Delivery)</span>
            </Link>
            <Link
              to="/track?num=TRK-339812"
              style={{ color: '#10b981', fontFamily: 'monospace', fontWeight: 600 }}
            >
              TRK-339812 <span style={{ color: '#64748b', fontSize: '0.75rem' }}>(Delivered)</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          paddingTop: '1.5rem',
          borderTop: '1px solid #1e293b',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          fontSize: '0.8rem',
        }}
      >
        <p>© 2026 Cloud-Based Courier Tracking System. Academic College Project.</p>
        <p style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          Crafted with Node.js & React
        </p>
      </div>
    </footer>
  );
};

export default Footer;
