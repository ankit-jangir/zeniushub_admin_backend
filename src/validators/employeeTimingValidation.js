const Joi = require("joi");

const employeeTimingSchema = Joi.object({
  start_time: Joi.string()
    .pattern(/^([0-1]?[0-9]|2[0-3]):([0-5]?[0-9])$/)
    .allow(null)
    .messages({
      "string.base": `"startTime" should be a string`,
      "string.pattern.base": `"startTime" should be in HH:MM format`,
    }),
    end_time: Joi.string()
    .pattern(/^([0-1]?[0-9]|2[0-3]):([0-5]?[0-9])$/)
    .allow(null)
    .messages({
      "string.base": `"endTime" should be a string`,
      "string.pattern.base": `"endTime" should be in HH:MM format`,
    }),
})
  .and("start_time", "end_time") // Ensure at least one of the two fields is required
  .strict();

module.exports = { employeeTimingSchema };
