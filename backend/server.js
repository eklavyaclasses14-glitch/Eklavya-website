require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/db');
const { logApiError } = require('./utils/logger');
const { globalLimiter } = require('./middleware/rateLimiters');
const { nosqlSanitize, xssSanitize } = require('./middleware/sanitize');

// Connect to MongoDB
connectDB();

const app = express();

// Configure Helmet with Strict Transport Security (HSTS)
app.use(helmet({
  hsts: {
    maxAge: 31536000, // 1 year in seconds
    includeSubDomains: true,
    preload: true,
  }
}));

// Force HTTPS redirection in production (reverse proxy friendly)
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production' && req.headers['x-forwarded-proto'] !== 'https') {
    return res.redirect(301, `https://${req.headers.host}${req.url}`);
  }
  next();
});

const PORT = process.env.PORT || 5000;

// CORS Configuration
const allowedOrigins = [
  'http://localhost:5173', // Vite local
  process.env.FRONTEND_URL, // Production URL
  'https://eklavya-website-nqbsg18iy-eklavya-engineering-classes.vercel.app',
  'https://eklavyaengineeringclasses.in',
  'https://www.eklavyaengineeringclasses.in'
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(nosqlSanitize);
app.use(xssSanitize);

// Routes
app.use('/api', globalLimiter);
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin/staff', require('./routes/adminStaff'));
app.use('/api/admin/students', require('./routes/adminStudents'));
app.use('/api/admin/subjects', require('./routes/adminSubjects'));
app.use('/api/admin/notes', require('./routes/adminNotes'));
app.use('/api/admin/attendance', require('./routes/adminAttendance'));
app.use('/api/admin/fees', require('./routes/adminFees'));
app.use('/api/admin', require('./routes/adminProfile'));
app.use('/api/student', require('./routes/student'));

// Global Error Handler (Shields stack traces, logs full details to Winston)
app.use((err, req, res, next) => {
  logApiError(req, err);

  const statusCode = err.status || err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'An unexpected error occurred on the server.'
    : err.message;

  res.status(statusCode).json({ error: message });
});

app.listen(PORT, () => console.log(`✅  Eklavya backend running on http://localhost:${PORT}`));
