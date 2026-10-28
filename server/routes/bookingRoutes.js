const express = require('express');
const router = express.Router();
const {
  getBookings,
  createBooking,
  updateBooking,
} = require('../controllers/bookingController');
const { authenticate } = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

router.get('/', authenticate, getBookings);
router.post('/', authenticate, createBooking);
router.put('/:id', authenticate, authorize('admin', 'agent'), updateBooking);

module.exports = router;
