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

const isAllowedOrigin = (origin) => {
  const allowedOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'https://smartvault-gkgv.onrender.com',
    'https://smartvault.vercel.app',
    process.env.CLIENT_URL,
    process.env.FRONTEND_URL,
    process.env.VITE_URL,
    process.env.APP_URL,
  ].filter(Boolean);

  if (!origin) return true;

  if (allowedOrigins.includes(origin)) return true;

  return /^https:\/\/.*\.vercel\.app$/i.test(origin);
};

// Middleware
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) {
      callback(null, true);
      return;
    }

    callback(null, false);
  },
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

app.get('/health', (req, res) => {
  res.status(200).json({ success: true, status: 'ok' });
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

const PORT = Number(process.env.PORT || 5000);

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

module.exports = { app, server };
