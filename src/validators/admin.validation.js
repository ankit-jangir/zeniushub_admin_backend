'use strict';

const { z } = require('zod');

const nameRegex = /^[a-zA-Z\s_-]{1,40}$/;

const adminValidationSchema = z.object({
    id: z.number().int().positive(),
    full_name: z
        .string()
        .min(1, 'Full name is required.')
        .max(40, 'Full name must be at most 40 characters.')
        .regex(nameRegex, 'Only alphabets, space, underscore, and hyphen are allowed. Digits are not allowed.'),
    email: z
        .string()
        .max(40, 'Email must not exceed 40 characters.').
        email("Invalid format"),


    email_verified_at: z
        .string()
        .regex(
            /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/,
            'Invalid date format. Use YYYY-MM-DD HH:MM'
        )
        .nullable()
        .optional(),
    password: z.string({
        required_error: 'Password is required.',
        invalid_type_error: 'Password must be a string.',
    })
        .min(6, 'Password must be at least 6 characters long.')
        .max(32, 'Password must not exceed 32 characters.')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter.')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter.')
        .regex(/[0-9]/, 'Password must contain at least one number.')
        .regex(/[@$!%*?&#]/, 'Password must contain at least one special character (@$!%*?&#).'),
    m_number: z
        .string({
            required_error: 'Mobile number is required.',
            invalid_type_error: 'Mobile number must be a string.',
        })
        .regex(
            /^[6-9][0-9]{9}$/,
            'Mobile number must be exactly 10 digits and start with 6, 7, 8, or 9 (only digits allowed).'
        ).refine(
            (val) => !/^(\d)\1{9}$/.test(val),
            {
                message: 'Mobile number cannot have all digits the same (e.g., 6666666666).',
            }
        ),
    status: z.enum(['active', 'inactive']).default('active'),
    socket_id: z.string().optional().nullable(),
    fcm_key: z.string().optional().nullable(),
});

module.exports = adminValidationSchema;