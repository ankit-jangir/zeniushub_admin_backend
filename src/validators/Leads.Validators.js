const z = require("zod");

const leadSchema = z.object({
    name: z.string().min(1, "Name is required"),
    address: z.string().optional(),
    email: z.string().email("Invalid email format"),
    phone_number: z.string()
        .min(10, "Phone number must be at least 10 digits")
        .max(15, "Phone number must be at most 15 digits")
        .regex(/^[6789]\d{9}$/, {
            message: "Invalid phone number. Must start with 6, 7, 8, or 9 and be 10 digits long.",
        }),
            category_id: z.number().int().positive("Category ID must be a positive integer"),
            status: z.enum(["Inconservation", "Droped", "Hot", ]),
            assign_to: z.number().int().positive("Assign To must be a positive integer").optional(),
            time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, "Invalid time format (HH:MM:SS)").optional(),
            created_at: z.string().optional(),
            updated_at: z.string().optional()
});

module.exports = leadSchema;
