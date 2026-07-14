// server.js
require("dotenv").config();

const path = require("path");
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");

const app = express();
const PORT = process.env.PORT || 3000;

// ---------------- Middleware ----------------
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "views")));

// ---------------- MySQL Connection Pool ----------------
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const promisePool = pool.promise();

// Make DB available in routes
app.set("db", pool);

module.exports = pool;

// Check database connection & initialize tables
const fs = require("fs");
(async () => {
  try {
    const connection = await promisePool.getConnection();
    console.log("✅ Connected to MySQL database");
    
    // Read SQL file and initialize tables
    const sqlPath = path.join(__dirname, "database", "fitness.sql");
    if (fs.existsSync(sqlPath)) {
      const sqlFile = fs.readFileSync(sqlPath, "utf8");
      const queries = sqlFile.split(";").map(q => q.trim()).filter(q => q.length > 0);
      for (const query of queries) {
        await connection.query(query);
      }
      console.log("✅ Database tables checked/created successfully");
    }

    // Seed default trainers if none exist
    const [rows] = await connection.query("SELECT COUNT(*) as count FROM trainers");
    if (rows[0].count === 0) {
      console.log("🌱 Seeding default trainers into database...");
      await connection.query(`
        INSERT INTO trainers (name, specialization, experience, email, phone) VALUES
        ('Sarah', 'Adaptive Yoga', 5, 'sarah@empowerfit.com', '123-456-7890'),
        ('Alex', 'Strength HIIT', 8, 'alex@empowerfit.com', '234-567-8901'),
        ('Cosmic Fitness', 'Mobility Movement', 6, 'cosmic@empowerfit.com', '345-678-9012')
      `);
      console.log("✅ Seeding complete");
    }

    connection.release();
  } catch (err) {
    console.error("❌ Could not connect or initialize database:", err.message);
  }
})();

// ---------------- Routes ----------------

// Home page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "success",
    message: "Inclusive Fitness Platform API is running",
  });
});

// Example route
app.get("/api/trainers", async (req, res) => {
  try {
    const [rows] = await promisePool.query("SELECT * FROM trainers");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Database query failed",
    });
  }
});

// Booking and Trainer Routes
const bookingRoutes = require("./routes/booking");
app.use("/booking", bookingRoutes);

const trainerRoutes = require("./routes/trainers");
app.use("/trainers", trainerRoutes);

// ---------------- 404 ----------------
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
  });
});

// ---------------- Error Handler ----------------
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Internal Server Error",
  });
});

// ---------------- Start Server ----------------
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});