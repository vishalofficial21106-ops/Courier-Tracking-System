import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import confetti from 'canvas-confetti';
import {
  Search,
  Truck,
  MapPin,
  Calendar,
  Package,
  Weight,
  CheckCircle,
  Clock,
  ArrowRight,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import Timeline from '../components/Timeline';
import BarcodeVisual from '../components/BarcodeVisual';

const TrackParcelPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialNum = searchParams.get('num') || '';

  const [trackingNumber, setTrackingNumber] = useState(initialNum);
  const [shipmentData, setShipmentData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const sampleNumbers = [
    { code: 'TRK-892147', label: 'In Transit' },
    { code: 'TRK-451209', label: 'Out for Delivery' },
    { code: 'TRK-339812', label: 'Delivered' },
    { code: 'TRK-771234', label: 'Arrived at Facility' },
    { code: 'TRK-552391', label: 'Delivery Failed' },
    { code: 'TRK-664411', label: 'Returned' },
  ];

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const performTracking = async (numberToTrack) => {
    if (!numberToTrack || !numberToTrack.trim()) return;

    setLoading(true);
    setError('');
    setShipmentData(null);

    try {
      const data = await api.trackParcel(numberToTrack.trim());
      setShipmentData(data);
      if (data.status === 'Delivered') {
        triggerConfetti();
      }
    } catch (err) {
      setError(err.message || 'Unable to find tracking records for this ID.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialNum) {
      setTrackingNumber(initialNum);
      performTracking(initialNum);
    }
  }, [initialNum]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (trackingNumber.trim()) {
      setSearchParams({ num: trackingNumber.trim() });
      performTracking(trackingNumber.trim());
    }
  };

  const handleSelectSample = (code) => {
    setTrackingNumber(code);
    setSearchParams({ num: code });
    performTracking(code);
  };

  return (
    <div className="page-wrapper">
      {/* Search Header Banner */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <h1 className="page-title" style={{ fontSize: '2.4rem', marginBottom: '0.5rem' }}>
          Parcel Tracking & Status History
        </h1>
        <p className="page-subtitle" style={{ fontSize: '1.05rem', maxWidth: '640px', margin: '0 auto 1.25rem' }}>
          Enter your unique tracking number to view real-time checkpoint updates, hub scans, and estimated delivery dates.
        </p>

        {/* College Project Disclaimer Banner */}
        <div
          style={{
            maxWidth: '620px',
            margin: '0 auto 1.5rem',
            background: '#f1f5f9',
            border: '1px solid #cbd5e1',
            borderRadius: '8px',
            padding: '0.5rem 0.85rem',
            fontSize: '0.8rem',
            color: '#475569',
          }}
        >
          ℹ️ <strong>College Project Demonstration:</strong> Checkpoint events are recorded through administrative sorting hub entries simulating courier scanning facilities without requiring GPS hardware integrations.
        </div>

        {/* Tracking Input */}
        <form
          onSubmit={handleSubmit}
          style={{
            maxWidth: '620px',
            margin: '0 auto 1.25rem',
            display: 'flex',
            gap: '0.5rem',
            background: '#ffffff',
            padding: '0.4rem',
            borderRadius: '16px',
            border: '2px solid #e2e8f0',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', flex: 1, padding: '0.4rem 0.75rem', gap: '0.6rem' }}>
            <Search size={22} style={{ color: '#4f46e5' }} />
            <input
              type="text"
              className="form-control"
              placeholder="e.g. TRK-892147"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              style={{ border: 'none', boxShadow: 'none', padding: '0.5rem', fontSize: '1.05rem', fontWeight: 600 }}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 1.75rem', borderRadius: '12px' }} disabled={loading}>
            {loading ? 'Locating...' : 'Track'}
          </button>
        </form>

        {/* Quick Sample Selector */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Demo IDs:</span>
          {sampleNumbers.map((s) => (
            <button
              key={s.code}
              onClick={() => handleSelectSample(s.code)}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem' }}
            >
              {s.code}
            </button>
          ))}
        </div>
      </div>

      {/* Error View */}
      {error && (
        <div className="alert alert-error" style={{ maxWidth: '720px', margin: '0 auto 2rem' }}>
          <AlertTriangle size={22} style={{ flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.2rem' }}>Shipment Not Found</div>
            <span>{error}</span>
            <div style={{ marginTop: '0.4rem', fontSize: '0.825rem', color: '#b91c1c' }}>
              Please verify that your tracking number follows the format (e.g. <code>TRK-892147</code>) or click one of the Demo IDs above.
            </div>
          </div>
        </div>
      )}

      {/* Shipment Results Card */}
      {shipmentData && (
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {/* Top Summary Card */}
          <div className="card" style={{ padding: '2rem' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: '1.25rem',
                borderBottom: '1px solid #e2e8f0',
                paddingBottom: '1.5rem',
                marginBottom: '1.75rem',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <StatusBadge status={shipmentData.status} />
                  <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                    Service: <strong>{shipmentData.serviceType}</strong>
                  </span>
                </div>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>
                  {shipmentData.trackingNumber}
                </h2>
                <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.2rem' }}>
                  Current City Hub: <strong style={{ color: '#4f46e5' }}>{shipmentData.currentCity}</strong>
                </p>
              </div>

              {/* Barcode representation */}
              <div>
                <BarcodeVisual code={shipmentData.trackingNumber} />
              </div>
            </div>

            {/* Stepper Progress Bar */}
            <div style={{ margin: '1rem 0 2rem' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '0.75rem',
                  position: 'relative',
                }}
              >
                {shipmentData.milestones.map((m, idx) => {
                  const isDone = idx <= shipmentData.currentStepIndex;
                  const isCurrent = idx === shipmentData.currentStepIndex;

                  return (
                    <div
                      key={m.key}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                        width: '18%',
                        position: 'relative',
                        zIndex: 2,
                      }}
                    >
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          background: isDone ? (isCurrent ? '#4f46e5' : '#10b981') : '#f1f5f9',
                          color: isDone ? '#ffffff' : '#94a3b8',
                          border: `3px solid ${isDone ? (isCurrent ? '#818cf8' : '#34d399') : '#cbd5e1'}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginBottom: '0.5rem',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          transition: 'all 0.3s',
                        }}
                      >
                        {isDone ? <CheckCircle size={18} /> : idx + 1}
                      </div>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: isCurrent ? 800 : 600,
                          color: isCurrent ? '#4f46e5' : isDone ? '#0f172a' : '#94a3b8',
                          lineHeight: 1.2,
                        }}
                      >
                        {m.title}
                      </span>
                    </div>
                  );
                })}

                {/* Background Connecting Line */}
                <div
                  style={{
                    position: 'absolute',
                    top: '18px',
                    left: '8%',
                    right: '8%',
                    height: '4px',
                    background: '#e2e8f0',
                    zIndex: 1,
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      background: 'linear-gradient(90deg, #10b981 0%, #4f46e5 100%)',
                      width: `${shipmentData.progressPercentage}%`,
                      transition: 'width 0.5s ease',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Route & Spec Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1.25rem',
                background: '#f8fafc',
                padding: '1.25rem',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
              }}
            >
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                  Origin & Sender
                </span>
                <p style={{ fontWeight: 700, color: '#0f172a', margin: '0.2rem 0' }}>
                  {shipmentData.sender?.city || shipmentData.origin}
                </p>
                <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  {shipmentData.sender?.name}
                </p>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                  Destination & Recipient
                </span>
                <p style={{ fontWeight: 700, color: '#0f172a', margin: '0.2rem 0' }}>
                  {shipmentData.recipient?.city || shipmentData.destination}
                </p>
                <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  {shipmentData.recipient?.name}
                </p>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                  Booking Date
                </span>
                <p style={{ fontWeight: 700, color: '#0f172a', margin: '0.2rem 0' }}>
                  {(shipmentData.bookingDate || shipmentData.createdAt)
                    ? new Date(shipmentData.bookingDate || shipmentData.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : 'N/A'}
                </p>
                <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  {shipmentData.packageType} ({shipmentData.weight} kg)
                </p>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                  Estimated Delivery Date
                </span>
                <p style={{ fontWeight: 700, color: '#4f46e5', margin: '0.2rem 0' }}>
                  {new Date(shipmentData.estimatedDelivery).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
                <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  {shipmentData.status === 'Delivered' ? 'Delivered' : 'On Schedule'}
                </p>
              </div>
            </div>
          </div>

          {/* Detailed Checkpoint Timeline Card */}
          <div className="card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h3 className="card-title" style={{ margin: 0 }}>
                  Checkpoint Event History
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.2rem' }}>
                  Chronological scan logs from sorting hubs and delivery partners
                </p>
              </div>
              <button
                onClick={() => performTracking(shipmentData.trackingNumber)}
                className="btn btn-secondary btn-sm"
              >
                <RotateCcw size={14} /> Refresh Logs
              </button>
            </div>

            <Timeline events={shipmentData.events} currentStatus={shipmentData.status} />
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackParcelPage;
