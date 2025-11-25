// src/models/member.js
const pool = require("../config/database");

const Member = {
  async create({ name, email, phone, address }) {
    const res = await pool.query(
      `INSERT INTO members (name, email, phone, address)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, email, phone, address]
    );
    return res.rows[0];
  },

  async findByEmail(email) {
    const res = await pool.query("SELECT * FROM members WHERE email = $1", [
      email,
    ]);
    return res.rows[0];
  },

  async findById(id) {
    const res = await pool.query("SELECT * FROM members WHERE id = $1", [id]);
    return res.rows[0];
  },
};

module.exports = Member;
