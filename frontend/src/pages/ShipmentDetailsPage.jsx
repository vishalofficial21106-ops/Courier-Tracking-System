import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Package,
  MapPin,
  Calendar,
  Printer,
  ArrowLeft,
  Truck,
  CheckCircle,
  Clock,
  Phone,
  Mail,
  PlusCircle,
  AlertCircle,
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import BarcodeVisual from '../components/BarcodeVisual';
import Timeline from '../components/Timeline';

const ShipmentDetailsPage = () => {
  const { id } = useParams();
  const { isAdmin } = useAuth();

  const [shipment, setShipment] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Inline checkpoint logging state for Admin
  const [newStatus, setNewStatus] = useState('In Transit');
  const [newLocation, setNewLocation] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [eventAdding, setEventAdding] = useState(false);
  const [addMsg, setAddMsg] = useState('');
  const [addErr, setAddErr] = useState('');

  const loadShipmentData = async () => {
    setLoading(true);
    try {
      const res = await api.getShipmentById(id);
      if (res.success && res.shipment) {
        setShipment(res.shipment);
        setEvents(res.trackingEvents || res.shipment.events || []);
        setNewLocation(res.shipment.currentCity || res.shipment.destination || '');
        setNewStatus(res.shipment.status || 'In Transit');
      } else {
        throw new Error(res.message || 'Shipment not found');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch shipment details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShipmentData();
  }, [id]);

  const handleAddCheckpoint = async (e) => {
    e.preventDefault();
    setAddErr('');
    if (!newLocation || !newDescription) {
      setAddErr('Location and description are required');
      return;
    }

    setEventAdding(true);
    try {
      const res = await api.updateShipmentStatus(shipment._id || shipment.trackingNumber, {
        status: newStatus,
        currentCity: newLocation,
        location: newLocation,
        description: newDescription,
        notes: newNotes,
      });

      if (res.success) {
        setAddMsg(`Checkpoint recorded successfully for status: "${newStatus}".`);
        setNewDescription('');
        setNewNotes('');
        await loadShipmentData();
        setTimeout(() => setAddMsg(''), 3000);
      }
    } catch (err) {
      setAddErr(err.message || 'Failed to add checkpoint');
    } finally {
      setEventAdding(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="page-wrapper" style={{ textAlign: 'center', padding: '5rem 1rem' }}>
        <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Loading shipment manifest & history...</p>
      </div>
    );
  }

  if (error || !shipment) {
    return (
      <div className="page-wrapper">
        <div className="alert alert-error">
          <AlertCircle size={20} />
          <span>{error || 'Shipment record could not be found.'}</span>
        </div>
        <Link to="/" className="btn btn-secondary">
          <ArrowLeft size={16} /> Return to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="page-wrapper" style={{ maxWidth: '980px' }}>
      {/* Top Action Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
        className="no-print"
      >
        <Link to={isAdmin ? '/admin/manage-shipments' : '/my-shipments'} className="btn btn-secondary btn-sm">
          <ArrowLeft size={16} /> Back to List
        </Link>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link to={`/track?num=${shipment.trackingNumber}`} className="btn btn-secondary btn-sm">
            <Truck size={15} /> Public Tracker View
          </Link>
          <button onClick={handlePrint} className="btn btn-primary btn-sm">
            <Printer size={15} /> Print Shipping Manifest
          </button>
        </div>
      </div>

      {/* Main Shipping Manifest / Waybill Card */}
      <div
        className="card"
        style={{
          padding: '2.5rem',
          border: '2px solid #cbd5e1',
          borderRadius: '16px',
          boxShadow: 'var(--shadow-md)',
          marginBottom: '2rem',
          background: '#ffffff',
        }}
      >
        {/* Manifest Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '1.5rem',
            borderBottom: '2px solid #0f172a',
            paddingBottom: '1.75rem',
            marginBottom: '1.75rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <span
                style={{
                  fontFamily: 'Outfit, sans-serif',
                  fontWeight: 800,
                  fontSize: '1.4rem',
                  color: '#0f172a',
                }}
              >
                Cloud<span style={{ color: '#4f46e5' }}>Track</span> Logistics
              </span>
              <span style={{ fontSize: '0.75rem', background: '#f1f5f9', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>
                DIGITAL WAYBILL
              </span>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'monospace', color: '#0f172a' }}>
              {shipment.trackingNumber}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.5rem' }}>
              <StatusBadge status={shipment.status} />
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                Booked On: <strong>{new Date(shipment.createdAt).toLocaleDateString()}</strong>
              </span>
            </div>
          </div>

          <BarcodeVisual code={shipment.trackingNumber} />
        </div>

        {/* Sender & Recipient Columns */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2rem',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '1.5rem',
            marginBottom: '1.75rem',
          }}
        >
          {/* Sender */}
          <div>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#4f46e5',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                display: 'block',
                marginBottom: '0.5rem',
              }}
            >
              FROM (CONSIGNOR):
            </span>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
              {shipment.sender?.name}
            </h4>
            <p style={{ fontSize: '0.9rem', color: '#475569', marginTop: '0.25rem', lineHeight: 1.5 }}>
              {shipment.sender?.address || shipment.origin} <br />
              <strong>{shipment.origin}</strong>
              {shipment.sender?.state ? `, ${shipment.sender.state}` : ''}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: '#64748b', marginTop: '0.5rem' }}>
              <Phone size={13} /> {shipment.sender?.phone}
            </div>
          </div>

          {/* Recipient */}
          <div>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#059669',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                display: 'block',
                marginBottom: '0.5rem',
              }}
            >
              TO (CONSIGNEE):
            </span>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
              {shipment.recipient?.name}
            </h4>
            <p style={{ fontSize: '0.9rem', color: '#475569', marginTop: '0.25rem', lineHeight: 1.5 }}>
              {shipment.recipient?.address || shipment.destination} <br />
              <strong>{shipment.destination}</strong>
              {shipment.recipient?.state ? `, ${shipment.recipient.state}` : ''}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: '#64748b', marginTop: '0.5rem' }}>
              <Phone size={13} /> {shipment.recipient?.phone}
            </div>
          </div>
        </div>

        {/* Consignment Specs */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1rem',
            borderBottom: '1px solid #e2e8f0',
            paddingBottom: '1.5rem',
            marginBottom: '1.75rem',
          }}
        >
          <div>
            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>PACKAGE TYPE</span>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>
              {shipment.packageType}
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>WEIGHT</span>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>
              {shipment.weight} kg
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>SERVICE TIER</span>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#4f46e5' }}>
              {shipment.serviceType}
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>ESTIMATED ARRIVAL</span>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>
              {new Date(shipment.estimatedDelivery).toLocaleDateString()}
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>FREIGHT CHARGES</span>
            <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#059669' }}>
              ₹{shipment.cost}
            </div>
          </div>
        </div>

        {/* Notes */}
        {shipment.notes && (
          <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.85rem', color: '#92400e' }}>
            <strong>Special Dispatch Instructions: </strong> {shipment.notes}
          </div>
        )}
      </div>

      {/* Admin Inline Checkpoint Addition Tool */}
      {isAdmin && (
        <div className="card no-print" style={{ marginBottom: '2rem', padding: '1.75rem', border: '1px solid #c7d2fe' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <PlusCircle size={18} style={{ color: '#4f46e5' }} /> Log New Checkpoint Scan (Admin Hub Control)
          </h3>
          <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1.25rem' }}>
            Append a verified telemetry event to this consignment's permanent audit record
          </p>

          {addMsg && (
            <div className="alert alert-success" style={{ marginBottom: '1rem' }}>
              <CheckCircle size={18} />
              <span>{addMsg}</span>
            </div>
          )}

          {addErr && (
            <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
              <AlertCircle size={18} />
              <span>{addErr}</span>
            </div>
          )}

          <form onSubmit={handleAddCheckpoint}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Status Progression *</label>
                <select
                  className="form-control"
                  value={newStatus}
                  onChange={(e) => {
                    const st = e.target.value;
                    setNewStatus(st);
                    if (st === 'Arrived at Facility') {
                      setNewDescription(`Package arrived at ${newLocation || 'regional'} sorting hub.`);
                    } else if (st === 'Delivery Failed') {
                      setNewDescription('Delivery attempt failed. Door locked or customer unreachable.');
                    } else if (st === 'Returned') {
                      setNewDescription('Shipment returned to originating branch.');
                    }
                  }}
                >
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

              <div className="form-group">
                <label className="form-label">Scanning Facility / Hub Location *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Hyderabad Cargo Express Sorting Hub"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Checkpoint Description *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Scanned into container flight 6E-204 en route to destination."
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Optional Tracking Note (Driver, signature, remarks)</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Verified with OTP, signed by Dr. Ramesh"
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
              />
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.65rem 0.85rem', fontSize: '0.75rem', color: '#64748b', marginBottom: '1rem' }}>
              💡 <strong>College Project Notice:</strong> Checkpoint updates are entered through this dispatcher tool to simulate sorting hub scans. Physical telematics / GPS hardware is not required.
            </div>

            <button type="submit" className="btn btn-primary btn-sm" disabled={eventAdding}>
              {eventAdding ? 'Logging Checkpoint...' : 'Append Checkpoint Event'}
            </button>
          </form>
        </div>
      )}

      {/* Complete Checkpoint Timeline */}
      <div className="card" style={{ padding: '2rem' }}>
        <h3 className="card-title" style={{ marginBottom: '0.5rem' }}>
          Consignment Telemetry History
        </h3>
        <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
          All recorded sorting hub scans, driver assignments, and delivery confirmations
        </p>

        <Timeline events={events} currentStatus={shipment.status} />
      </div>

      {/* Print media query styling */}
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

export default ShipmentDetailsPage;
