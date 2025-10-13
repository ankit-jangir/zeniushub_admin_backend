'use strict';

const { z } = require('zod');

const emiValidationSchema = z.object({
  student_id: z.number({ required_error: 'Student ID is required.' }).int().positive(),
  discount_percentage: z
    .number()
    .min(0, 'Discount cannot be negative')
    .max(100, 'Discount cannot exceed 100')
    .default(0),
  emi_frequency: z.number({ required_error: 'EMI frequency is required.'}).int().positive(),
});

module.exports = emiValidationSchema;
