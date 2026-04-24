const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const sequelize = require('./config/database');
require('./models'); // load models & associations
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const app = express();

// CORS — raw headers, most reliable approach for Vercel serverless
app.use((req, res, next) => {
  const origin = req.headers.origin;
  // Use specific origin from env, or reflect the request origin (works with credentials)
  const allowedOrigin = process.env.CORS_ORIGIN || origin || '*';
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  // Respond immediately to OPTIONS preflight
  if (req.method === 'OPTIONS') return res.status(200).end();
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

// Routes
app.get('/api/health', (req, res) =>
  res.json({ success: true, message: 'TaskFlow API is running', timestamp: new Date() })
);
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// 404 & error handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Initialise DB: authenticate + sync (create tables if not exist)
const dbReady = sequelize
  .authenticate()
  .then(() => sequelize.sync()) // safe: only creates missing tables, never drops
  .then(() => console.log('✅ Database ready'))
  .catch((err) => console.error('❌ DB init error:', err.message));

if (process.env.NODE_ENV !== 'production') {
  // Local dev: wait for DB then start the HTTP server
  dbReady.then(() =>
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`))
  );
}

// Vercel serverless: export the Express app directly
module.exports = app;
