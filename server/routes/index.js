const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

const authRoutes = require('./authRoutes');
const projectRoutes = require('./projectRoutes');
const propertyRoutes = require('./propertyRoutes');
const unitRoutes = require('./unitRoutes');
const favoriteRoutes = require('./favoriteRoutes');
const leadRoutes = require('./leadRoutes');
const siteVisitRoutes = require('./siteVisitRoutes');
const bookingRoutes = require('./bookingRoutes');
const paymentRoutes = require('./paymentRoutes');
const userRoutes = require('./userRoutes');
const dashboardRoutes = require('./dashboardRoutes');

// API Health Check
router.get('/health', (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'EstateHub API service is online and healthy.',
    data: {
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
    },
  });
});

// Database Health Check
router.get('/health/db', async (req, res) => {
  try {
    const state = mongoose.connection.readyState;
    // 0: disconnected, 1: connected, 2: connecting, 3: disconnecting
    const stateLabels = ['disconnected', 'connected', 'connecting', 'disconnecting'];
    const isConnected = state === 1;

    return res.status(isConnected ? 200 : 503).json({
      success: isConnected,
      message: isConnected ? 'Database connection active.' : 'Database unavailable or disconnected.',
      data: {
        status: stateLabels[state] || 'unknown',
        databaseName: mongoose.connection.name || 'estatehub',
        host: mongoose.connection.host || 'remote-cluster',
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to inspect database health.',
    });
  }
});

// Mount Resource Routes
router.use('/auth', authRoutes);
router.use('/projects', projectRoutes);
router.use('/properties', propertyRoutes);
router.use('/inventory', unitRoutes);
router.use('/favorites', favoriteRoutes);
router.use('/leads', leadRoutes);
router.use('/site-visits', siteVisitRoutes);
router.use('/bookings', bookingRoutes);
router.use('/payments', paymentRoutes);
router.use('/users', userRoutes);
router.use('/dashboard', dashboardRoutes);

module.exports = router;
