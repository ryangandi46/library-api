// src/controllers/memberController.js
const memberService = require("../services/memberService");
const borrowingService = require("../services/borrowingService");

exports.createMember = async (req, res, next) => {
  try {
    const member = await memberService.createMember(req.body);
    res.status(201).json(member);
  } catch (err) {
    next(err);
  }
};

exports.getMemberBorrowings = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, page, limit } = req.query;
    const result = await borrowingService.getMemberBorrowings({
      memberId: id,
      status,
      page,
      limit,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
};
