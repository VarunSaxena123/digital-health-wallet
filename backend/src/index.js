const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const reportRoutes = require('./routes/reportRoutes');
const vitalsRoutes = require('./routes/vitalsRoutes');
const shareRoutes = require('./routes/shareRoutes');
const { errorHandler } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3001; // Use from .env or default to 3001

// ====================
// CORS Configuration
// ====================
const corsOptions = {
  origin: 'http://localhost:3000', // Frontend URL
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  exposedHeaders: ['Content-Disposition'] // For file downloads
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// ====================
// Middleware
// ====================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware (for debugging)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

// Serve uploaded files as static
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ====================
// Routes
// ====================
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/vitals', vitalsRoutes);
app.use('/api/shares', shareRoutes);

// ====================
// Health & Info Endpoints
// ====================
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Digital Health Wallet API is running',
    timestamp: new Date().toISOString(),
    port: PORT,
    environment: process.env.NODE_ENV
  });
});

app.get('/api/info', (req, res) => {
  res.json({
    name: 'Digital Health Wallet API',
    version: '1.0.0',
    status: 'running'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Digital Health Wallet API',
    endpoints: {
      health: '/api/health',
      info: '/api/info',
      auth: '/api/auth',
      reports: '/api/reports',
      vitals: '/api/vitals',
      shares: '/api/shares'
    },
    documentation: 'See API documentation for usage'
  });
});

// ====================
// Error Handling
// ====================
// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    path: req.path,
    method: req.method
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(statusCode).json({
    error: message,
    status: statusCode,
    timestamp: new Date().toISOString()
  });
});

// ====================
// Process Error Handlers
// ====================
// Catch uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  console.error('Stack:', err.stack);
});

// Catch unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// ====================
// Start Server
// ====================
const server = app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log(`✅ Digital Health Wallet API`);
  console.log(`✅ Running on port: ${PORT}`);
  console.log(`✅ Environment: ${process.env.NODE_ENV}`);
  console.log('');
  console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`📡 API Info: http://localhost:${PORT}/api/info`);
  console.log(`🌐 Frontend: http://localhost:3000`);
  console.log('='.repeat(50));
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

module.exports = app;