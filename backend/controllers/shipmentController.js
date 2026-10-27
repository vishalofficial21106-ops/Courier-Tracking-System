const mongoose = require('mongoose');
const Shipment = require('../models/Shipment');
const TrackingEvent = require('../models/TrackingEvent');
const User = require('../models/User');

// Helper to find shipment by ObjectId OR trackingNumber
const findShipmentByIdOrTracking = async (param) => {
  if (!param) return null;
  const clean = String(param).trim();
  const isMongoId = mongoose.Types.ObjectId.isValid(clean) && clean.length === 24;
  if (isMongoId) {
    const found = await Shipment.findById(clean);
    if (found) return found;
  }
  return await Shipment.findOne({ trackingNumber: clean.toUpperCase() });
};

// Helper to generate unique alphanumeric tracking number: TRK-XXXXXX
const generateTrackingNumber = async () => {
  let isUnique = false;
  let trackingNumber = '';
  while (!isUnique) {
    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    trackingNumber = `TRK-${randomDigits}`;
    const existing = await Shipment.findOne({ trackingNumber });
    if (!existing) {
      isUnique = true;
    }
  }
  return trackingNumber;
};

// @desc    Create / Book a new shipment
// @route   POST /api/shipments
// @access  Private (Admin or Authenticated Customer)
// @security createdBy is strictly bound to req.user._id; cannot be forged by client
const createShipment = async (req, res) => {
  try {
    const {
      sender,
      recipient,
      origin,
      destination,
      currentCity,
      packageType,
      weight,
      dimensions,
      serviceType,
      cost,
      bookingDate,
      estimatedDelivery,
      notes,
      customerId,
    } = req.body;

    // Input Validations
    if (!sender?.name || !sender?.phone || !sender?.city) {
      return res.status(400).json({
        success: false,
        message: 'Sender name, phone, and origin city are required.',
      });
    }

    if (!recipient?.name || !recipient?.phone || !recipient?.city) {
      return res.status(400).json({
        success: false,
        message: 'Recipient name, phone, and destination city are required.',
      });
    }

    const numWeight = Number(weight);
    if (isNaN(numWeight) || numWeight <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Weight must be a positive number in kg.',
      });
    }

    const trackingNumber = await generateTrackingNumber();

    // Parse booking and estimated delivery dates
    const parsedBookingDate = bookingDate ? new Date(bookingDate) : new Date();
    const estDate = estimatedDelivery
      ? new Date(estimatedDelivery)
      : new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

    // Calculate freight cost based on tier & weight
    let calculatedCost = Number(cost);
    if (!calculatedCost || isNaN(calculatedCost)) {
      const baseRates = {
        'Standard Delivery': 120,
        'Express Air': 250,
        'Same Day Delivery': 400,
      };
      const base = baseRates[serviceType] || 120;
      calculatedCost = Math.round(base + numWeight * 35);
    }

    // Determine associated customer account:
    // If admin creates, check if customerId or recipient email matches a registered User
    let assignedCustomer = null;
    if (req.user.role === 'customer') {
      assignedCustomer = req.user._id;
    } else if (customerId && mongoose.Types.ObjectId.isValid(customerId)) {
      assignedCustomer = customerId;
    } else if (recipient.email) {
      const matchedUser = await User.findOne({ email: recipient.email.trim().toLowerCase() });
      if (matchedUser) {
        assignedCustomer = matchedUser._id;
      }
    }

    const shipment = await Shipment.create({
      trackingNumber,
      sender: {
        name: sender.name.trim(),
        email: sender.email ? sender.email.trim().toLowerCase() : '',
        phone: sender.phone.trim(),
        address: sender.address ? sender.address.trim() : sender.city.trim(),
        city: sender.city.trim(),
        state: sender.state ? sender.state.trim() : '',
        postalCode: sender.postalCode ? sender.postalCode.trim() : '',
      },
      recipient: {
        name: recipient.name.trim(),
        email: recipient.email ? recipient.email.trim().toLowerCase() : '',
        phone: recipient.phone.trim(),
        address: recipient.address ? recipient.address.trim() : recipient.city.trim(),
        city: recipient.city.trim(),
        state: recipient.state ? recipient.state.trim() : '',
        postalCode: recipient.postalCode ? recipient.postalCode.trim() : '',
      },
      origin: origin ? origin.trim() : sender.city.trim(),
      destination: destination ? destination.trim() : recipient.city.trim(),
      currentCity: currentCity ? currentCity.trim() : (origin ? origin.trim() : sender.city.trim()),
      status: 'Booked',
      packageType: packageType || 'Small Box',
      weight: numWeight,
      dimensions: dimensions || { length: 20, width: 15, height: 10 },
      serviceType: serviceType || 'Standard Delivery',
      cost: calculatedCost,
      bookingDate: isNaN(parsedBookingDate.getTime()) ? new Date() : parsedBookingDate,
      estimatedDelivery: estDate,
      customer: assignedCustomer,
      createdBy: req.user._id, // Enforce logged-in creator
      notes: notes ? notes.trim() : '',
    });

    // Create initial audit checkpoint event
    const initialEvent = await TrackingEvent.create({
      shipmentId: shipment._id,
      trackingNumber: shipment.trackingNumber,
      status: 'Booked',
      location: shipment.origin,
      description: `Shipment order created and booked at ${shipment.origin} facility. Label generated.`,
      updatedBy: req.user._id,
      timestamp: new Date(),
    });

    return res.status(201).json({
      success: true,
      message: 'Shipment created successfully!',
      shipment,
      initialEvent,
    });
  } catch (error) {
    console.error('[Create Shipment Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to create shipment.',
    });
  }
};

// @desc    Get all shipments with search and filters
// @route   GET /api/shipments
// @access  Private (Admin sees all; Customers see ONLY their associated shipments)
const getAllShipments = async (req, res) => {
  try {
    const { status, search, bookingDate, startDate, endDate, limit = 50, page = 1 } = req.query;
    const query = {};

    // SECURITY: Authenticated customers can ONLY view shipments linked to their account
    if (req.user.role !== 'admin') {
      query.$or = [
        { customer: req.user._id },
        { 'sender.email': req.user.email.toLowerCase() },
        { 'recipient.email': req.user.email.toLowerCase() },
      ];
    }

    // Filter by status if provided
    if (status && status !== 'All') {
      query.status = status;
    }

    // Filter by specific booking date or date range
    if (bookingDate && bookingDate.trim()) {
      const startOfDay = new Date(bookingDate.trim());
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(bookingDate.trim());
      endOfDay.setHours(23, 59, 59, 999);

      if (!isNaN(startOfDay.getTime())) {
        query.bookingDate = { $gte: startOfDay, $lte: endOfDay };
      }
    } else if (startDate || endDate) {
      const dateRange = {};
      if (startDate) {
        const s = new Date(startDate);
        s.setHours(0, 0, 0, 0);
        if (!isNaN(s.getTime())) dateRange.$gte = s;
      }
      if (endDate) {
        const e = new Date(endDate);
        e.setHours(23, 59, 59, 999);
        if (!isNaN(e.getTime())) dateRange.$lte = e;
      }
      if (Object.keys(dateRange).length > 0) {
        query.bookingDate = dateRange;
      }
    }

    // Keyword search across tracking number, names, and cities
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      const searchCondition = [
        { trackingNumber: searchRegex },
        { 'recipient.name': searchRegex },
        { 'sender.name': searchRegex },
        { origin: searchRegex },
        { destination: searchRegex },
        { currentCity: searchRegex },
      ];

      if (query.$or) {
        query.$and = [{ $or: query.$or }, { $or: searchCondition }];
        delete query.$or;
      } else {
        query.$or = searchCondition;
      }
    }

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 50));
    const skip = (pageNum - 1) * limitNum;

    const total = await Shipment.countDocuments(query);
    const shipments = await Shipment.find(query)
      .populate('customer', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    return res.status(200).json({
      success: true,
      count: shipments.length,
      total,
      currentPage: pageNum,
      totalPages: Math.ceil(total / limitNum),
      shipments,
    });
  } catch (error) {
    console.error('[Get All Shipments Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch shipments.',
    });
  }
};

// @desc    Get single shipment by ID with its tracking timeline
// @route   GET /api/shipments/:id
// @access  Private (Admins or Authorized Customer)
const getShipmentById = async (req, res) => {
  try {
    const shipment = await findShipmentByIdOrTracking(req.params.id);

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: 'Shipment not found with given ID or tracking number.',
      });
    }

    if (!shipment.populated('customer')) {
      await shipment.populate('customer', 'name email phone');
    }

    // SECURITY: Customers can only inspect detailed waybills of their own shipments
    if (req.user && req.user.role !== 'admin') {
      const isCustomerOwner =
        (shipment.customer && shipment.customer.equals(req.user._id)) ||
        (shipment.sender?.email && shipment.sender.email.toLowerCase() === req.user.email.toLowerCase()) ||
        (shipment.recipient?.email && shipment.recipient.email.toLowerCase() === req.user.email.toLowerCase());

      if (!isCustomerOwner) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You are not authorized to view the full manifest of this shipment.',
        });
      }
    }

    // Fetch tracking events sorted chronologically
    const trackingEvents = await TrackingEvent.find({ shipmentId: shipment._id })
      .sort({ timestamp: 1 })
      .populate('updatedBy', 'name role');

    return res.status(200).json({
      success: true,
      shipment,
      trackingEvents,
    });
  } catch (error) {
    console.error('[Get Shipment By ID Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch shipment details.',
    });
  }
};

// Valid shipment statuses
const VALID_SHIPMENT_STATUSES = [
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

// @desc    Update shipment status & add tracking checkpoint
// @route   PUT /api/shipments/:id/status
// @access  Private (Admin only)
const updateShipmentStatus = async (req, res) => {
  try {
    const { status, currentCity, location, description, notes, timestamp } = req.body;

    const shipment = await findShipmentByIdOrTracking(req.params.id);
    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: 'Shipment not found with given ID or tracking number.',
      });
    }

    // 1. Validate requested status
    if (status && !VALID_SHIPMENT_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status "${status}". Allowed values: ${VALID_SHIPMENT_STATUSES.join(', ')}`,
      });
    }

    const nextStatus = status || shipment.status;

    // 2. Prevent invalid backward transitions from terminal states
    if (['Delivered', 'Returned'].includes(shipment.status)) {
      if (['Booked', 'Picked Up', 'In Transit', 'Arrived at Facility'].includes(nextStatus)) {
        return res.status(400).json({
          success: false,
          message: `Cannot revert consignment status to "${nextStatus}" because package is already marked as "${shipment.status}".`,
        });
      }
    }

    // 3. Resolve location
    const eventLocation = location
      ? location.trim()
      : currentCity
      ? currentCity.trim()
      : shipment.currentCity;

    if (!eventLocation) {
      return res.status(400).json({
        success: false,
        message: 'Facility or city location is required for tracking checkpoints.',
      });
    }

    // 4. Duplicate event prevention (idempotency check)
    // Check if an identical status & location was logged within the past 30 seconds
    const latestEvent = await TrackingEvent.findOne({ shipmentId: shipment._id }).sort({ timestamp: -1 });
    if (latestEvent) {
      const isSameStatus = latestEvent.status === nextStatus;
      const isSameLocation = latestEvent.location.trim().toLowerCase() === eventLocation.trim().toLowerCase();
      const timeDiff = Math.abs(Date.now() - new Date(latestEvent.timestamp).getTime());

      if (isSameStatus && isSameLocation && timeDiff < 30000) {
        return res.status(409).json({
          success: false,
          message: `Duplicate event prevented: A checkpoint with status "${nextStatus}" at "${eventLocation}" was already recorded just moments ago.`,
        });
      }
    }

    // 5. Update shipment current status & city
    shipment.status = nextStatus;
    shipment.currentCity = eventLocation;
    const updatedShipment = await shipment.save();

    // 6. Record immutable TrackingEvent checkpoint
    const eventDescription = description
      ? description.trim()
      : `Shipment status updated to "${nextStatus}" at ${eventLocation}.`;

    const eventDate = timestamp ? new Date(timestamp) : new Date();

    const trackingEvent = await TrackingEvent.create({
      shipmentId: shipment._id,
      trackingNumber: shipment.trackingNumber,
      status: nextStatus,
      location: eventLocation,
      description: eventDescription,
      notes: notes ? notes.trim() : '',
      updatedBy: req.user._id,
      timestamp: isNaN(eventDate.getTime()) ? new Date() : eventDate,
    });

    return res.status(200).json({
      success: true,
      message: `Shipment status updated to "${nextStatus}". Checkpoint recorded.`,
      shipment: updatedShipment,
      trackingEvent,
    });
  } catch (error) {
    console.error('[Update Shipment Status Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update shipment status.',
    });
  }
};

// @desc    Update shipment general details
// @route   PUT /api/shipments/:id
// @access  Private (Admin only)
const updateShipment = async (req, res) => {
  try {
    const shipment = await findShipmentByIdOrTracking(req.params.id);
    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: 'Shipment not found.',
      });
    }

    // Disallow modifying sensitive identifiers
    delete req.body.trackingNumber;
    delete req.body.createdBy;

    const updatedShipment = await Shipment.findByIdAndUpdate(shipment._id, req.body, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({
      success: true,
      message: 'Shipment updated successfully.',
      shipment: updatedShipment,
    });
  } catch (error) {
    console.error('[Update Shipment Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update shipment.',
    });
  }
};

// @desc    Delete shipment and its tracking events
// @route   DELETE /api/shipments/:id
// @access  Private (Admin only)
const deleteShipment = async (req, res) => {
  try {
    const shipment = await findShipmentByIdOrTracking(req.params.id);
    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: 'Shipment not found.',
      });
    }

    // Delete associated tracking events
    await TrackingEvent.deleteMany({ shipmentId: shipment._id });
    await shipment.deleteOne();

    return res.status(200).json({
      success: true,
      message: `Shipment ${shipment.trackingNumber} and its tracking history have been removed.`,
    });
  } catch (error) {
    console.error('[Delete Shipment Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete shipment.',
    });
  }
};

// @desc    Get dashboard statistics
// @route   GET /api/shipments/stats/summary
// @access  Private
const getShipmentStats = async (req, res) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const filter = isAdmin
      ? {}
      : {
          $or: [
            { customer: req.user._id },
            { 'sender.email': req.user.email },
            { 'recipient.email': req.user.email },
          ],
        };

    const total = await Shipment.countDocuments(filter);
    const booked = await Shipment.countDocuments({ ...filter, status: 'Booked' });
    const pickedUp = await Shipment.countDocuments({ ...filter, status: 'Picked Up' });
    const inTransit = await Shipment.countDocuments({ ...filter, status: 'In Transit' });
    const arrivedAtFacility = await Shipment.countDocuments({ ...filter, status: 'Arrived at Facility' });
    const outForDelivery = await Shipment.countDocuments({ ...filter, status: 'Out for Delivery' });
    const delivered = await Shipment.countDocuments({ ...filter, status: 'Delivered' });
    const deliveryFailed = await Shipment.countDocuments({ ...filter, status: 'Delivery Failed' });
    const returned = await Shipment.countDocuments({ ...filter, status: 'Returned' });
    const cancelled = await Shipment.countDocuments({ ...filter, status: 'Cancelled' });

    // Calculate revenue (for admin)
    let totalRevenue = 0;
    if (isAdmin) {
      const revenueData = await Shipment.aggregate([
        { $match: { status: { $ne: 'Cancelled' } } },
        { $group: { _id: null, total: { $sum: '$cost' } } },
      ]);
      totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;
    }

    // Recent 5 shipments
    const recentShipments = await Shipment.find(filter)
      .sort({ createdAt: -1 })
      .limit(5);

    return res.status(200).json({
      success: true,
      stats: {
        total,
        active: booked + pickedUp + inTransit + arrivedAtFacility + outForDelivery,
        booked,
        pickedUp,
        inTransit,
        arrivedAtFacility,
        outForDelivery,
        delivered,
        deliveryFailed,
        returned,
        cancelled,
        totalRevenue,
      },
      recentShipments,
    });
  } catch (error) {
    console.error('[Shipment Stats Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch shipment statistics.',
    });
  }
};

// @desc    Get detailed shipment reports grouped by status and date
// @route   GET /api/shipments/reports/analytics
// @access  Private (Admin only)
const getShipmentReports = async (req, res) => {
  try {
    const { startDate, endDate, status } = req.query;

    const matchFilter = {};
    if (status && status !== 'All') {
      matchFilter.status = status;
    }

    if (startDate || endDate) {
      const dateCond = {};
      if (startDate) {
        const s = new Date(startDate);
        s.setHours(0, 0, 0, 0);
        if (!isNaN(s.getTime())) dateCond.$gte = s;
      }
      if (endDate) {
        const e = new Date(endDate);
        e.setHours(23, 59, 59, 999);
        if (!isNaN(e.getTime())) dateCond.$lte = e;
      }
      if (Object.keys(dateCond).length > 0) {
        matchFilter.bookingDate = dateCond;
      }
    }

    // 1. Overall Aggregation Summary
    const totalCount = await Shipment.countDocuments(matchFilter);
    const bookedCount = await Shipment.countDocuments({ ...matchFilter, status: 'Booked' });
    const inTransitCount = await Shipment.countDocuments({
      ...matchFilter,
      status: { $in: ['In Transit', 'Picked Up', 'Arrived at Facility'] },
    });
    const outForDeliveryCount = await Shipment.countDocuments({ ...matchFilter, status: 'Out for Delivery' });
    const deliveredCount = await Shipment.countDocuments({ ...matchFilter, status: 'Delivered' });
    const deliveryFailedCount = await Shipment.countDocuments({ ...matchFilter, status: 'Delivery Failed' });
    const returnedCount = await Shipment.countDocuments({ ...matchFilter, status: 'Returned' });
    const cancelledCount = await Shipment.countDocuments({ ...matchFilter, status: 'Cancelled' });

    // Revenue & weight totals
    const metrics = await Shipment.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$cost' },
          avgCost: { $avg: '$cost' },
          totalWeight: { $sum: '$weight' },
          avgWeight: { $avg: '$weight' },
        },
      },
    ]);

    const summaryMetrics = metrics[0] || {
      totalRevenue: 0,
      avgCost: 0,
      totalWeight: 0,
      avgWeight: 0,
    };

    // 2. Grouped By Status
    const statusReport = await Shipment.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$cost' },
          avgWeight: { $avg: '$weight' },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // 3. Grouped By Date (Daily Trends)
    const dateReport = await Shipment.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: { $ifNull: ['$bookingDate', '$createdAt'] },
            },
          },
          total: { $sum: 1 },
          booked: {
            $sum: { $cond: [{ $eq: ['$status', 'Booked'] }, 1, 0] },
          },
          inTransit: {
            $sum: {
              $cond: [
                { $in: ['$status', ['In Transit', 'Picked Up', 'Arrived at Facility']] },
                1,
                0,
              ],
            },
          },
          outForDelivery: {
            $sum: { $cond: [{ $eq: ['$status', 'Out for Delivery'] }, 1, 0] },
          },
          delivered: {
            $sum: { $cond: [{ $eq: ['$status', 'Delivered'] }, 1, 0] },
          },
          failed: {
            $sum: {
              $cond: [{ $in: ['$status', ['Delivery Failed', 'Returned']] }, 1, 0],
            },
          },
          revenue: { $sum: '$cost' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // 4. Grouped By Package Type
    const packageTypeReport = await Shipment.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: '$packageType',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$cost' },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // 5. Grouped By Service Tier
    const serviceTypeReport = await Shipment.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: '$serviceType',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$cost' },
        },
      },
      { $sort: { count: -1 } },
    ]);

    return res.status(200).json({
      success: true,
      summary: {
        total: totalCount,
        booked: bookedCount,
        inTransit: inTransitCount,
        outForDelivery: outForDeliveryCount,
        delivered: deliveredCount,
        deliveryFailed: deliveryFailedCount,
        returned: returnedCount,
        cancelled: cancelledCount,
        totalRevenue: summaryMetrics.totalRevenue,
        avgCost: Math.round(summaryMetrics.avgCost || 0),
        totalWeight: Math.round((summaryMetrics.totalWeight || 0) * 10) / 10,
        avgWeight: Math.round((summaryMetrics.avgWeight || 0) * 10) / 10,
      },
      statusDistribution: statusReport.map((r) => ({
        status: r._id || 'Unknown',
        count: r.count,
        percentage: totalCount > 0 ? Math.round((r.count / totalCount) * 100) : 0,
        totalRevenue: r.totalRevenue,
        avgWeight: Math.round((r.avgWeight || 0) * 10) / 10,
      })),
      dateTrends: dateReport.map((d) => ({
        date: d._id,
        total: d.total,
        booked: d.booked,
        inTransit: d.inTransit,
        outForDelivery: d.outForDelivery,
        delivered: d.delivered,
        failed: d.failed,
        revenue: d.revenue,
      })),
      packageTypeDistribution: packageTypeReport.map((p) => ({
        type: p._id || 'Standard',
        count: p.count,
        revenue: p.totalRevenue,
      })),
      serviceTypeDistribution: serviceTypeReport.map((s) => ({
        service: s._id || 'Standard Delivery',
        count: s.count,
        revenue: s.totalRevenue,
      })),
    });
  } catch (error) {
    console.error('[Get Shipment Reports Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate shipment reports.',
    });
  }
};

module.exports = {
  createShipment,
  getAllShipments,
  getShipmentById,
  updateShipmentStatus,
  updateShipment,
  deleteShipment,
  getShipmentStats,
  getShipmentReports,
};
