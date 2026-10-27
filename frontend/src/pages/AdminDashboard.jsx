import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import {
  Boxes,
  Truck,
  CheckCircle,
  PlusCircle,
  Settings,
  DollarSign,
  TrendingUp,
  Clock,
  ArrowRight,
  Shield,
  Eye,
  AlertCircle,
  Search,
  Calendar,
  Filter,
  RefreshCw,
  Printer,
  FileText,
  PackageCheck,
  Send,
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import ReportCharts from '../components/ReportCharts';

const AdminDashboard = () => {
  const navigate = useNavigate();

  // Primary stats state
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    booked: 0,
    pickedUp: 0,
    inTransit: 0,
    arrivedAtFacility: 0,
    outForDelivery: 0,
    delivered: 0,
    deliveryFailed: 0,
    returned: 0,
    cancelled: 0,
    totalRevenue: 0,
  });

  // Reporting & Aggregation state
  const [reportsData, setReportsData] = useState({
    summary: {},
    statusDistribution: [],
    dateTrends: [],
  });

  // Filter state for analytics reports
  const [reportStartDate, setReportStartDate] = useState('');
  const [reportEndDate, setReportEndDate] = useState('');
  const [reportStatus, setReportStatus] = useState('All');

  const [recentShipments, setRecentShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reportsLoading, setReportsLoading] = useState(true);

  // Quick tracking number search state
  const [trackingSearch, setTrackingSearch] = useState('');
  const [searchError, setSearchError] = useState('');

  // 1. Fetch Overview Statistics & Recent Dispatches
  const fetchAdminStats = async () => {
    setLoading(true);
    try {
      const res = await api.getDashboardStats();
      if (res.success) {
        setStats(res.stats || {});
        setRecentShipments(res.recentShipments || []);
      }
    } catch (err) {
      console.error('[Admin Dashboard Stats Error]:', err);
    } finally {
      setLoading(false);
    }
  };

  // 2. Fetch Grouped Reports (MongoDB Aggregation)
  const fetchReports = async () => {
    setReportsLoading(true);
    try {
      const res = await api.getShipmentReports({
        startDate: reportStartDate,
        endDate: reportEndDate,
        status: reportStatus,
      });
      if (res.success) {
        setReportsData({
          summary: res.summary || {},
          statusDistribution: res.statusDistribution || [],
          dateTrends: res.dateTrends || [],
        });
      }
    } catch (err) {
      console.error('[Admin Reports Fetch Error]:', err);
    } finally {
      setReportsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminStats();
    fetchReports();
  }, []);

  const handleApplyReportFilters = (e) => {
    e.preventDefault();
    fetchReports();
  };

  const handleResetReportFilters = () => {
    setReportStartDate('');
    setReportEndDate('');
    setReportStatus('All');
    setTimeout(() => {
      api.getShipmentReports({ status: 'All' }).then((res) => {
        if (res.success) {
          setReportsData({
            summary: res.summary || {},
            statusDistribution: res.statusDistribution || [],
            dateTrends: res.dateTrends || [],
          });
        }
      });
    }, 50);
  };

  // Handle Quick Tracking Search
  const handleTrackingSearchSubmit = (e) => {
    e.preventDefault();
    setSearchError('');
    const cleanNum = trackingSearch.trim().toUpperCase();
    if (!cleanNum) {
      setSearchError('Please enter a tracking number.');
      return;
    }
    navigate(`/track?num=${encodeURIComponent(cleanNum)}`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="page-header no-print">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span
              style={{
                background: '#e0e7ff',
                color: '#4338ca',
                padding: '0.2rem 0.6rem',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
              }}
            >
              <Shield size={13} /> Dispatch Master & Analytics
            </span>
          </div>
          <h1 className="page-title">Admin Logistics & Reporting Operations</h1>
          <p className="page-subtitle">
            Central telemetry dispatch control, real-time fleet analytics, and MongoDB audit reports
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link to="/admin/create-shipment" className="btn btn-primary">
            <PlusCircle size={18} /> Book New Consignment
          </Link>
          <Link to="/admin/manage-shipments" className="btn btn-secondary">
            <Settings size={18} /> Manage Shipments
          </Link>
          <button onClick={handlePrint} className="btn btn-secondary">
            <Printer size={18} /> Print Reports
          </button>
        </div>
      </div>

      {/* Primary Metrics Grid (Exact Requested Counts from Real MongoDB Data) */}
      <div className="stats-grid" style={{ marginBottom: '1.75rem' }}>
        {/* 1. Total Shipment Count */}
        <div className="stat-card">
          <div className="stat-icon indigo">
            <Boxes size={26} />
          </div>
          <div>
            <div className="stat-value">{stats.total || 0}</div>
            <div className="stat-label">Total Shipment Count</div>
          </div>
        </div>

        {/* 2. Booked Shipment Count */}
        <div className="stat-card">
          <div className="stat-icon indigo" style={{ background: '#e0e7ff', color: '#4338ca' }}>
            <Clock size={26} />
          </div>
          <div>
            <div className="stat-value">{stats.booked || 0}</div>
            <div className="stat-label">Booked Shipments</div>
          </div>
        </div>

        {/* 3. In-Transit Shipment Count */}
        <div className="stat-card">
          <div className="stat-icon amber">
            <Truck size={26} />
          </div>
          <div>
            <div className="stat-value">{stats.inTransit || 0}</div>
            <div className="stat-label">In-Transit Parcels</div>
          </div>
        </div>

        {/* 4. Out-for-Delivery Shipment Count */}
        <div className="stat-card">
          <div className="stat-icon cyan">
            <Send size={26} />
          </div>
          <div>
            <div className="stat-value">{stats.outForDelivery || 0}</div>
            <div className="stat-label">Out for Delivery</div>
          </div>
        </div>

        {/* 5. Delivered Shipment Count */}
        <div className="stat-card">
          <div className="stat-icon emerald">
            <CheckCircle size={26} />
          </div>
          <div>
            <div className="stat-value">{stats.delivered || 0}</div>
            <div className="stat-label">Delivered Shipments</div>
          </div>
        </div>

        {/* 6. Total Freight Revenue */}
        <div className="stat-card">
          <div className="stat-icon indigo" style={{ background: '#ede9fe', color: '#6d28d9' }}>
            <TrendingUp size={26} />
          </div>
          <div>
            <div className="stat-value">₹{(stats.totalRevenue || 0).toLocaleString()}</div>
            <div className="stat-label">Total Freight Revenue</div>
          </div>
        </div>
      </div>

      {/* Secondary Status Badge Strip */}
      <div
        className="card no-print"
        style={{
          marginBottom: '1.75rem',
          padding: '1rem 1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          background: '#f8fafc',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', fontSize: '0.85rem' }}>
          <span style={{ fontWeight: 700, color: '#334155' }}>Facility Breakdown:</span>
          <span className="status-badge status-picked-up" style={{ fontSize: '0.75rem' }}>
            Picked Up: <strong>{stats.pickedUp || 0}</strong>
          </span>
          <span className="status-badge status-arrived-facility" style={{ fontSize: '0.75rem' }}>
            Arrived at Facility: <strong>{stats.arrivedAtFacility || 0}</strong>
          </span>
          <span className="status-badge status-delivery-failed" style={{ fontSize: '0.75rem' }}>
            Delivery Failed: <strong>{stats.deliveryFailed || 0}</strong>
          </span>
          <span className="status-badge status-returned" style={{ fontSize: '0.75rem' }}>
            Returned: <strong>{stats.returned || 0}</strong>
          </span>
        </div>

        <Link to="/admin/manage-shipments" style={{ fontSize: '0.85rem', color: '#4f46e5', fontWeight: 600 }}>
          Manage Full Inventory →
        </Link>
      </div>

      {/* Shipment Search by Tracking Number Widget */}
      <div
        className="card no-print"
        style={{
          marginBottom: '2rem',
          padding: '1.25rem 1.5rem',
          background: '#ffffff',
          border: '2px solid #e0e7ff',
        }}
      >
        <form
          onSubmit={handleTrackingSearchSubmit}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Search size={20} style={{ color: '#4f46e5' }} />
            <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>
              Shipment Search by Tracking Number:
            </span>
          </div>

          <div style={{ flex: 1, minWidth: '240px' }}>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. TRK-892147 or TRK-451209"
              value={trackingSearch}
              onChange={(e) => setTrackingSearch(e.target.value)}
              style={{ fontWeight: 600 }}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ padding: '0.55rem 1.5rem' }}>
            Locate Shipment
          </button>
        </form>

        {searchError && (
          <div style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '0.5rem', fontWeight: 500 }}>
            {searchError}
          </div>
        )}
      </div>

      {/* Report Filters Toolbar */}
      <div
        className="card no-print"
        style={{
          marginBottom: '1.75rem',
          padding: '1.25rem',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#ffffff',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FileText size={18} style={{ color: '#4f46e5' }} />
          <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>
            Filter Shipment Reports:
          </span>
        </div>

        <form
          onSubmit={handleApplyReportFilters}
          style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Status:</span>
            <select
              className="form-control"
              value={reportStatus}
              onChange={(e) => setReportStatus(e.target.value)}
              style={{ width: 'auto', padding: '0.35rem 0.75rem', fontSize: '0.85rem' }}
            >
              <option value="All">All Statuses</option>
              <option value="Booked">Booked</option>
              <option value="Picked Up">Picked Up</option>
              <option value="In Transit">In Transit</option>
              <option value="Arrived at Facility">Arrived at Facility</option>
              <option value="Out for Delivery">Out for Delivery</option>
              <option value="Delivered">Delivered</option>
              <option value="Delivery Failed">Delivery Failed</option>
              <option value="Returned">Returned</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>From:</span>
            <input
              type="date"
              className="form-control"
              value={reportStartDate}
              onChange={(e) => setReportStartDate(e.target.value)}
              style={{ width: 'auto', padding: '0.35rem 0.65rem', fontSize: '0.85rem' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>To:</span>
            <input
              type="date"
              className="form-control"
              value={reportEndDate}
              onChange={(e) => setReportEndDate(e.target.value)}
              style={{ width: 'auto', padding: '0.35rem 0.65rem', fontSize: '0.85rem' }}
            />
          </div>

          <button type="submit" className="btn btn-primary btn-sm">
            Apply Filters
          </button>

          {(reportStatus !== 'All' || reportStartDate || reportEndDate) && (
            <button
              type="button"
              onClick={handleResetReportFilters}
              className="btn btn-secondary btn-sm"
              title="Reset report filters"
            >
              <RefreshCw size={13} /> Reset
            </button>
          )}
        </form>
      </div>

      {/* Real MongoDB Aggregation Reports & Charts */}
      {reportsLoading ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center', color: '#64748b', marginBottom: '2rem' }}>
          <RefreshCw size={24} className="spin" style={{ margin: '0 auto 0.5rem', opacity: 0.7 }} />
          <p>Compiling real-time MongoDB analytics & reports...</p>
        </div>
      ) : (
        <ReportCharts
          statusDistribution={reportsData.statusDistribution}
          dateTrends={reportsData.dateTrends}
          summary={reportsData.summary}
        />
      )}

      {/* Recent Dispatches Feed with Direct Tracking History Inspection */}
      <div className="card">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.25rem',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div>
            <h3 className="card-title" style={{ margin: 0 }}>
              Live Dispatch Feed & Telemetry Audit
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.2rem' }}>
              Most recent consignments registered in database with access to full tracking event history
            </p>
          </div>
          <Link to="/admin/manage-shipments" className="btn btn-secondary btn-sm">
            View & Manage All Shipments →
          </Link>
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
            Loading live dispatch telemetry...
          </p>
        ) : recentShipments.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
            No dispatches registered yet. Click "Book New Consignment" to add one!
          </p>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tracking Number</th>
                  <th>Origin → Destination</th>
                  <th>Recipient</th>
                  <th>Booked Date</th>
                  <th>Type & Weight</th>
                  <th>Status</th>
                  <th>Freight Fee</th>
                  <th>Telemetry History</th>
                </tr>
              </thead>
              <tbody>
                {recentShipments.map((s) => (
                  <tr key={s._id || s.trackingNumber}>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0f172a' }}>
                        {s.trackingNumber}
                      </span>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {s.serviceType}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem' }}>
                        <span>{s.origin}</span>
                        <ArrowRight size={13} style={{ color: '#94a3b8' }} />
                        <span style={{ fontWeight: 600 }}>{s.destination}</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#4f46e5', fontWeight: 600, marginTop: '0.15rem' }}>
                        Hub: {s.currentCity || s.origin}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                        {s.recipient?.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {s.recipient?.phone}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.825rem', color: '#475569' }}>
                        {new Date(s.bookingDate || s.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.85rem' }}>
                        {s.packageType} ({s.weight} kg)
                      </span>
                    </td>
                    <td>
                      <StatusBadge status={s.status} />
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: '#0f172a' }}>₹{s.cost}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <Link
                          to={`/shipment/${s._id || s.trackingNumber}`}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.3rem 0.6rem' }}
                          title="View Checkpoint Timeline & Manifest"
                        >
                          <Eye size={14} /> Full History
                        </Link>
                        <Link
                          to={`/admin/manage-shipments?edit=${s._id || s.trackingNumber}`}
                          className="btn btn-primary btn-sm"
                          style={{ padding: '0.3rem 0.6rem' }}
                          title="Advance Status & Checkpoint"
                        >
                          Update
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Print media styling */}
      <style>{`
        @media print {
          .no-print, header, footer {
            display: none !important;
          }
          body, .page-wrapper {
            background: #ffffff !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .card {
            box-shadow: none !important;
            border: 1px solid #000000 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
