import React from 'react';

const StatusBadge = ({ status }) => {
  const getStatusClass = () => {
    switch (status) {
      case 'Booked':
        return 'status-booked';
      case 'Picked Up':
        return 'status-picked-up';
      case 'In Transit':
        return 'status-in-transit';
      case 'Arrived at Facility':
        return 'status-arrived-facility';
      case 'Out for Delivery':
        return 'status-out-for-delivery';
      case 'Delivered':
        return 'status-delivered';
      case 'Delivery Failed':
        return 'status-delivery-failed';
      case 'Returned':
        return 'status-returned';
      case 'Cancelled':
        return 'status-cancelled';
      default:
        return 'status-booked';
    }
  };

  return (
    <span className={`status-badge ${getStatusClass()}`}>
      <span className="dot"></span>
      {status || 'Unknown'}
    </span>
  );
};

export default StatusBadge;
