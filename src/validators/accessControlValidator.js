'use strict';

const { z } = require('zod');

const accessControlValidationSchema = z.object({
  name: z.string({ required_error: 'Access Control name is required.' }).min(1, 'Name cannot be empty.'),
});

module.exports = accessControlValidationSchema;
