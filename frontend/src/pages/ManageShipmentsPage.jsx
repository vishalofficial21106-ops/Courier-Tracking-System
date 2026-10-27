import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import {
  Settings,
  Search,
  Filter,
  PlusCircle,
  Eye,
  Edit3,
  Trash2,
  MapPin,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  X,
  Truck,
  Calendar,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';

const ManageShipmentsPage = () => {
  const [searchParams] = useSearchParams();
  const editParam = searchParams.get('edit');

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

  // Modal State
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalStatus, setModalStatus] = useState('In Transit');
  const [modalCity, setModalCity] = useState('');
  const [modalRemark, setModalRemark] = useState('');
  const [modalNotes, setModalNotes] = useState('');
  const [modalTimestamp, setModalTimestamp] = useState('');
  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

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

        // If edit param was in URL, open modal automatically
        if (editParam) {
          const found = (res.shipments || []).find(
            (s) => s._id === editParam || s.trackingNumber === editParam
          );
          if (found) {
            openUpdateModal(found);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load shipments:', err);
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

  const openUpdateModal = (shipment) => {
    setSelectedShipment(shipment);
    setModalStatus(shipment.status || 'In Transit');
    setModalCity(shipment.currentCity || shipment.destination || '');
    setModalRemark(`Package verified at ${shipment.currentCity || 'regional'} sorting hub.`);
    setModalNotes('');
    setModalTimestamp(new Date().toISOString().slice(0, 16));
    setModalOpen(true);
    setSuccessMsg('');
    setErrorMsg('');
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    if (!selectedShipment) return;

    setModalSubmitting(true);
    setErrorMsg('');

    try {
      const res = await api.updateShipmentStatus(
        selectedShipment._id || selectedShipment.trackingNumber,
        {
          status: modalStatus,
          currentCity: modalCity,
          location: modalCity,
          description: modalRemark,
          notes: modalNotes,
          timestamp: modalTimestamp ? new Date(modalTimestamp).toISOString() : new Date().toISOString(),
        }
      );

      if (res.success) {
        setSuccessMsg(`Status updated to "${modalStatus}" for ${selectedShipment.trackingNumber}!`);
        setTimeout(() => {
          setModalOpen(false);
          fetchShipments();
        }, 1200);
      } else {
        throw new Error(res.message || 'Failed to update status');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Error updating status checkpoint');
    } finally {
      setModalSubmitting(false);
    }
  };

  const handleDelete = async (id, trackingNumber) => {
    if (window.confirm(`Are you sure you want to delete shipment ${trackingNumber}? This action cannot be undone.`)) {
      try {
        await api.deleteShipment(id);
        setShipments((prev) => prev.filter((s) => s._id !== id && s.trackingNumber !== trackingNumber));
      } catch (err) {
        alert('Failed to delete shipment: ' + err.message);
      }
    }
  };

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Manage Logistics Shipments</h1>
          <p className="page-subtitle">
            Update lifecycle checkpoints, log hub transfers, and inspect consignment records
          </p>
        </div>

        <Link to="/admin/create-shipment" className="btn btn-primary">
          <PlusCircle size={18} /> Book New Consignment
        </Link>
      </div>

      {/* Toolbar */}
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
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem', flex: 1, minWidth: '280px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              type="text"
              className="form-control"
              placeholder="Search by Tracking ID, Sender, Recipient, or Hub..."
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
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Booked:</span>
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

      {/* Shipments Table */}
      <div className="card">
        {loading ? (
          <p style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
            Retrieving shipments database...
          </p>
        ) : shipments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: '#64748b' }}>
            <p style={{ fontWeight: 600, color: '#334155' }}>No shipments found.</p>
            <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
              Create a new shipment or clear your search filters.
            </p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tracking Number</th>
                  <th>Origin → Destination</th>
                  <th>Current Hub City</th>
                  <th>Recipient Details</th>
                  <th>Booked Date</th>
                  <th>Status</th>
                  <th>Freight Fee</th>
                  <th>Management Actions</th>
                </tr>
              </thead>
              <tbody>
                {shipments.map((s) => (
                  <tr key={s._id || s.trackingNumber}>
                    <td>
                      <div style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0f172a' }}>
                        {s.trackingNumber}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {s.serviceType}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.875rem' }}>
                        <span>{s.origin}</span>
                        <ArrowRight size={13} style={{ color: '#94a3b8' }} />
                        <span style={{ fontWeight: 600 }}>{s.destination}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem', color: '#4f46e5', fontWeight: 600 }}>
                        <MapPin size={14} />
                        {s.currentCity || s.origin}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.875rem' }}>
                        <div style={{ fontWeight: 600 }}>{s.recipient?.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{s.recipient?.phone}</div>
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
                      <span style={{ fontWeight: 600, color: '#0f172a' }}>₹{s.cost}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        <button
                          onClick={() => openUpdateModal(s)}
                          className="btn btn-primary btn-sm"
                          style={{ padding: '0.35rem 0.65rem' }}
                          title="Update Status & Location"
                        >
                          <Edit3 size={13} /> Update Status
                        </button>
                        <Link
                          to={`/shipment/${s._id || s.trackingNumber}`}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.35rem 0.65rem' }}
                          title="View Full Details"
                        >
                          <Eye size={13} />
                        </Link>
                        <button
                          onClick={() => handleDelete(s._id, s.trackingNumber)}
                          className="btn btn-danger btn-sm"
                          style={{ padding: '0.35rem 0.55rem' }}
                          title="Delete Shipment"
                        >
                          <Trash2 size={13} />
                        </button>
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

      {/* Modal: Update Status & Checkpoint */}
      {modalOpen && selectedShipment && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Truck size={20} style={{ color: '#4f46e5' }} />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                  Update Consignment Status
                </h3>
              </div>
              <button onClick={() => setModalOpen(false)} style={{ color: '#94a3b8' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '8px', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Tracking ID:</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, fontFamily: 'monospace', color: '#0f172a' }}>
                {selectedShipment.trackingNumber}
              </div>
              <div style={{ fontSize: '0.825rem', color: '#475569', marginTop: '0.2rem' }}>
                Route: {selectedShipment.origin} → {selectedShipment.destination}
              </div>
            </div>

            {successMsg && (
              <div className="alert alert-success" style={{ marginBottom: '1rem' }}>
                <CheckCircle size={18} />
                <span>{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
                <AlertCircle size={18} />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleModalSubmit}>
              <div className="form-group">
                <label className="form-label">Select New Lifecycle Status *</label>
                <select
                  className="form-control"
                  value={modalStatus}
                  onChange={(e) => {
                    const nextStatus = e.target.value;
                    setModalStatus(nextStatus);
                    if (nextStatus === 'Picked Up') {
                      setModalRemark(`Package collected from consignor at ${selectedShipment.origin}.`);
                    } else if (nextStatus === 'In Transit') {
                      setModalRemark(`Package in linehaul transit en route to ${selectedShipment.destination}.`);
                    } else if (nextStatus === 'Arrived at Facility') {
                      setModalRemark(`Consignment received and processed at ${modalCity || 'regional'} distribution facility.`);
                    } else if (nextStatus === 'Out for Delivery') {
                      setModalRemark(`Dispatched with local courier agent for doorstep delivery in ${modalCity || selectedShipment.destination}.`);
                    } else if (nextStatus === 'Delivered') {
                      setModalRemark(`Safely delivered to ${selectedShipment.recipient?.name}. Received and signed.`);
                    } else if (nextStatus === 'Delivery Failed') {
                      setModalRemark(`Delivery attempt unsuccessful. Premises locked / recipient unreachable. Rescheduling.`);
                    } else if (nextStatus === 'Returned') {
                      setModalRemark(`Consignment returned to origin sorting hub per consignor instructions.`);
                    }
                  }}
                  required
                >
                  <option value="Booked">Booked (Registered)</option>
                  <option value="Picked Up">Picked Up (Collected from seller)</option>
                  <option value="In Transit">In Transit (Linehaul corridor)</option>
                  <option value="Arrived at Facility">Arrived at Facility (Regional Hub)</option>
                  <option value="Out for Delivery">Out for Delivery (Doorstep courier)</option>
                  <option value="Delivered">Delivered (Completed)</option>
                  <option value="Delivery Failed">Delivery Failed (Attempt failed)</option>
                  <option value="Returned">Returned (Sent back to origin)</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Current Facility / City Location *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={modalCity}
                    onChange={(e) => setModalCity(e.target.value)}
                    placeholder="e.g. Pune Central Sorting Hub"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Checkpoint Timestamp</label>
                  <input
                    type="datetime-local"
                    className="form-control"
                    value={modalTimestamp}
                    onChange={(e) => setModalTimestamp(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Checkpoint Audit Remark / Description *</label>
                <textarea
                  className="form-control"
                  rows="2"
                  value={modalRemark}
                  onChange={(e) => setModalRemark(e.target.value)}
                  placeholder="e.g. Processed through automated scanner. Forwarded to destination."
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Optional Tracking Note (Internal remarks, courier driver, signature code)</label>
                <input
                  type="text"
                  className="form-control"
                  value={modalNotes}
                  onChange={(e) => setModalNotes(e.target.value)}
                  placeholder="e.g. Driver: Vikram Singh (ID: DRV-882), OTP verified"
                />
              </div>

              {/* College Project Disclaimer */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.65rem 0.85rem', fontSize: '0.75rem', color: '#64748b', marginBottom: '1rem' }}>
                💡 <strong>College Project Note:</strong> Checkpoints are simulated via admin-entered status updates representing sorting hub scans without requiring third-party GPS telemetry integrations.
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="btn btn-secondary"
                  disabled={modalSubmitting}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={modalSubmitting}>
                  {modalSubmitting ? 'Recording Checkpoint...' : 'Save & Publish Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageShipmentsPage;
