import React from 'react';

const BarcodeVisual = ({ code = 'TRK-000000', showDetails = true }) => {
  // Generate deterministically spaced barcode bars from string
  const bars = code.split('').flatMap((char, i) => {
    const val = char.charCodeAt(0);
    return [
      { width: (val % 3) + 1.5, space: (val % 2) + 1.2 },
      { width: ((val * 2) % 4) + 1.2, space: 1.5 },
    ];
  });

  return (
    <div
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '0.75rem 1.25rem',
        background: '#ffffff',
        border: '1px solid #cbd5e1',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          height: '42px',
          gap: '2px',
          overflow: 'hidden',
        }}
      >
        {bars.slice(0, 34).map((b, idx) => (
          <div
            key={idx}
            style={{
              width: `${b.width}px`,
              height: '100%',
              backgroundColor: '#0f172a',
              marginRight: `${b.space}px`,
            }}
          />
        ))}
      </div>
      {showDetails && (
        <span
          style={{
            fontFamily: 'monospace',
            letterSpacing: '0.15em',
            fontSize: '0.825rem',
            fontWeight: '700',
            marginTop: '0.35rem',
            color: '#1e293b',
          }}
        >
          {code}
        </span>
      )}
    </div>
  );
};

export default BarcodeVisual;
