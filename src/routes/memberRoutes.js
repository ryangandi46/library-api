// src/routes/memberRoutes.js
const express = require("express");
const router = express.Router();
const memberController = require("../controllers/memberController");

// POST /api/members
router.post("/", memberController.createMember);

// GET /api/members/:id/borrowings
router.get("/:id/borrowings", memberController.getMemberBorrowings);

module.exports = router;
