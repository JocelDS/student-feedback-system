require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

// Fail fast with a clear message if configuration is missing
const REQUIRED_ENV = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'ADMIN_USERNAME',
  'ADMIN_PASSWORD_HASH',
  'JWT_SECRET',
  'CLIENT_ORIGIN'
];
const missing = REQUIRED_ENV.filter((k) => !process.env[k]);
if (missing.length) {
  console.error(`Missing environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

const authRoutes = require('./routes/auth');
const feedbackRoutes = require('./routes/feedback');

const app = express();
const PORT = process.env.PORT || 5000;

// Render sits behind a proxy; this lets rate limiting see the real client IP
app.set('trust proxy', 1);

const allowedOrigins = process.env.CLIENT_ORIGIN.split(',').map((o) => o.trim().replace(/\/$/, ''));

app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      // No origin = Postman / curl / server-to-server, which is fine
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error('Origin not allowed by CORS'));
    }
  })
);
app.use(express.json({ limit: '10kb' }));

app.get('/', (req, res) => {
  res.status(200).json({ name: 'Student Feedback System API', status: 'running' });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/feedback', feedbackRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Central error handler
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON payload' });
  }
  if (err.message === 'Origin not allowed by CORS') {
    return res.status(403).json({ error: err.message });
  }
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => console.log(`API running on port ${PORT}`));
