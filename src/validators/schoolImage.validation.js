const { z } = require('zod');

const schoolImageSchema = z.object({
    id: z.number().int().positive(),
  school_name: z.string().min(1, 'School name is required').max(255, 'School name cannot exceed 255 characters'),
  school_description: z.string().min(1, 'School description is required'),
  image_path: z .string({
    required_error: 'Image path is required.',
    invalid_type_error: 'Image path must be a string.',
  })
  .regex(
    /\.(jpeg|jpg|png|webp|svg)$/i,
    'Only jpeg, jpg, png, webp, or svg image files are allowed.'
  ),
});

module.exports = schoolImageSchema;