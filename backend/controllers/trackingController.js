const Shipment = require('../models/Shipment');
const TrackingEvent = require('../models/TrackingEvent');

// Progress percentage map for all supported workflow statuses
const STATUS_PROGRESS = {
  Booked: 12,
  'Picked Up': 28,
  'In Transit': 48,
  'Arrived at Facility': 66,
  'Out for Delivery': 85,
  Delivered: 100,
  'Delivery Failed': 85,
  Returned: 100,
  Cancelled: 0,
};

// Standard milestone sequence representing the physical logistics journey
const MILESTONES = [
  { key: 'Booked', title: 'Order Booked', desc: 'Consignment booked & shipping label printed' },
  { key: 'Picked Up', title: 'Package Picked Up', desc: 'Collected by courier partner from consignor' },
  { key: 'In Transit', title: 'In Transit', desc: 'Interstate / inter-city linehaul transportation' },
  { key: 'Arrived at Facility', title: 'Arrived at Facility', desc: 'Processed at regional sorting/distribution center' },
  { key: 'Out for Delivery', title: 'Out for Delivery', desc: 'Dispatched with local courier agent for doorstep delivery' },
  { key: 'Delivered', title: 'Delivered', desc: 'Successfully delivered to recipient' },
];

const VALID_TRACKING_STATUSES = [
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

// Helper to mask names for privacy in public tracking (e.g. "Rajesh Sharma" -> "R***** S*****")
const maskName = (name) => {
  if (!name) return 'Customer';
  const parts = name.trim().split(' ');
  return parts
    .map((part) => {
      if (part.length <= 1) return part;
      return part[0] + '*'.repeat(Math.min(part.length - 1, 5));
    })
    .join(' ');
};

// @desc    Track parcel publicly by tracking number without exposing private personal info
// @route   GET /api/tracking/:trackingNumber
// @access  Public
const trackParcelByNumber = async (req, res) => {
  try {
    const rawTrackingNumber = req.params.trackingNumber;
    if (!rawTrackingNumber || !rawTrackingNumber.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Tracking number parameter is required.',
      });
    }

    const cleanNumber = rawTrackingNumber.trim().toUpperCase();

    // Find shipment by unique tracking number
    const shipment = await Shipment.findOne({ trackingNumber: cleanNumber });

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: `No shipment found for tracking number "${cleanNumber}". Please double-check your tracking ID and try again.`,
      });
    }

    // Retrieve ALL checkpoint tracking events in chronological order (oldest to newest)
    const events = await TrackingEvent.find({ shipmentId: shipment._id }).sort({
      timestamp: 1,
    });

    const progressPercentage = STATUS_PROGRESS[shipment.status] !== undefined ? STATUS_PROGRESS[shipment.status] : 15;

    // Determine current milestone index
    let statusIndex = MILESTONES.findIndex((m) => m.key === shipment.status);
    if (statusIndex === -1) {
      if (['Delivery Failed', 'Returned'].includes(shipment.status)) {
        statusIndex = MILESTONES.length - 1;
      } else {
        statusIndex = 0;
      }
    }

    // Return public telemetry with privacy preservation:
    // Sender/recipient exact street address and phone numbers are not exposed publicly.
    return res.status(200).json({
      success: true,
      trackingNumber: shipment.trackingNumber,
      status: shipment.status,
      currentCity: shipment.currentCity,
      origin: shipment.origin,
      destination: shipment.destination,
      sender: {
        name: maskName(shipment.sender?.name),
        city: shipment.origin,
      },
      recipient: {
        name: maskName(shipment.recipient?.name),
        city: shipment.destination,
      },
      packageType: shipment.packageType,
      weight: shipment.weight,
      serviceType: shipment.serviceType,
      bookingDate: shipment.bookingDate || shipment.createdAt,
      createdAt: shipment.createdAt,
      estimatedDelivery: shipment.estimatedDelivery,
      progressPercentage,
      currentStepIndex: statusIndex,
      milestones: MILESTONES,
      events: events.map((e) => ({
        id: e._id,
        status: e.status,
        location: e.location,
        description: e.description,
        notes: e.notes || '',
        timestamp: e.timestamp,
      })),
    });
  } catch (error) {
    console.error('[Track Parcel Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error occurred while tracking parcel.',
    });
  }
};

// @desc    Add manual tracking event checkpoint
// @route   POST /api/tracking/:trackingNumber/checkpoint
// @access  Private (Admin only)
const addTrackingEvent = async (req, res) => {
  try {
    const cleanNumber = req.params.trackingNumber.trim().toUpperCase();
    const { status, location, description, notes, timestamp } = req.body;

    if (!location || !location.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Checkpoint facility or city location is required.',
      });
    }

    if (!description || !description.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Checkpoint description is required.',
      });
    }

    const shipment = await Shipment.findOne({ trackingNumber: cleanNumber });
    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: `Shipment "${cleanNumber}" not found.`,
      });
    }

    const targetStatus = status || shipment.status;

    // Validate status
    if (status && !VALID_TRACKING_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status "${status}". Allowed: ${VALID_TRACKING_STATUSES.join(', ')}`,
      });
    }

    // Prevent duplicate event within 30 seconds
    const latestEvent = await TrackingEvent.findOne({ shipmentId: shipment._id }).sort({ timestamp: -1 });
    if (latestEvent) {
      const isSameStatus = latestEvent.status === targetStatus;
      const isSameLocation = latestEvent.location.trim().toLowerCase() === location.trim().toLowerCase();
      const timeDiff = Math.abs(Date.now() - new Date(latestEvent.timestamp).getTime());

      if (isSameStatus && isSameLocation && timeDiff < 30000) {
        return res.status(409).json({
          success: false,
          message: `Duplicate event prevented: Checkpoint with status "${targetStatus}" at "${location.trim()}" was recorded just moments ago.`,
        });
      }
    }

    // Update shipment
    shipment.status = targetStatus;
    shipment.currentCity = location.trim();
    await shipment.save();

    const eventDate = timestamp ? new Date(timestamp) : new Date();

    const newEvent = await TrackingEvent.create({
      shipmentId: shipment._id,
      trackingNumber: shipment.trackingNumber,
      status: targetStatus,
      location: location.trim(),
      description: description.trim(),
      notes: notes ? notes.trim() : '',
      updatedBy: req.user._id,
      timestamp: isNaN(eventDate.getTime()) ? new Date() : eventDate,
    });

    return res.status(201).json({
      success: true,
      message: 'Tracking event recorded successfully.',
      event: newEvent,
      shipment,
    });
  } catch (error) {
    console.error('[Add Tracking Event Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to add tracking event.',
    });
  }
};

module.exports = {
  trackParcelByNumber,
  addTrackingEvent,
  VALID_TRACKING_STATUSES,
};
