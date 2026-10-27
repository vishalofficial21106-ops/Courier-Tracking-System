import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import {
  Package,
  Truck,
  MapPin,
  Calendar,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Barcode,
  Sparkles,
} from 'lucide-react';
import BarcodeVisual from '../components/BarcodeVisual';

const CreateShipmentPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    senderName: '',
    senderPhone: '',
    senderEmail: '',
    senderAddress: '',
    originCity: '',
    senderState: '',

    recipientName: '',
    recipientPhone: '',
    recipientEmail: '',
    recipientAddress: '',
    destCity: '',
    recipientState: '',

    packageType: 'Small Box',
    weight: 1.5,
    length: 25,
    width: 20,
    height: 12,
    serviceType: 'Standard Delivery',
    bookingDate: new Date().toISOString().slice(0, 10),
    estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdShipment, setCreatedShipment] = useState(null);

  // Dynamic cost calculation based on weight and speed
  const calculateRate = () => {
    const baseRates = {
      'Standard Delivery': 120,
      'Express Air': 250,
      'Same Day Delivery': 420,
    };
    const rate = baseRates[formData.serviceType] || 120;
    const weightSurcharge = Math.round(Number(formData.weight || 1) * 35);
    return rate + weightSurcharge;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === 'serviceType') {
        const estDays = value === 'Same Day Delivery' ? 0.3 : value === 'Express Air' ? 1.5 : 3.5;
        updated.estimatedDelivery = new Date(Date.now() + estDays * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      }
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.senderName || !formData.originCity || !formData.senderPhone) {
      setError('Sender name, phone, and origin city are required.');
      return;
    }

    if (!formData.recipientName || !formData.destCity || !formData.recipientPhone) {
      setError('Recipient name, phone, and destination city are required.');
      return;
    }

    setLoading(true);

    const estDate = formData.estimatedDelivery
      ? new Date(formData.estimatedDelivery)
      : new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

    const payload = {
      sender: {
        name: formData.senderName,
        phone: formData.senderPhone,
        email: formData.senderEmail,
        address: formData.senderAddress || formData.originCity,
        city: formData.originCity,
        state: formData.senderState,
      },
      recipient: {
        name: formData.recipientName,
        phone: formData.recipientPhone,
        email: formData.recipientEmail,
        address: formData.recipientAddress || formData.destCity,
        city: formData.destCity,
        state: formData.recipientState,
      },
      origin: formData.originCity,
      destination: formData.destCity,
      currentCity: formData.originCity,
      packageType: formData.packageType,
      weight: Number(formData.weight),
      dimensions: {
        length: Number(formData.length),
        width: Number(formData.width),
        height: Number(formData.height),
      },
      serviceType: formData.serviceType,
      cost: calculateRate(),
      bookingDate: formData.bookingDate ? new Date(formData.bookingDate) : new Date(),
      estimatedDelivery: estDate,
      notes: formData.notes,
    };

    try {
      const res = await api.createShipment(payload);
      if (res.success && res.shipment) {
        setCreatedShipment(res.shipment);
      } else {
        throw new Error(res.message || 'Failed to create shipment.');
      }
    } catch (err) {
      setError(err.message || 'Failed to register consignment.');
    } finally {
      setLoading(false);
    }
  };

  // Quick autofill demo scenario
  const handleQuickDemoFill = () => {
    setFormData({
      senderName: 'Apex Electronics Pvt Ltd',
      senderPhone: '+91 98221 44556',
      senderEmail: 'dispatch@apexelectronics.com',
      senderAddress: 'Plot 44, Electronic City Phase 1',
      originCity: 'Bengaluru',
      senderState: 'Karnataka',

      recipientName: 'Kavita Joshi',
      recipientPhone: '+91 99887 76655',
      recipientEmail: 'kavita.joshi@gmail.com',
      recipientAddress: 'Flat 402, Sea Crest Apartments, Worli',
      destCity: 'Mumbai',
      recipientState: 'Maharashtra',

      packageType: 'Electronics',
      weight: 3.2,
      length: 30,
      width: 25,
      height: 10,
      serviceType: 'Express Air',
      bookingDate: new Date().toISOString().slice(0, 10),
      estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      notes: 'Priority medical & circuit testing equipment. Handle with extreme care.',
    });
    setError('');
  };

  return (
    <div className="page-wrapper" style={{ maxWidth: '960px' }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Register New Shipment</h1>
          <p className="page-subtitle">
            Generate digital courier manifest, barcode identifier, and cloud dispatch telemetry
          </p>
        </div>

        <button type="button" onClick={handleQuickDemoFill} className="btn btn-secondary btn-sm">
          <Sparkles size={15} style={{ color: '#4f46e5' }} /> Autofill Demo Data
        </button>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Success Modal / Banner */}
      {createdShipment && (
        <div
          className="card"
          style={{
            marginBottom: '2rem',
            padding: '2rem',
            background: '#f0fdf4',
            border: '2px solid #86efac',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <CheckCircle2 size={28} style={{ color: '#16a34a' }} />
            <div>
              <h3 style={{ fontSize: '1.3rem', color: '#166534', fontWeight: 800 }}>
                Shipment Successfully Booked & Registered!
              </h3>
              <p style={{ color: '#15803d', fontSize: '0.9rem' }}>
                Barcode label generated and initial checkpoint logged in cloud database.
              </p>
            </div>
          </div>

          <div
            style={{
              background: '#ffffff',
              padding: '1.5rem',
              borderRadius: '12px',
              border: '1px solid #bbf7d0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1.5rem',
              marginBottom: '1.25rem',
            }}
          >
            <div>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                Assigned Tracking ID:
              </span>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'monospace', color: '#0f172a' }}>
                {createdShipment.trackingNumber}
              </div>
              <p style={{ fontSize: '0.85rem', color: '#475569', marginTop: '0.2rem' }}>
                Route: <strong>{createdShipment.origin}</strong> → <strong>{createdShipment.destination}</strong> ({createdShipment.serviceType})
              </p>
            </div>

            <BarcodeVisual code={createdShipment.trackingNumber} />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link to={`/track?num=${createdShipment.trackingNumber}`} className="btn btn-primary">
              <Truck size={16} /> Track Shipment Live
            </Link>
            <Link to={`/shipment/${createdShipment._id || createdShipment.trackingNumber}`} className="btn btn-secondary">
              View Full Shipping Manifest
            </Link>
            <button
              onClick={() => {
                setCreatedShipment(null);
                handleQuickDemoFill();
              }}
              className="btn btn-secondary"
            >
              Book Another Parcel
            </button>
          </div>
        </div>
      )}

      {/* Booking Form */}
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
          {/* Sender Card */}
          <div className="card">
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0f172a' }}>
              <MapPin size={18} style={{ color: '#4f46e5' }} /> 1. Consignor (Sender) Details
            </h3>

            <div className="form-group">
              <label className="form-label">Sender / Business Name *</label>
              <input
                type="text"
                name="senderName"
                className="form-control"
                placeholder="e.g. Ramesh Patel"
                value={formData.senderName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Sender Phone *</label>
                <input
                  type="tel"
                  name="senderPhone"
                  className="form-control"
                  placeholder="+91 98765 00000"
                  value={formData.senderPhone}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Sender Email</label>
                <input
                  type="email"
                  name="senderEmail"
                  className="form-control"
                  placeholder="sender@example.com"
                  value={formData.senderEmail}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Origin City *</label>
                <input
                  type="text"
                  name="originCity"
                  className="form-control"
                  placeholder="e.g. Mumbai, Bengaluru"
                  value={formData.originCity}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">State</label>
                <input
                  type="text"
                  name="senderState"
                  className="form-control"
                  placeholder="e.g. Maharashtra"
                  value={formData.senderState}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Origin Facility Address</label>
              <textarea
                name="senderAddress"
                className="form-control"
                rows="2"
                placeholder="Street address or warehouse door number..."
                value={formData.senderAddress}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Recipient Card */}
          <div className="card">
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0f172a' }}>
              <MapPin size={18} style={{ color: '#059669' }} /> 2. Consignee (Recipient) Details
            </h3>

            <div className="form-group">
              <label className="form-label">Recipient Name *</label>
              <input
                type="text"
                name="recipientName"
                className="form-control"
                placeholder="e.g. Priya Sharma"
                value={formData.recipientName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Recipient Phone *</label>
                <input
                  type="tel"
                  name="recipientPhone"
                  className="form-control"
                  placeholder="+91 91234 56789"
                  value={formData.recipientPhone}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Recipient Email</label>
                <input
                  type="email"
                  name="recipientEmail"
                  className="form-control"
                  placeholder="recipient@example.com"
                  value={formData.recipientEmail}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Destination City *</label>
                <input
                  type="text"
                  name="destCity"
                  className="form-control"
                  placeholder="e.g. Delhi, Hyderabad"
                  value={formData.destCity}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">State</label>
                <input
                  type="text"
                  name="recipientState"
                  className="form-control"
                  placeholder="e.g. Telangana"
                  value={formData.recipientState}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Doorstep Delivery Address</label>
              <textarea
                name="recipientAddress"
                className="form-control"
                rows="2"
                placeholder="House/Apartment number, street, landmark..."
                value={formData.recipientAddress}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Package Specifications & Service Type */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Package size={18} style={{ color: '#4f46e5' }} /> 3. Package Attributes & Dispatch Tier
          </h3>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Package Category</label>
              <select
                name="packageType"
                className="form-control"
                value={formData.packageType}
                onChange={handleChange}
              >
                <option value="Document">Document / Paperwork</option>
                <option value="Small Box">Small Box (Retail / Apparel)</option>
                <option value="Large Parcel">Large Parcel (Carton)</option>
                <option value="Fragile Goods">Fragile Goods / Glassware</option>
                <option value="Electronics">Electronics / Computers</option>
                <option value="Heavy Freight">Heavy Freight (Equipment)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Gross Weight (kg) *</label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                name="weight"
                className="form-control"
                value={formData.weight}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Delivery Service Speed</label>
              <select
                name="serviceType"
                className="form-control"
                value={formData.serviceType}
                onChange={handleChange}
              >
                <option value="Standard Delivery">Standard Surface (3-4 Days)</option>
                <option value="Express Air">Express Air Corridor (1-2 Days)</option>
                <option value="Same Day Delivery">Same Day Express (Immediate)</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Booking Date *</label>
              <input
                type="date"
                name="bookingDate"
                className="form-control"
                value={formData.bookingDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Estimated Delivery Date *</label>
              <input
                type="date"
                name="estimatedDelivery"
                className="form-control"
                value={formData.estimatedDelivery}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Handling Instructions / Dispatch Notes</label>
            <input
              type="text"
              name="notes"
              className="form-control"
              placeholder="e.g. Do not bend, call recipient upon arrival, keep dry"
              value={formData.notes}
              onChange={handleChange}
            />
          </div>

          {/* Live Freight Quote summary */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '1rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Calculated Freight Cost:</span>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>
                ₹{calculateRate()}
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={loading}
              style={{ padding: '0.75rem 2rem' }}
            >
              {loading ? 'Registering Consignment...' : 'Book Shipment & Generate Label'} <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateShipmentPage;
