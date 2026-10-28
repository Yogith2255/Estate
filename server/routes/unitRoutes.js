const express = require('express');
const router = express.Router();
const {
  getInventory,
  addUnit,
  updateUnit,
  createUnitType,
} = require('../controllers/unitController');
const { authenticate } = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

router.get('/', getInventory);
router.post('/', authenticate, authorize('admin', 'agent'), addUnit);
router.put('/:id', authenticate, authorize('admin', 'agent'), updateUnit);
router.post('/unit-types', authenticate, authorize('admin', 'agent'), createUnitType);

module.exports = router;
