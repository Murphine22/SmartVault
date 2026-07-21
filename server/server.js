const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const cookieParser = require('cookie-parser');
const { initializeServer } = require('./utils/bootstrap');

// Load environment variables
dotenv.config();

// Connect to MongoDB and seed a demo account for quick access
initializeServer().catch((error) => {
  console.warn('Unable to initialize server bootstrap:', error.message);
});

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));

// Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use(limiter);

// Prevent NoSQL injection (skip req.query — read-only in Express 5)
app.use((req, res, next) => {
  ['body', 'params'].forEach((key) => {
    if (req[key]) req[key] = mongoSanitize.sanitize(req[key]);
  });
  next();
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/documents', require('./routes/documentRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));

// Root endpoint
app.get('/', (req, res) => {
  res.send('SmartVault API is running...');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Server Error'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
