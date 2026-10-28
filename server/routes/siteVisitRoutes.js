const express = require('express');
const router = express.Router();
const {
  getSiteVisits,
  createSiteVisit,
  updateSiteVisit,
} = require('../controllers/siteVisitController');
const { authenticate, optionalAuthenticate } = require('../middleware/authenticate');

router.get('/', authenticate, getSiteVisits);
router.post('/', optionalAuthenticate, createSiteVisit);
router.put('/:id', authenticate, updateSiteVisit);

module.exports = router;
