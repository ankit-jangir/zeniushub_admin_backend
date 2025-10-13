const { z } = require('zod');

const employeeProfileSchema = z.object({
  subjectId: z
    .number({
      required_error: "subjectId is required",
      invalid_type_error: "subjectId must be a number",
    })
    .int()
    .positive(),

  employeeId: z
    .number({
      required_error: "employeeId is required",
      invalid_type_error: "employeeId must be a number",
    })
    .int()
    .positive(),
});

module.exports = { employeeProfileSchema };
