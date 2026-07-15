// server.js
require("dotenv").config();

const path = require("path");
const crypto = require("crypto");
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

const hashPassword = (password) =>
  crypto.createHash("sha256").update(password).digest("hex");

module.exports = pool;
module.exports.app = app;
module.exports.promisePool = promisePool;

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

// Authentication Routes
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { name, email, password, preference } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: "Name, email, and password are required." });
    }

    if (password.length < 8 || !/\d/.test(password)) {
      return res.status(400).json({ success: false, error: "Password must be at least 8 characters long and include a number." });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const [existingUsers] = await promisePool.query("SELECT id FROM users WHERE email = ?", [normalizedEmail]);

    if (existingUsers.length > 0) {
      return res.status(409).json({ success: false, error: "An account with that email already exists." });
    }

    const [result] = await promisePool.query(
      "INSERT INTO users (name, email, password_hash, preference) VALUES (?, ?, ?, ?)",
      [name.trim(), normalizedEmail, hashPassword(password), preference || null]
    );

    res.status(201).json({
      success: true,
      message: "Account created successfully.",
      user: {
        id: result.insertId,
        name: name.trim(),
        email: normalizedEmail,
        preference: preference || null,
      },
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ success: false, error: "Could not create account." });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ success: false, error: "Email and password are required." });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const [rows] = await promisePool.query(
      "SELECT id, name, email, password_hash, preference FROM users WHERE email = ?",
      [normalizedEmail]
    );

    if (rows.length === 0) {
      return res.status(401).json({ success: false, error: "Invalid email or password." });
    }

    const user = rows[0];

    if (hashPassword(password) !== user.password_hash) {
      return res.status(401).json({ success: false, error: "Invalid email or password." });
    }

    res.json({
      success: true,
      message: "Login successful.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        preference: user.preference,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, error: "Could not log in." });
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
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  });
}