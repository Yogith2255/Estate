const express = require('express');
const router = express.Router();
const {
  getFavorites,
  addFavorite,
  removeFavorite,
  checkFavorite,
} = require('../controllers/favoriteController');
const { authenticate } = require('../middleware/authenticate');

router.get('/', authenticate, getFavorites);
router.post('/', authenticate, addFavorite);
router.delete('/:id', authenticate, removeFavorite);
router.get('/check/:propertyId', authenticate, checkFavorite);

module.exports = router;
