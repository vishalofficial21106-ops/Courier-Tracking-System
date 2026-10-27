import React, { useState } from 'react';
import {
  BarChart3,
  PieChart,
  Calendar,
  TrendingUp,
  DollarSign,
  Package,
  Layers,
} from 'lucide-react';

const STATUS_COLORS = {
  Booked: '#6366f1',
  'Picked Up': '#8b5cf6',
  'In Transit': '#f59e0b',
  'Arrived at Facility': '#06b6d4',
  'Out for Delivery': '#0ea5e9',
  Delivered: '#10b981',
  'Delivery Failed': '#f43f5e',
  Returned: '#d97706',
  Cancelled: '#94a3b8',
};

const ReportCharts = ({ statusDistribution = [], dateTrends = [], summary = {} }) => {
  const [activeTab, setActiveTab] = useState('status'); // 'status' or 'trends'
  const [hoveredStatus, setHoveredStatus] = useState(null);
  const [hoveredDate, setHoveredDate] = useState(null);

  // Compute maximum count for trends chart scaling
  const maxTrendTotal = Math.max(...dateTrends.map((d) => d.total || 0), 1);
  const totalParcels = summary.total || statusDistribution.reduce((acc, curr) => acc + curr.count, 0) || 1;

  return (
    <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
      {/* Chart Section Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          borderBottom: '1px solid #e2e8f0',
          paddingBottom: '1.25rem',
          marginBottom: '1.75rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <TrendingUp size={20} style={{ color: '#4f46e5' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
              Real-Time Logistics Analytics & Trend Reports
            </h3>
          </div>
          <p style={{ color: '#64748b', fontSize: '0.875rem', margin: 0 }}>
            Aggregated MongoDB telemetry: status breakdown, volume distribution, and dispatch cadence
          </p>
        </div>

        {/* Tab switchers */}
        <div style={{ display: 'flex', gap: '0.5rem', background: '#f1f5f9', padding: '0.25rem', borderRadius: '10px' }}>
          <button
            onClick={() => setActiveTab('status')}
            className={`btn btn-sm ${activeTab === 'status' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: '8px', padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
          >
            <PieChart size={14} /> Status Distribution
          </button>
          <button
            onClick={() => setActiveTab('trends')}
            className={`btn btn-sm ${activeTab === 'trends' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: '8px', padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
          >
            <BarChart3 size={14} /> Daily Delivery Trends
          </button>
        </div>
      </div>

      {/* TAB 1: Status Distribution Chart & Metrics */}
      {activeTab === 'status' && (
        <div>
          {/* Proportion Visual Bar */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
              <span style={{ fontWeight: 600, color: '#334155' }}>Lifecycle Volume Proportion:</span>
              <span style={{ color: '#64748b' }}>Total Active Fleet: <strong>{totalParcels}</strong> consignments</span>
            </div>

            <div
              style={{
                height: '24px',
                borderRadius: '8px',
                background: '#e2e8f0',
                display: 'flex',
                overflow: 'hidden',
                boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)',
              }}
            >
              {statusDistribution.map((item) => {
                const color = STATUS_COLORS[item.status] || '#64748b';
                const pct = totalParcels > 0 ? (item.count / totalParcels) * 100 : 0;
                if (pct <= 0) return null;

                return (
                  <div
                    key={item.status}
                    style={{
                      width: `${pct}%`,
                      background: color,
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                      opacity: hoveredStatus === null || hoveredStatus === item.status ? 1 : 0.45,
                    }}
                    onMouseEnter={() => setHoveredStatus(item.status)}
                    onMouseLeave={() => setHoveredStatus(null)}
                    title={`${item.status}: ${item.count} (${pct.toFixed(1)}%)`}
                  />
                );
              })}
            </div>
          </div>

          {/* Interactive Status Distribution Cards Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '1rem',
              marginBottom: '1.5rem',
            }}
          >
            {statusDistribution.map((item) => {
              const color = STATUS_COLORS[item.status] || '#64748b';
              const pct = totalParcels > 0 ? Math.round((item.count / totalParcels) * 100) : 0;
              const isHovered = hoveredStatus === item.status;

              return (
                <div
                  key={item.status}
                  onMouseEnter={() => setHoveredStatus(item.status)}
                  onMouseLeave={() => setHoveredStatus(null)}
                  style={{
                    background: isHovered ? '#ffffff' : '#f8fafc',
                    border: `2px solid ${isHovered ? color : '#e2e8f0'}`,
                    borderRadius: '12px',
                    padding: '1rem',
                    transition: 'all 0.2s ease',
                    boxShadow: isHovered ? 'var(--shadow-md)' : 'none',
                    transform: isHovered ? 'translateY(-2px)' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
                    <span
                      style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        background: color,
                        display: 'inline-block',
                      }}
                    />
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155' }}>
                      {item.status}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
                    <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>
                      {item.count}
                    </span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: color }}>
                      ({pct}%)
                    </span>
                  </div>

                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.4rem' }}>
                    Revenue: <strong>₹{item.totalRevenue ? item.totalRevenue.toLocaleString() : 0}</strong>
                  </div>
                  {item.avgWeight > 0 && (
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      Avg Wt: <strong>{item.avgWeight} kg</strong>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Grouped Status Report Table */}
          <div className="table-container" style={{ border: '1px solid #e2e8f0', borderRadius: '10px' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Status Name</th>
                  <th>Consignment Count</th>
                  <th>Fleet Share (%)</th>
                  <th>Total Freight Value</th>
                  <th>Average Weight</th>
                </tr>
              </thead>
              <tbody>
                {statusReportRows(statusDistribution, totalParcels)}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Delivery & Booking Trends Time-Series Chart */}
      {activeTab === 'trends' && (
        <div>
          {dateTrends.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
              No historical trend activity recorded for the selected date window.
            </p>
          ) : (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
                  Daily Booking & Delivery Cadence (Y-Axis: Consignment Volume)
                </span>
                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span style={{ width: '10px', height: '10px', background: '#6366f1', borderRadius: '2px' }} />
                    <span>Booked</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span style={{ width: '10px', height: '10px', background: '#f59e0b', borderRadius: '2px' }} />
                    <span>In-Transit</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span style={{ width: '10px', height: '10px', background: '#10b981', borderRadius: '2px' }} />
                    <span>Delivered</span>
                  </div>
                </div>
              </div>

              {/* Responsive SVG Bar Chart */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '1.5rem 1rem 1rem',
                  overflowX: 'auto',
                  marginBottom: '1.5rem',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    gap: '1.5rem',
                    minWidth: `${Math.max(dateTrends.length * 90, 480)}px`,
                    height: '220px',
                    paddingBottom: '2.5rem',
                    position: 'relative',
                    borderBottom: '2px solid #cbd5e1',
                  }}
                >
                  {dateTrends.map((d) => {
                    const totalHeightPct = Math.max(Math.round((d.total / maxTrendTotal) * 160), 16);
                    const isHovered = hoveredDate === d.date;

                    return (
                      <div
                        key={d.date}
                        onMouseEnter={() => setHoveredDate(d.date)}
                        onMouseLeave={() => setHoveredDate(null)}
                        style={{
                          flex: 1,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          height: '100%',
                          justifyContent: 'flex-end',
                          position: 'relative',
                          cursor: 'pointer',
                        }}
                      >
                        {/* Hover Tooltip */}
                        {isHovered && (
                          <div
                            style={{
                              position: 'absolute',
                              bottom: `${totalHeightPct + 36}px`,
                              background: '#0f172a',
                              color: '#ffffff',
                              padding: '0.4rem 0.6rem',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              whiteSpace: 'nowrap',
                              zIndex: 10,
                              boxShadow: 'var(--shadow-md)',
                            }}
                          >
                            <strong>{d.date}</strong>: {d.total} shipments <br />
                            Booked: {d.booked} | Transit: {d.inTransit} | Done: {d.delivered} <br />
                            Rev: ₹{d.revenue.toLocaleString()}
                          </div>
                        )}

                        {/* Total Count Label Above Bar */}
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                          {d.total}
                        </span>

                        {/* Stacked Bar */}
                        <div
                          style={{
                            width: '36px',
                            height: `${totalHeightPct}px`,
                            borderRadius: '6px 6px 0 0',
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column-reverse',
                            background: '#e2e8f0',
                            boxShadow: isHovered ? '0 0 0 2px #4f46e5' : 'none',
                            transition: 'all 0.2s',
                          }}
                        >
                          <div
                            style={{
                              height: `${(d.delivered / (d.total || 1)) * 100}%`,
                              background: '#10b981',
                            }}
                            title={`Delivered: ${d.delivered}`}
                          />
                          <div
                            style={{
                              height: `${(d.inTransit / (d.total || 1)) * 100}%`,
                              background: '#f59e0b',
                            }}
                            title={`In Transit: ${d.inTransit}`}
                          />
                          <div
                            style={{
                              height: `${(d.booked / (d.total || 1)) * 100}%`,
                              background: '#6366f1',
                            }}
                            title={`Booked: ${d.booked}`}
                          />
                        </div>

                        {/* Date Label on X-Axis */}
                        <span
                          style={{
                            position: 'absolute',
                            bottom: '-24px',
                            fontSize: '0.725rem',
                            color: '#64748b',
                            fontWeight: isHovered ? 700 : 500,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {d.date ? d.date.slice(5) : ''}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Grouped Date Report Table */}
              <div className="table-container" style={{ border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Booking Date</th>
                      <th>Total Dispatches</th>
                      <th>Booked</th>
                      <th>In-Transit / Hub</th>
                      <th>Out for Delivery</th>
                      <th>Delivered</th>
                      <th>Daily Freight Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dateTrends.map((d) => (
                      <tr key={d.date}>
                        <td>
                          <strong>{d.date}</strong>
                        </td>
                        <td>
                          <span style={{ fontWeight: 700, color: '#0f172a' }}>{d.total}</span>
                        </td>
                        <td>
                          <span style={{ color: '#6366f1', fontWeight: 600 }}>{d.booked}</span>
                        </td>
                        <td>
                          <span style={{ color: '#f59e0b', fontWeight: 600 }}>{d.inTransit}</span>
                        </td>
                        <td>
                          <span style={{ color: '#0ea5e9', fontWeight: 600 }}>{d.outForDelivery}</span>
                        </td>
                        <td>
                          <span style={{ color: '#10b981', fontWeight: 700 }}>{d.delivered}</span>
                        </td>
                        <td>
                          <span style={{ fontWeight: 700, color: '#0f172a' }}>₹{d.revenue.toLocaleString()}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Helper for rendering status report table rows
function statusReportRows(statusDistribution, totalParcels) {
  if (statusDistribution.length === 0) {
    return (
      <tr>
        <td colSpan="5" style={{ textAlign: 'center', color: '#64748b' }}>
          No status reports found.
        </td>
      </tr>
    );
  }

  return statusDistribution.map((item) => {
    const color = STATUS_COLORS[item.status] || '#64748b';
    const pct = totalParcels > 0 ? ((item.count / totalParcels) * 100).toFixed(1) : 0;

    return (
      <tr key={item.status}>
        <td>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: color }} />
            <strong style={{ color: '#0f172a' }}>{item.status}</strong>
          </div>
        </td>
        <td>
          <span style={{ fontWeight: 700, color: '#0f172a' }}>{item.count}</span>
        </td>
        <td>
          <span style={{ fontWeight: 600, color: '#334155' }}>{pct}%</span>
        </td>
        <td>
          <span style={{ fontWeight: 700, color: '#059669' }}>
            ₹{item.totalRevenue ? item.totalRevenue.toLocaleString() : 0}
          </span>
        </td>
        <td>
          <span style={{ color: '#475569' }}>{item.avgWeight ? `${item.avgWeight} kg` : '—'}</span>
        </td>
      </tr>
    );
  });
}

export default ReportCharts;
