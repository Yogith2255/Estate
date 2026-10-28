const express = require('express');
const router = express.Router();
const {
  getPayments,
  recordPayment,
} = require('../controllers/paymentController');
const { authenticate } = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

router.get('/', authenticate, getPayments);
router.post('/', authenticate, authorize('admin', 'agent'), recordPayment);

module.exports = router;
