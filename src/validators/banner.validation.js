const { z } = require('zod');

const bannerValidationSchema = z.object({
  id: z.number().int().positive(),
  image_path: z .string({
    required_error: 'Image path is required.',
    invalid_type_error: 'Image path must be a string.',
  })
  .regex(
    /\.(jpeg|jpg|png|webp|svg)$/i,
    'Only jpeg, jpg, png, webp, or svg image files are allowed.'
  ),
});

module.exports = bannerValidationSchema;