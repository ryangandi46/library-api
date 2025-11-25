// src/models/book.js
const pool = require("../config/database");

const Book = {
  async findAll({ title, author, limit, offset }) {
    const values = [];
    let where = [];
    if (title) {
      values.push(`%${title.toLowerCase()}%`);
      where.push(`LOWER(title) LIKE $${values.length}`);
    }
    if (author) {
      values.push(`%${author.toLowerCase()}%`);
      where.push(`LOWER(author) LIKE $${values.length}`);
    }

    let whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";

    // pagination
    const countQuery = `SELECT COUNT(*) AS total FROM books ${whereClause}`;
    const countResult = await pool.query(countQuery, values);
    const total = parseInt(countResult.rows[0].total, 10);

    values.push(limit);
    values.push(offset);
    const dataQuery = `
      SELECT id, title, author, published_year, stock, isbn
      FROM books
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${values.length - 1} OFFSET $${values.length}
    `;
    const dataResult = await pool.query(dataQuery, values);

    return { total, rows: dataResult.rows };
  },

  async findById(id) {
    const res = await pool.query("SELECT * FROM books WHERE id = $1", [id]);
    return res.rows[0];
  },

  async decreaseStock(id) {
    const res = await pool.query(
      "UPDATE books SET stock = stock - 1, updated_at = NOW() WHERE id = $1 AND stock > 0 RETURNING *",
      [id]
    );
    return res.rows[0];
  },

  async increaseStock(id) {
    const res = await pool.query(
      "UPDATE books SET stock = stock + 1, updated_at = NOW() WHERE id = $1 RETURNING *",
      [id]
    );
    return res.rows[0];
  },
};

module.exports = Book;
