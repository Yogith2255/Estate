const express = require('express');
const router = express.Router();
const {
  getLeads,
  getLeadById,
  createEnquiry,
  createLead,
  updateLead,
} = require('../controllers/leadController');
const { authenticate, optionalAuthenticate } = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

// Customer or public enquiry submission
router.post('/enquiry', optionalAuthenticate, createEnquiry);

// Leads operations
router.get('/', authenticate, getLeads);
router.get('/:id', authenticate, getLeadById);
router.post('/', authenticate, authorize('admin', 'agent'), createLead);
router.put('/:id', authenticate, authorize('admin', 'agent'), updateLead);

module.exports = router;
