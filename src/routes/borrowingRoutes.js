// src/routes/borrowingRoutes.js
const express = require("express");
const router = express.Router();
const borrowingController = require("../controllers/borrowingController");

// POST /api/borrowings
router.post("/", borrowingController.createBorrowing);

// PUT /api/borrowings/:id/return
router.put("/:id/return", borrowingController.returnBorrowing);

module.exports = router;
