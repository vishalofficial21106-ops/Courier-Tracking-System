import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Boxes,
  Truck,
  CheckCircle,
  Clock,
  Search,
  ArrowRight,
  Eye,
  MapPin,
  Package,
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';

const CustomerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    delivered: 0,
  });
  const [recentShipments, setRecentShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quickTrack, setQuickTrack] = useState('');

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const res = await api.getAllShipments();
        if (res.success) {
          const list = res.shipments || [];
          setRecentShipments(list.slice(0, 5));

          const activeCount = list.filter(
            (s) => s.status !== 'Delivered' && s.status !== 'Cancelled'
          ).length;
          const deliveredCount = list.filter((s) => s.status === 'Delivered').length;

          setStats({
            total: list.length,
            active: activeCount,
            delivered: deliveredCount,
          });
        }
      } catch (err) {
        console.error('Failed to load customer dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const handleQuickTrackSubmit = (e) => {
    e.preventDefault();
    if (quickTrack.trim()) {
      navigate(`/track?num=${encodeURIComponent(quickTrack.trim())}`);
    }
  };

  return (
    <div className="page-wrapper">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Customer Dashboard</h1>
          <p className="page-subtitle">
            Welcome back, <strong>{user?.name || 'Customer'}</strong>! Here is an overview of your active deliveries.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/my-shipments" className="btn btn-primary">
            <Boxes size={18} /> View All Shipments
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon indigo">
            <Boxes size={26} />
          </div>
          <div>
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Shipments Booked</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon amber">
            <Truck size={26} />
          </div>
          <div>
            <div className="stat-value">{stats.active}</div>
            <div className="stat-label">Parcels In Transit / Out</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon emerald">
            <CheckCircle size={26} />
          </div>
          <div>
            <div className="stat-value">{stats.delivered}</div>
            <div className="stat-label">Successfully Delivered</div>
          </div>
        </div>
      </div>

      {/* Quick Search Widget */}
      <div className="card" style={{ marginBottom: '2rem', padding: '1.5rem', background: '#f8fafc' }}>
        <form onSubmit={handleQuickTrackSubmit} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Search by Tracking ID (e.g. TRK-892147)..."
              value={quickTrack}
              onChange={(e) => setQuickTrack(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
            />
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: '0.85rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94a3b8',
              }}
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Track Now
          </button>
        </form>
      </div>

      {/* Recent Shipments Table */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 className="card-title" style={{ margin: 0 }}>
            Recent Consignments
          </h3>
          <Link to="/my-shipments" style={{ fontSize: '0.875rem', color: '#4f46e5', fontWeight: 600 }}>
            View All ({stats.total}) →
          </Link>
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>Loading consignments...</p>
        ) : recentShipments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
            <Package size={40} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
            <p style={{ fontWeight: 600, color: '#334155' }}>No shipments found under your profile.</p>
            <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
              Parcels sent to your email or booked through the portal will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tracking Number</th>
                  <th>Route</th>
                  <th>Status</th>
                  <th>Package Details</th>
                  <th>Estimated Delivery</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentShipments.map((s) => (
                  <tr key={s._id || s.trackingNumber}>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0f172a' }}>
                        {s.trackingNumber}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.875rem' }}>
                        <span>{s.origin}</span>
                        <ArrowRight size={14} style={{ color: '#94a3b8' }} />
                        <strong>{s.destination}</strong>
                      </div>
                    </td>
                    <td>
                      <StatusBadge status={s.status} />
                    </td>
                    <td>
                      <span style={{ fontSize: '0.85rem' }}>
                        {s.packageType} ({s.weight} kg)
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.85rem', color: '#475569' }}>
                        {new Date(s.estimatedDelivery).toLocaleDateString()}
                      </span>
                    </td>
                    <td>
                      <Link
                        to={`/shipment/${s._id || s.trackingNumber}`}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.35rem 0.65rem' }}
                      >
                        <Eye size={14} /> View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard;
