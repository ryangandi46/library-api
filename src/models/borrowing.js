// src/models/borrowing.js
const pool = require("../config/database");

const Borrowing = {
  async countActiveByMember(memberId) {
    const res = await pool.query(
      `SELECT COUNT(*) AS total
       FROM borrowings
       WHERE member_id = $1 AND status = 'BORROWED'`,
      [memberId]
    );
    return parseInt(res.rows[0].total, 10);
  },

  async findById(id) {
    const res = await pool.query("SELECT * FROM borrowings WHERE id = $1", [
      id,
    ]);
    return res.rows[0];
  },

  async getByMemberWithBooks({ memberId, status, limit, offset }) {
    const values = [memberId];
    let where = ["b.member_id = $1"];

    if (status) {
      values.push(status);
      where.push(`b.status = $${values.length}`);
    }

    const whereClause = `WHERE ${where.join(" AND ")}`;

    const countQuery = `SELECT COUNT(*) AS total FROM borrowings b ${whereClause}`;
    const countResult = await pool.query(countQuery, values);
    const total = parseInt(countResult.rows[0].total, 10);

    values.push(limit);
    values.push(offset);

    const dataQuery = `
      SELECT
        b.*,
        bk.title AS book_title,
        bk.author AS book_author,
        bk.isbn AS book_isbn
      FROM borrowings b
      JOIN books bk ON bk.id = b.book_id
      ${whereClause}
      ORDER BY b.borrow_date DESC
      LIMIT $${values.length - 1} OFFSET $${values.length}
    `;
    const dataResult = await pool.query(dataQuery, values);

    return { total, rows: dataResult.rows };
  },
};

module.exports = Borrowing;
