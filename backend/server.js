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

// Core middleware
app.use(cors({ origin: process.env.CORS_ORIGIN || '*', credentials: true }));
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
