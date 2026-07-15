const express = require("express");
const router = express.Router();
const db = require("../server");
const pool = db.promisePool || db;

// ==============================
// GET All Bookings
// ==============================
router.get("/", (req, res) => {

    const sql = "SELECT * FROM bookings ORDER BY booking_date DESC";

    pool.query(sql, (err, result) => {

        if (err) {
            return res.status(500).json({
                success: false,
                message: "Database Error"
            });
        }

        res.json(result);

    });

});

// ==============================
// Create Booking
// ==============================
router.post("/", (req, res) => {

    const {
        fullName,
        email,
        trainer,
        bookingDate,
        bookingTime
    } = req.body;

    // Validation
    if (
        !fullName ||
        !email ||
        !trainer ||
        !bookingDate ||
        !bookingTime
    ) {

        return res.status(400).json({
            success: false,
            message: "All fields are required."
        });

    }

    const sql = `
        INSERT INTO bookings
        (full_name,email,trainer,booking_date,booking_time)
        VALUES (?,?,?,?,?)
    `;

    pool.query(
        sql,
        [
            fullName,
            email,
            trainer,
            bookingDate,
            bookingTime
        ],
        (err, result) => {

            if (err) {
                console.error("Booking insert error:", err);
                return res.status(500).json({
                    success: false,
                    message: "Booking Failed"
                });
            }

            res.status(201).json({
                success: true,
                message: "Booking Successful!",
                bookingId: result.insertId
            });

        }
    );

});

// ==============================
// Delete Booking
// ==============================
router.delete("/:id", (req, res) => {

    const id = req.params.id;

    pool.query(
        "DELETE FROM bookings WHERE id=?",
        [id],
        (err) => {

            if (err) {

                return res.status(500).json({
                    success: false,
                    message: "Delete Failed"
                });

            }

            res.json({

                success: true,
                message: "Booking Deleted"

            });

        }
    );

});

module.exports = router;