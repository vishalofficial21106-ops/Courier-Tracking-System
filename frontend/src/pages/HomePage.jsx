import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Search,
  Truck,
  ShieldCheck,
  Zap,
  Globe,
  ArrowRight,
  Package,
  Clock,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';

const HomePage = () => {
  const [trackingNumber, setTrackingNumber] = useState('');
  const navigate = useNavigate();

  const handleTrackSubmit = (e) => {
    e.preventDefault();
    if (trackingNumber.trim()) {
      navigate(`/track?num=${encodeURIComponent(trackingNumber.trim())}`);
    }
  };

  const sampleTrackingNumbers = [
    { code: 'TRK-892147', status: 'In Transit', route: 'Mumbai → Bengaluru' },
    { code: 'TRK-451209', status: 'Out for Delivery', route: 'Hyderabad → Bengaluru' },
    { code: 'TRK-339812', status: 'Delivered', route: 'New Delhi → Bengaluru' },
    { code: 'TRK-771234', status: 'Arrived at Facility', route: 'Chennai → Bengaluru' },
    { code: 'TRK-552391', status: 'Delivery Failed', route: 'Pune → Bengaluru' },
    { code: 'TRK-664411', status: 'Returned', route: 'Kolkata → Bengaluru' },
  ];

  return (
    <div style={{ background: '#f8fafc' }}>
      {/* Hero Section */}
      <section
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #172554 100%)',
          color: '#ffffff',
          padding: '5rem 1.5rem 5.5rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Glow ambient circle */}
        <div
          style={{
            position: 'absolute',
            top: '-20%',
            right: '-10%',
            width: '600px',
            height: '600px',
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, rgba(0,0,0,0) 70%)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ maxWidth: '1100px', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              padding: '0.4rem 1rem',
              borderRadius: '999px',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: '#38bdf8',
              marginBottom: '1.75rem',
              backdropFilter: 'blur(8px)',
            }}
          >
            <Zap size={16} /> Cloud-Powered Courier & Logistics Telemetry System
          </div>

          <h1
            style={{
              fontSize: 'clamp(2.4rem, 5vw, 3.8rem)',
              fontWeight: 800,
              lineHeight: 1.15,
              marginBottom: '1.25rem',
              letterSpacing: '-0.03em',
              color: '#ffffff',
            }}
          >
            Track Any Parcel in Real Time <br />
            <span
              style={{
                background: 'linear-gradient(90deg, #38bdf8, #818cf8, #c084fc)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              From Dispatch to Doorstep
            </span>
          </h1>

          <p
            style={{
              fontSize: '1.15rem',
              color: '#94a3b8',
              maxWidth: '680px',
              margin: '0 auto 2.5rem',
              lineHeight: 1.6,
            }}
          >
            Complete cloud logistics platform featuring automated milestone checkpoints, live tracking timelines, role-based dispatcher control, and secure customer delivery visibility.
          </p>

          {/* Quick Tracking Search Box */}
          <div
            style={{
              maxWidth: '640px',
              margin: '0 auto 1.5rem',
              background: '#ffffff',
              padding: '0.5rem',
              borderRadius: '16px',
              boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.4)',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.5rem',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                flex: 1,
                minWidth: '220px',
                padding: '0.5rem 0.75rem',
                gap: '0.75rem',
              }}
            >
              <Search size={22} style={{ color: '#6366f1' }} />
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Enter Tracking ID (e.g., TRK-892147)..."
                style={{
                  border: 'none',
                  fontSize: '1.05rem',
                  width: '100%',
                  color: '#0f172a',
                  fontWeight: 600,
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleTrackSubmit(e)}
              />
            </div>
            <button
              onClick={handleTrackSubmit}
              className="btn btn-primary"
              style={{ padding: '0.85rem 1.75rem', borderRadius: '12px' }}
            >
              Track Now <ArrowRight size={18} />
            </button>
          </div>

          {/* Sample IDs Quick Click */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.825rem', color: '#cbd5e1' }}>Try sample tracking IDs:</span>
            {sampleTrackingNumbers.map((sample) => (
              <button
                key={sample.code}
                onClick={() => navigate(`/track?num=${sample.code}`)}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#ffffff',
                  padding: '0.25rem 0.65rem',
                  borderRadius: '999px',
                  fontSize: '0.775rem',
                  fontFamily: 'monospace',
                  fontWeight: 600,
                  transition: 'background 0.2s',
                }}
                onMouseOver={(e) => (e.target.style.background = 'rgba(255, 255, 255, 0.25)')}
                onMouseOut={(e) => (e.target.style.background = 'rgba(255, 255, 255, 0.1)')}
              >
                {sample.code} ({sample.status})
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* College Presentation / Quick Demo Switcher Section */}
      <section style={{ maxWidth: '1100px', margin: '-2.5rem auto 3rem', padding: '0 1.5rem', position: 'relative', zIndex: 10 }}>
        <div
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: '1.5rem 2rem',
            border: '1px solid #e2e8f0',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1.25rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
                Academic Project Demonstration Portal
              </h3>
            </div>
            <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
              Test both Admin (Hub manager, dispatch, update status) and Customer (order booking, my parcels) workflows instantly.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link to="/login" className="btn btn-secondary btn-sm">
              <Lock size={15} /> Demo Sign In
            </Link>
            <Link to="/track?num=TRK-892147" className="btn btn-primary btn-sm">
              <Truck size={15} /> Live Track Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
            Engineered for Modern Logistics
          </h2>
          <p style={{ color: '#64748b', fontSize: '1rem', marginTop: '0.5rem' }}>
            Core capabilities designed for real-world parcel distribution management.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
          <div className="card" style={{ padding: '1.75rem' }}>
            <div className="stat-icon indigo" style={{ marginBottom: '1.25rem' }}>
              <Zap size={24} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              Real-Time Tracking Events
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.5 }}>
              Automatic sequential checkpoint updates from order booking, warehouse pickup, highway transit, to final doorstep drop.
            </p>
          </div>

          <div className="card" style={{ padding: '1.75rem' }}>
            <div className="stat-icon cyan" style={{ marginBottom: '1.25rem' }}>
              <Package size={24} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              Digital Shipping Manifest
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.5 }}>
              Unique alphanumeric tracking IDs with simulated barcode & QR labels, recipient metadata, and package weight calculation.
            </p>
          </div>

          <div className="card" style={{ padding: '1.75rem' }}>
            <div className="stat-icon emerald" style={{ marginBottom: '1.25rem' }}>
              <ShieldCheck size={24} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              Role-Based Access Control
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.5 }}>
              Secured with JWT tokens and Bcrypt password encryption. Dedicated dashboards for admin dispatchers and end customers.
            </p>
          </div>

          <div className="card" style={{ padding: '1.75rem' }}>
            <div className="stat-icon amber" style={{ marginBottom: '1.25rem' }}>
              <Globe size={24} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              Cloud-Native Scalability
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.5 }}>
              Built on MongoDB Atlas with schema-optimized Mongoose ODM, enabling high read-throughput for millions of public tracking hits.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section style={{ background: '#ffffff', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', padding: '4.5rem 1.5rem' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span style={{ color: '#4f46e5', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Workflow Progression
            </span>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginTop: '0.4rem' }}>
              How CloudTrack Works
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2rem' }}>
            {[
              { step: '01', title: 'Booking & Label', desc: 'Consignor enters sender & recipient details. Unique tracking ID & barcode generated.', icon: <Package size={22} /> },
              { step: '02', title: 'Pickup & Dispatch', desc: 'Courier agent scans parcel at origin hub. First transit event logged in cloud database.', icon: <Truck size={22} /> },
              { step: '03', title: 'Hub-to-Hub Transit', desc: 'Automated conveyor checkpoints log progress as the package travels interstate.', icon: <Clock size={22} /> },
              { step: '04', title: 'Doorstep Delivery', desc: 'Delivery partner delivers to recipient, collecting digital signature and closing order.', icon: <CheckCircle2 size={22} /> },
            ].map((s) => (
              <div key={s.step} style={{ position: 'relative' }}>
                <span style={{ fontSize: '3rem', fontWeight: 800, color: '#e2e8f0', fontFamily: 'Outfit, sans-serif', lineHeight: 1 }}>
                  {s.step}
                </span>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0.5rem 0 0.5rem', color: '#0f172a' }}>
                  {s.title}
                </h4>
                <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.5 }}>
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section style={{ maxWidth: '1100px', margin: '4rem auto 5rem', padding: '0 1.5rem', textAlign: 'center' }}>
        <div
          style={{
            background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)',
            borderRadius: '24px',
            padding: '3.5rem 2rem',
            color: '#ffffff',
            boxShadow: '0 20px 40px -10px rgba(79, 70, 229, 0.4)',
          }}
        >
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.75rem' }}>
            Ready to Explore the Tracking System?
          </h2>
          <p style={{ fontSize: '1.05rem', color: '#e0e7ff', maxWidth: '580px', margin: '0 auto 2rem' }}>
            Look up any sample package or log in to the administrator portal to create, update, and manage shipments.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/track" className="btn btn-secondary btn-lg" style={{ color: '#4f46e5' }}>
              Track A Shipment
            </Link>
            <Link to="/login" className="btn btn-lg" style={{ background: '#0f172a', color: '#ffffff' }}>
              Access Portal
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
