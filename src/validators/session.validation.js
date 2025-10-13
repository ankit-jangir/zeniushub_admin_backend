const { z } = require("zod");


const sessionSchema = z.object({
    id: z.number().int().positive(),
    session_year: z.number().int().gte(2000, { message: 'Session year must be greater than or equal to 2000.' }),
    is_default: z.boolean().optional(),
});




module.exports = sessionSchema;