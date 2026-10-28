const express = require('express');
const router = express.Router();
const {
  getProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
} = require('../controllers/propertyController');
const { authenticate } = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

router.get('/', getProperties);
router.get('/:id', getPropertyById);
router.post('/', authenticate, authorize('admin', 'agent'), createProperty);
router.put('/:id', authenticate, authorize('admin', 'agent'), updateProperty);
router.delete('/:id', authenticate, authorize('admin'), deleteProperty);

module.exports = router;
