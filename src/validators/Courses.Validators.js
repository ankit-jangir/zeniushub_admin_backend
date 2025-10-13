const z = require("zod");

// ✅ Define Schema
const courseSchema = z.object({
    course_name: z.string().nonempty("Course name is required"),
    course_type: z.string().optional(),
})
// ✅ Ensure discount_price is less than or equal to course_price
.superRefine((data, ctx) => {
    if (data.discount_price > data.course_price) {
        ctx.addIssue({
            path: ["discount_price"],
            message: "Discount price cannot be greater than course price",
        });
    }
});

module.exports = courseSchema;
