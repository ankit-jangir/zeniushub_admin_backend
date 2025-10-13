'use strict';

const { z } = require('zod');

const departmentValidationSchema = z.object({
  name: z.string({ required_error: 'Department name is required.' }).min(1, 'Department name cannot be empty.'),
  access_control: z.array(z.number().int().positive(), {
    invalid_type_error: 'Access control must be an array of positive integers.',
  }).optional().nullable(),
});

module.exports = departmentValidationSchema;
