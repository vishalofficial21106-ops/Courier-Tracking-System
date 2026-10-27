const express = require('express');
const router = express.Router();
const {
  createShipment,
  getAllShipments,
  getShipmentById,
  updateShipmentStatus,
  updateShipment,
  deleteShipment,
  getShipmentStats,
  getShipmentReports,
} = require('../controllers/shipmentController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Dashboard statistics
router.get('/stats/summary', protect, getShipmentStats);

// Detailed analytics & reports grouped by status and date (Admin only)
router.get('/reports/analytics', protect, adminOnly, getShipmentReports);

// Consignment collection routes:
// POST: Admin creates new consignment & auto-generates tracking number
// GET: Admin views all; Customers view only their own shipments
router
  .route('/')
  .post(protect, adminOnly, createShipment)
  .get(protect, getAllShipments);

// Individual consignment routes:
// GET: View full shipment details (Admin or Authorized Owner)
// PUT: Admin updates details
// DELETE: Admin removes consignment and history
router
  .route('/:id')
  .get(protect, getShipmentById)
  .put(protect, adminOnly, updateShipment)
  .delete(protect, adminOnly, deleteShipment);

// Admin status advance & checkpoint logging
router.put('/:id/status', protect, adminOnly, updateShipmentStatus);

module.exports = router;
