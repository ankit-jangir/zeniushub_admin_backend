const { z } = require("zod");

const expenseSchema = z.object({
  name: z.string().min(1, "Name is required"), // name instead of title
  categoryId: z.number().int().positive("Category ID must be positive"),
  amount: z.number().positive("Amount must be positive"),
  paymentMethod: z.enum(['upi', 'cash', 'card', 'online'], {
    errorMap: () => ({ message: "Payment method must be one of: upi, cash, card, online" })
  }),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  referralName: z.string().optional(),
  description: z.string().optional()
});


module.exports = expenseSchema;
