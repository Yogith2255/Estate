const express = require('express');
const router = express.Router();
const {
  getAdminStats,
  getAgentStats,
} = require('../controllers/dashboardController');
const { authenticate } = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

router.get('/admin', authenticate, authorize('admin'), getAdminStats);
router.get('/agent', authenticate, authorize('agent', 'admin'), getAgentStats);

module.exports = router;
