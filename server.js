// server.js
// Inclusive Fitness Platform - main server entry point

require('dotenv').config();

const path = require('path');
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
const PORT = process.env.PORT 

// ---------- Middleware ----------
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static assets (css/js/images) from /public
app.use(express.static(path.join(__dirname, 'public')));

// Serve any static html views from /views (adjust if you add a view engine like EJS)
app.use(express.static(path.join(__dirname, 'views')));

// ---------- Database connection pool ----------
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'inclusive_fitness',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Make the pool available to route files via req.app.get('db')
app.set('db', pool);

// Quick DB health check on startup (non-fatal if it fails)
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Connected to MySQL database');
    connection.release();
  } catch (err) {
    console.error('⚠️  Could not connect to MySQL:', err.message);
  }
})();

// ---------- Routes ----------
// Home route - serves the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Simple health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Inclusive Fitness Platform API is running' });
});

// Mount route modules from /routes
// Add files like routes/users.js, routes/workouts.js and uncomment/adjust below:
// app.use('/api/users', require('./routes/users'));
// app.use('/api/workouts', require('./routes/workouts'));
// app.use('/api/auth', require('./routes/auth'));

// ---------- 404 handler ----------
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// ---------- Error handler ----------
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong on the server' });
});

// ---------- Start server ----------
app.listen(PORT || 3000, () => {
  console.log(`Server running at http://localhost:${PORT || 3000}`);
});