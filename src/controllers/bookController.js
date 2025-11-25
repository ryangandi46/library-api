// src/controllers/bookController.js
const bookService = require("../services/bookService");

exports.getBooks = async (req, res, next) => {
  try {
    const { title, author, page, limit } = req.query;
    const result = await bookService.listBooks({ title, author, page, limit });
    res.json(result);
  } catch (err) {
    next(err);
  }
};
