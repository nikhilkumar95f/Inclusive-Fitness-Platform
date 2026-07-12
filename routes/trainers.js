const express = require("express");
const router = express.Router();
const db = require("../server"); // Export MySQL connection from server.js

// ====================================
// GET All Trainers
// ====================================
router.get("/", (req, res) => {

    const sql = "SELECT * FROM trainers ORDER BY id ASC";

    db.query(sql, (err, result) => {

        if (err) {
            return res.status(500).json({
                success: false,
                message: "Database Error"
            });
        }

        res.status(200).json({
            success: true,
            trainers: result
        });

    });

});

// ====================================
// GET Single Trainer
// ====================================
router.get("/:id", (req, res) => {

    const id = req.params.id;

    db.query(
        "SELECT * FROM trainers WHERE id = ?",
        [id],
        (err, result) => {

            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Database Error"
                });
            }

            if (result.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Trainer Not Found"
                });
            }

            res.json({
                success: true,
                trainer: result[0]
            });

        }
    );

});

// ====================================
// ADD Trainer
// ====================================
router.post("/", (req, res) => {

    const {
        name,
        specialization,
        experience,
        email,
        phone
    } = req.body;

    if (
        !name ||
        !specialization ||
        !experience ||
        !email ||
        !phone
    ) {
        return res.status(400).json({
            success: false,
            message: "Please fill all fields."
        });
    }

    const sql = `
        INSERT INTO trainers
        (name, specialization, experience, email, phone)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [name, specialization, experience, email, phone],
        (err, result) => {

            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Unable to Add Trainer"
                });
            }

            res.status(201).json({
                success: true,
                message: "Trainer Added Successfully",
                trainerId: result.insertId
            });

        }
    );

});

// ====================================
// UPDATE Trainer
// ====================================
router.put("/:id", (req, res) => {

    const id = req.params.id;

    const {
        name,
        specialization,
        experience,
        email,
        phone
    } = req.body;

    const sql = `
        UPDATE trainers
        SET
        name=?,
        specialization=?,
        experience=?,
        email=?,
        phone=?
        WHERE id=?
    `;

    db.query(
        sql,
        [
            name,
            specialization,
            experience,
            email,
            phone,
            id
        ],
        (err) => {

            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Update Failed"
                });
            }

            res.json({
                success: true,
                message: "Trainer Updated Successfully"
            });

        }
    );

});

// ====================================
// DELETE Trainer
// ====================================
router.delete("/:id", (req, res) => {

    const id = req.params.id;

    db.query(
        "DELETE FROM trainers WHERE id=?",
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
                message: "Trainer Deleted Successfully"
            });

        }
    );

});

module.exports = router;