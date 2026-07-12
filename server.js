// server.js
require("dotenv").config();

const path = require("path");
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");

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

// Make DB available in routes
app.set("db", pool);

// Check database connection
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log("✅ Connected to MySQL database");
    connection.release();
  } catch (err) {
    console.error("❌ Could not connect to MySQL:", err.message);
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
    const [rows] = await pool.query("SELECT * FROM trainers");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Database query failed",
    });
  }
});

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

const bookingRoutes = require("./routes/booking");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/booking", bookingRoutes);

const trainerRoutes = require("./routes/trainers");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/trainers", trainerRoutes);