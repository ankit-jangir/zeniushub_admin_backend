'use strict';
const { z } = require('zod');

const emiValidationSchemaOne = z.object({
  student_id: z.number({ required_error: 'Student ID is required.' }).int().positive(),
  discount_percentage: z
    .number()
    .min(0, 'discount_percentage must be ≥ 0')
    .max(100, 'discount_percentage must be ≤ 100')
    .default(0),
  emi_duedate: z
    .string({ required_error: 'EMI due date is required.' })
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'emi_duedate must be YYYY-MM-DD')
    .transform((val) => new Date(val)),
}).strict();

module.exports = emiValidationSchemaOne;
