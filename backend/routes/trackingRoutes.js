const express = require('express');
const router = express.Router();
const {
  trackParcelByNumber,
  addTrackingEvent,
} = require('../controllers/trackingController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Public tracking endpoint - no login required!
router.get('/:trackingNumber', trackParcelByNumber);

// Admin manual checkpoint creation
router.post('/:trackingNumber/checkpoint', protect, adminOnly, addTrackingEvent);

module.exports = router;
