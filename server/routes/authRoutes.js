const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  logout,
  setupAdmin,
} = require('../controllers/authController');
const { authenticate } = require('../middleware/authenticate');

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticate, getMe);
router.post('/logout', logout);
router.post('/setup-admin', setupAdmin);

module.exports = router;
