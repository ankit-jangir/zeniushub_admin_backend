const { sequelize } = require("../models");
const { z } = require("zod");
const { ValidationError, UniqueConstraintError } = require("sequelize");
const customError = require("./error.handler");

const try_catch = (handler) => {
  return async (req, reply, next) => {
    const t = await sequelize.transaction(); // Transaction start

    try {
      // ✅ handler ko transaction ke sath call karo
      await handler(req, reply, next, t);

      // ✅ agar koi error nahi aaya to commit
      await t.commit();
    } catch (err) {
      console.log("Rolling back due to the following error:", err);

      // ✅ agar error aaya to rollback
      await t.rollback();

      // ✅ Zod Validation Error
      if (err instanceof z.ZodError) {
        const errors = err.errors.map((e) => ({
          message: e.message,
        }));

        return reply.status(400).send({
          success: false,
          message: "Validation error",
          error: errors,
        });
      }

      // ✅ Sequelize Validation or Unique Constraint Errors
      if (err instanceof ValidationError || err instanceof UniqueConstraintError) {
        const errors = err.errors.map((e) => ({
          message: e.message,
        }));

        return reply.status(400).send({
          success: false,
          message: "Database validation error",
          error: errors,
        });
      }

      // ✅ Custom error with statusCode
      if (err instanceof customError || (err.statusCode && err.message)) {
        return reply.status(err.statusCode || 400).send({
          success: false,
          message: "Custom error",
          error: [{ message: err.message }],
        });
      }

      // ✅ Unknown error
      return reply.status(500).send({
        success: false,
        message: "Internal Server Error",
        error: [{ message: err.message || "Unexpected error occurred" }],
      });
    }
  };
};

module.exports = { try_catch };
