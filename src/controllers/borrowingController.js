// src/controllers/borrowingController.js
const borrowingService = require("../services/borrowingService");

exports.createBorrowing = async (req, res, next) => {
  try {
    const borrowing = await borrowingService.createBorrowing(req.body);
    res.status(201).json(borrowing);
  } catch (err) {
    next(err);
  }
};

exports.returnBorrowing = async (req, res, next) => {
  try {
    const { id } = req.params;
    const borrowing = await borrowingService.returnBorrowing(id);
    res.json(borrowing);
  } catch (err) {
    next(err);
  }
};
