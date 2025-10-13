const { z } = require('zod');

const examCategorySchema = z.object({
    id: z.number().int().positive(),
    categoryName: z
        .string({
            required_error: 'Category name is required.',
            invalid_type_error: 'Category name must be a string.',
        })
        .min(1, 'Category name cannot be empty.')
        .max(100, 'Category name must be at most 100 characters.'),
});

module.exports = {
    examCategorySchema,
};
