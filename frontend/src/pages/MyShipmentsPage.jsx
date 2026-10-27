import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import {
  Boxes,
  Search,
  Filter,
  Eye,
  ArrowRight,
  RefreshCw,
  PackageCheck,
  Calendar,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';

const MyShipmentsPage = () => {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [bookingDateFilter, setBookingDateFilter] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 10;

  const fetchShipments = async (pageToFetch = currentPage) => {
    setLoading(true);
    try {
      const res = await api.getAllShipments({
        search: search.trim(),
        status: statusFilter,
        bookingDate: bookingDateFilter,
        page: pageToFetch,
        limit,
      });
      if (res.success) {
        setShipments(res.shipments || []);
        setTotalPages(res.totalPages || 1);
        setTotalCount(res.total || 0);
        setCurrentPage(res.currentPage || pageToFetch);
      }
    } catch (err) {
      console.error('Failed to fetch customer shipments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShipments(1);
  }, [statusFilter, bookingDateFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchShipments();
  };

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">My Shipments</h1>
          <p className="page-subtitle">
            Track and monitor all your incoming and outgoing courier consignments
          </p>
        </div>

        <button onClick={fetchShipments} className="btn btn-secondary btn-sm">
          <RefreshCw size={15} /> Refresh List
        </button>
      </div>

      {/* Filters & Search Toolbar */}
      <div
        className="card"
        style={{
          marginBottom: '1.5rem',
          padding: '1.25rem',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem', flex: 1, minWidth: '260px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              type="text"
              className="form-control"
              placeholder="Search tracking ID, recipient, or city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
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
          <button type="submit" className="btn btn-primary btn-sm">
            Search
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Filter size={15} style={{ color: '#64748b' }} />
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Status:</span>
            <select
              className="form-control"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ width: 'auto', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
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
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Calendar size={15} style={{ color: '#64748b' }} />
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Date:</span>
            <input
              type="date"
              className="form-control"
              value={bookingDateFilter}
              onChange={(e) => setBookingDateFilter(e.target.value)}
              style={{ width: 'auto', padding: '0.35rem 0.65rem', fontSize: '0.85rem' }}
            />
          </div>

          {(statusFilter !== 'All' || bookingDateFilter || search) && (
            <button
              type="button"
              onClick={() => {
                setStatusFilter('All');
                setBookingDateFilter('');
                setSearch('');
              }}
              className="btn btn-secondary btn-sm"
              style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}
              title="Reset all filters"
            >
              <RotateCcw size={13} /> Reset
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="card">
        {loading ? (
          <p style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
            Fetching your shipments...
          </p>
        ) : shipments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: '#64748b' }}>
            <PackageCheck size={48} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
            <h3 style={{ fontSize: '1.15rem', color: '#1e293b', fontWeight: 700, marginBottom: '0.25rem' }}>
              No consignments matching criteria
            </h3>
            <p style={{ fontSize: '0.9rem', maxWidth: '420px', margin: '0 auto' }}>
              Try adjusting your search terms or filter selection.
            </p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tracking Number</th>
                  <th>Sender</th>
                  <th>Recipient</th>
                  <th>Route</th>
                  <th>Booked Date</th>
                  <th>Status</th>
                  <th>Est. Arrival</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {shipments.map((s) => (
                  <tr key={s._id || s.trackingNumber}>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0f172a' }}>
                        {s.trackingNumber}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.875rem' }}>
                        <div style={{ fontWeight: 600 }}>{s.sender?.name}</div>
                        <div style={{ fontSize: '0.775rem', color: '#64748b' }}>{s.origin}</div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.875rem' }}>
                        <div style={{ fontWeight: 600 }}>{s.recipient?.name}</div>
                        <div style={{ fontSize: '0.775rem', color: '#64748b' }}>{s.destination}</div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem' }}>
                        <span>{s.origin}</span>
                        <ArrowRight size={14} style={{ color: '#94a3b8' }} />
                        <span style={{ fontWeight: 600 }}>{s.destination}</span>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.825rem', color: '#475569' }}>
                        {new Date(s.bookingDate || s.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td>
                      <StatusBadge status={s.status} />
                    </td>
                    <td>
                      <span style={{ fontSize: '0.85rem', color: '#475569' }}>
                        {new Date(s.estimatedDelivery).toLocaleDateString()}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <Link
                          to={`/track?num=${s.trackingNumber}`}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.35rem 0.65rem' }}
                        >
                          Track
                        </Link>
                        <Link
                          to={`/shipment/${s._id || s.trackingNumber}`}
                          className="btn btn-primary btn-sm"
                          style={{ padding: '0.35rem 0.65rem' }}
                        >
                          <Eye size={13} /> Details
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1rem 1.25rem',
                  borderTop: '1px solid #e2e8f0',
                  background: '#f8fafc',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                }}
              >
                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  Showing <strong>{(currentPage - 1) * limit + 1}</strong> to{' '}
                  <strong>{Math.min(currentPage * limit, totalCount)}</strong> of{' '}
                  <strong>{totalCount}</strong> shipments
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button
                    onClick={() => fetchShipments(currentPage - 1)}
                    disabled={currentPage <= 1}
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '0.35rem 0.65rem' }}
                  >
                    <ChevronLeft size={14} /> Prev
                  </button>

                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155', padding: '0 0.5rem' }}>
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    onClick={() => fetchShipments(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '0.35rem 0.65rem' }}
                  >
                    Next <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyShipmentsPage;
