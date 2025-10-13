const { z } = require('zod');

const paymentReceiptSchema = z.object({
    id: z.number().int().positive(),
    student_id: z
        .number({
            required_error: 'student_id is required',
            invalid_type_error: 'student_id must be a number',
        })
        .int('student_id must be an integer')
        .positive('student_id must be a positive number'),

    receipt_url: z
        .string({
            required_error: 'receipt_url is required',
            invalid_type_error: 'receipt_url must be a string',
        }),

    serial_no: z
        .string({
            required_error: 'serial_no is required',
            invalid_type_error: 'serial_no must be a string',
        })
        .min(1, 'serial_no cannot be empty')
});


module.exports = {
    paymentReceiptSchema
};
