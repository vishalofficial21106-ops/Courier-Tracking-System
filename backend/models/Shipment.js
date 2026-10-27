const mongoose = require('mongoose');

const SHIPMENT_STATUSES = [
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

const shipmentSchema = new mongoose.Schema(
  {
    trackingNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    sender: {
      name: { type: String, required: [true, 'Sender name is required'], trim: true },
      email: { type: String, default: '', trim: true, lowercase: true },
      phone: { type: String, required: [true, 'Sender phone is required'], trim: true },
      address: { type: String, required: [true, 'Sender address is required'], trim: true },
      city: { type: String, required: [true, 'Sender city is required'], trim: true },
      state: { type: String, default: '', trim: true },
      postalCode: { type: String, default: '', trim: true },
    },
    recipient: {
      name: { type: String, required: [true, 'Recipient name is required'], trim: true },
      email: { type: String, default: '', trim: true, lowercase: true },
      phone: { type: String, required: [true, 'Recipient phone is required'], trim: true },
      address: { type: String, required: [true, 'Recipient address is required'], trim: true },
      city: { type: String, required: [true, 'Recipient city is required'], trim: true },
      state: { type: String, default: '', trim: true },
      postalCode: { type: String, default: '', trim: true },
    },
    origin: {
      type: String,
      required: [true, 'Origin city is required'],
      trim: true,
    },
    destination: {
      type: String,
      required: [true, 'Destination city is required'],
      trim: true,
    },
    currentCity: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: SHIPMENT_STATUSES,
      default: 'Booked',
      index: true,
    },
    packageType: {
      type: String,
      enum: ['Document', 'Small Box', 'Large Parcel', 'Fragile Goods', 'Electronics', 'Heavy Freight'],
      default: 'Small Box',
    },
    weight: {
      type: Number,
      required: [true, 'Weight in kg is required'],
      min: [0.01, 'Weight must be at least 0.01 kg'],
      default: 1.0,
    },
    dimensions: {
      length: { type: Number, default: 20 },
      width: { type: Number, default: 15 },
      height: { type: Number, default: 10 },
    },
    serviceType: {
      type: String,
      enum: ['Standard Delivery', 'Express Air', 'Same Day Delivery'],
      default: 'Standard Delivery',
    },
    cost: {
      type: Number,
      default: 150,
    },
    bookingDate: {
      type: Date,
      default: Date.now,
    },
    estimatedDelivery: {
      type: Date,
      required: [true, 'Estimated delivery date is required'],
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Shipment', shipmentSchema);
module.exports.SHIPMENT_STATUSES = SHIPMENT_STATUSES;
