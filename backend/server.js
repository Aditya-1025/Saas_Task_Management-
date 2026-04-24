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
  const allowedOrigin = process.env.CORS_ORIGIN || origin || '*';
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

// DB init — authenticate + safe sync (CREATE TABLE IF NOT EXISTS, never drops/alters)
const dbReady = sequelize
  .authenticate()
  .then(() => sequelize.sync({ force: false, alter: false }))
  .then(() => console.log('✅ Database ready'));

// Wait for DB before handling ANY request (fixes cold-start race condition on Vercel)
app.use(async (req, res, next) => {
  try {
    await dbReady;
    next();
  } catch (err) {
    console.error('❌ DB not ready:', err.message);
    res.status(503).json({ success: false, message: 'Database unavailable, try again shortly' });
  }
});

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

if (process.env.NODE_ENV !== 'production') {
  dbReady.then(() =>
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`))
  ).catch(err => {
    console.error('❌ Failed to start:', err.message);
    process.exit(1);
  });
}

// Vercel serverless: export the Express app directly
module.exports = app;
