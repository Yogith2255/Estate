require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('node:dns');

dns.setServers(['8.8.8.8', '1.1.1.1']);
const connectDB = require('./config/database');
const apiRoutes = require('./routes/index');
const errorHandler = require('./middleware/errorHandler');
const organisationRoutes = require('./routes/organisationRoutes');

const app = express();

// Allowed origins
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
const allowedOrigins = [
  clientUrl,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
];

// CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or server-to-server)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Dev-friendly fallback
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-access-token'],
  })
);

// Payload size limit
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/api/organisations', organisationRoutes);

// Root welcome route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'EstateHub Real Estate Enterprise API is operational.',
    version: '1.0.0',
    documentation: '/api/health',
  });
});

// API Routes
app.use('/api', apiRoutes);

// 404 Catch-All
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint '${req.originalUrl}' not found.`,
  });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Start Server if run directly
if (require.main === module) {
  connectDB()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`[EstateHub] Server successfully listening at http://localhost:${PORT}`);
        console.log(`[EstateHub] Connected to frontend at: ${clientUrl}`);
      });
    })
    .catch((err) => {
      console.error('[EstateHub] Failed to start server due to database connection error:', err.message);
      process.exit(1);
    });
}


module.exports = app;