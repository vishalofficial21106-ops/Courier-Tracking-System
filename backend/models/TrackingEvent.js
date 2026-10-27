const mongoose = require('mongoose');

const TRACKING_STATUSES = [
  'Booked',
  'Picked Up',
  'In Transit',
  'Arrived at Facility',
  'Out for Delivery',
  'Delivered',
  'Delivery Failed',
  'Returned',
  'Cancelled',
];

const trackingEventSchema = new mongoose.Schema(
  {
    shipmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shipment',
      required: true,
      index: true,
    },
    trackingNumber: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    status: {
      type: String,
      enum: TRACKING_STATUSES,
      required: [true, 'Event status is required'],
    },
    location: {
      type: String,
      required: [true, 'Facility or city location is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Checkpoint description or audit note is required'],
      trim: true,
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('TrackingEvent', trackingEventSchema);
module.exports.TRACKING_STATUSES = TRACKING_STATUSES;
