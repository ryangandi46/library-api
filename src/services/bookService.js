// src/services/bookService.js
const Book = require("../models/book");

const bookService = {
  async listBooks({ title, author, page = 1, limit = 10 }) {
    page = parseInt(page, 10) || 1;
    limit = parseInt(limit, 10) || 10;
    const offset = (page - 1) * limit;

    const { total, rows } = await Book.findAll({
      title,
      author,
      limit,
      offset,
    });

    const data = rows.map((b) => ({
      id: b.id,
      title: b.title,
      author: b.author,
      published_year: b.published_year,
      stock: b.stock,
      isbn: b.isbn,
      available: b.stock > 0,
    }));

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },
};

module.exports = bookService;
