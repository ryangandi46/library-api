// src/services/borrowingService.js
const pool = require("../config/database");
const Book = require("../models/book");
const Member = require("../models/member");
const Borrowing = require("../models/borrowing");

const borrowingService = {
  // POST /api/borrowings
  async createBorrowing({ book_id, member_id }) {
    if (!book_id || !member_id) {
      const err = new Error("book_id and member_id are required");
      err.statusCode = 400;
      throw err;
    }

    const book = await Book.findById(book_id);
    if (!book) {
      const err = new Error("Book not found");
      err.statusCode = 404;
      throw err;
    }
    if (book.stock <= 0) {
      const err = new Error("Book out of stock");
      err.statusCode = 400;
      throw err;
    }

    const member = await Member.findById(member_id);
    if (!member) {
      const err = new Error("Member not found");
      err.statusCode = 404;
      throw err;
    }

    const activeCount = await Borrowing.countActiveByMember(member_id);
    if (activeCount >= 3) {
      const err = new Error("Member already has 3 active borrowings");
      err.statusCode = 400;
      throw err;
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // Decrease stock
      const updatedBook = await client.query(
        `UPDATE books
         SET stock = stock - 1, updated_at = NOW()
         WHERE id = $1 AND stock > 0
         RETURNING *`,
        [book_id]
      );
      if (updatedBook.rows.length === 0) {
        throw new Error("Failed to decrease book stock");
      }

      const borrowingResult = await client.query(
        `INSERT INTO borrowings (book_id, member_id, borrow_date, status)
         VALUES ($1, $2, CURRENT_DATE, 'BORROWED')
         RETURNING *`,
        [book_id, member_id]
      );

      await client.query("COMMIT");
      return borrowingResult.rows[0];
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  },

  // PUT /api/borrowings/:id/return
  async returnBorrowing(borrowingId, memberIdFromPathOrNull = null) {
    const borrowing = await Borrowing.findById(borrowingId);
    if (!borrowing) {
      const err = new Error("Borrowing not found");
      err.statusCode = 404;
      throw err;
    }

    // optional: verify borrowing belongs to member (kalau mau pakai)
    if (
      memberIdFromPathOrNull &&
      borrowing.member_id !== memberIdFromPathOrNull
    ) {
      const err = new Error("Borrowing does not belong to this member");
      err.statusCode = 403;
      throw err;
    }

    if (borrowing.status === "RETURNED") {
      const err = new Error("Borrowing already returned");
      err.statusCode = 400;
      throw err;
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // Increase stock
      await client.query(
        `UPDATE books
         SET stock = stock + 1, updated_at = NOW()
         WHERE id = $1`,
        [borrowing.book_id]
      );

      const result = await client.query(
        `UPDATE borrowings
         SET status = 'RETURNED',
             return_date = CURRENT_DATE,
             updated_at = NOW()
         WHERE id = $1
         RETURNING *`,
        [borrowingId]
      );

      await client.query("COMMIT");
      return result.rows[0];
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  },

  // GET /api/members/:id/borrowings
  async getMemberBorrowings({ memberId, status, page = 1, limit = 10 }) {
    page = parseInt(page, 10) || 1;
    limit = parseInt(limit, 10) || 10;
    const offset = (page - 1) * limit;

    const member = await Member.findById(memberId);
    if (!member) {
      const err = new Error("Member not found");
      err.statusCode = 404;
      throw err;
    }

    const { total, rows } = await Borrowing.getByMemberWithBooks({
      memberId,
      status,
      limit,
      offset,
    });

    const data = rows.map((b) => ({
      id: b.id,
      book_id: b.book_id,
      member_id: b.member_id,
      borrow_date: b.borrow_date,
      return_date: b.return_date,
      status: b.status,
      book: {
        title: b.book_title,
        author: b.book_author,
        isbn: b.book_isbn,
      },
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

module.exports = borrowingService;
