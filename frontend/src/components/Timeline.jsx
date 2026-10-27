import React from 'react';
import {
  CheckCircle2,
  Clock,
  MapPin,
  Truck,
  AlertCircle,
  Package,
  Building2,
  AlertTriangle,
  RotateCcw,
  FileText,
} from 'lucide-react';

const Timeline = ({ events = [], currentStatus = '' }) => {
  const getIcon = (status, isLatest) => {
    switch (status) {
      case 'Delivered':
        return <CheckCircle2 size={20} />;
      case 'Out for Delivery':
        return <Truck size={20} />;
      case 'Arrived at Facility':
        return <Building2 size={20} />;
      case 'In Transit':
        return <Truck size={20} />;
      case 'Picked Up':
        return <Package size={20} />;
      case 'Delivery Failed':
        return <AlertTriangle size={20} />;
      case 'Returned':
        return <RotateCcw size={20} />;
      case 'Cancelled':
        return <AlertCircle size={20} />;
      default:
        return <Clock size={20} />;
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!events || events.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
        <Clock size={32} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
        <p style={{ fontWeight: 600 }}>No tracking events recorded yet.</p>
        <p style={{ fontSize: '0.85rem', marginTop: '0.2rem' }}>
          Checkpoints will appear as the consignment progresses through logistics hubs.
        </p>
      </div>
    );
  }

  // Display latest event at top for clear tracking progression
  const sortedEvents = [...events].reverse();

  return (
    <div className="timeline">
      {sortedEvents.map((ev, index) => {
        const isLatest = index === 0;
        const isDelivered = ev.status === 'Delivered';
        const isFailed = ev.status === 'Delivery Failed' || ev.status === 'Cancelled';

        return (
          <div
            key={ev.id || ev._id || index}
            className={`timeline-item ${isDelivered ? 'completed' : ''} ${
              isLatest && !isDelivered ? 'current' : ''
            }`}
          >
            <div
              className="timeline-marker"
              style={{
                borderColor: isFailed ? '#ef4444' : undefined,
                color: isFailed ? '#ef4444' : undefined,
              }}
            >
              {getIcon(ev.status, isLatest)}
            </div>

            <div className="timeline-content">
              <div className="timeline-header">
                <span className="timeline-status" style={{ color: isFailed ? '#dc2626' : undefined }}>
                  {ev.status}
                </span>
                <span className="timeline-time">{formatDate(ev.timestamp)}</span>
              </div>

              {ev.location && (
                <div className="timeline-location">
                  <MapPin size={14} style={{ display: 'inline', marginRight: '4px' }} />
                  {ev.location}
                </div>
              )}

              <p className="timeline-desc">{ev.description}</p>

              {ev.notes && (
                <div
                  style={{
                    marginTop: '0.45rem',
                    padding: '0.35rem 0.65rem',
                    background: '#f8fafc',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    color: '#475569',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    borderLeft: '2px solid #818cf8',
                  }}
                >
                  <FileText size={13} style={{ color: '#4f46e5' }} />
                  <span><strong>Tracking Note:</strong> {ev.notes}</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Timeline;
