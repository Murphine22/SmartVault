const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const { seedDemoUser } = require('./utils/demoUserSeed');

// Load environment variables
dotenv.config();

const app = express();

const startServer = async () => {
  const connected = await connectDB();
  if (!connected) {
    throw new Error('MongoDB connection failed. Server will not start without database access.');
  }

  await seedDemoUser();

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });

  module.exports.server = server;
};

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
    process.env.APP_URL,
  ].filter(Boolean);

  if (!origin) return true;
  if (allowedOrigins.includes(origin)) return true;

  return /^(https?:\/\/)(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin)
    || /^https:\/\/[-a-z0-9]+\.vercel\.app$/i.test(origin)
    || /^https:\/\/[-a-z0-9]+\.github\.dev$/i.test(origin);
};

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  crossOriginEmbedderPolicy: false,
}));

const corsOptions = {
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error('Not allowed by CORS'), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && isAllowedOrigin(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With');
    res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
  }
  next();
});

app.use(cors(corsOptions));
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

module.exports = { app, server: null };

startServer().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
