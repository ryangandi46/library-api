// src/services/memberService.js
const Joi = require("joi");
const Member = require("../models/member");

const memberSchema = Joi.object({
  name: Joi.string().min(3).required(),
  email: Joi.string().email().required(),
  phone: Joi.string()
    .pattern(/^[0-9+]{8,15}$/)
    .required(),
  address: Joi.string().min(5).required(),
});

const memberService = {
  async createMember(payload) {
    const { error, value } = memberSchema.validate(payload);
    if (error) {
      const err = new Error(error.details[0].message);
      err.statusCode = 400;
      throw err;
    }

    const existing = await Member.findByEmail(value.email);
    if (existing) {
      const err = new Error("Email already registered");
      err.statusCode = 409;
      throw err;
    }

    const member = await Member.create(value);
    return member;
  },

  async getMemberOrFail(id) {
    const member = await Member.findById(id);
    if (!member) {
      const err = new Error("Member not found");
      err.statusCode = 404;
      throw err;
    }
    return member;
  },
};

module.exports = memberService;
