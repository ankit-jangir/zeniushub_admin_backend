const { z } = require("zod");

// Helper function to check string is not only digits
const notOnlyNumbers = (val) => !/^\d+$/.test(val);

const employeeSchema = z.object({
  // id: z.number().int().positive(),

  image_path: z.string()
    .regex(/\.(jpeg|jpg|png|webp|svg)$/i, { message: "Only jpeg, jpg, png, webp, or svg image files are allowed." })
    .optional()
    .nullable(),

  first_name: z.string({ required_error: "firstName is required" })
    .nonempty({ message: "firstName cannot be empty" })
    .min(3, { message: "firstName must be at least 3 characters" })
    .max(100, { message: "firstName must be at most 100 characters" })
    .refine(notOnlyNumbers, { message: "firstName cannot be numbers only" }),

  highest_qualification: z.string({ required_error: "highestQualification is required" })
    .nonempty({ message: "highestQualification cannot be empty" })
    .min(3, { message: "highestQualification must be at least 3 characters" })
    .max(255, { message: "highestQualification must be at most 255 characters" })
    .refine(notOnlyNumbers, { message: "highestQualification cannot be numbers only" }),

  institution_name: z.string({ required_error: "institutionName is required" })
    .nonempty({ message: "institutionName cannot be empty" })
    .min(3, { message: "institutionName must be at least 3 characters" })
    .max(255, { message: "institutionName must be at most 255 characters" })
    .refine(notOnlyNumbers, { message: "institutionName cannot be numbers only" }),

  contact_number: z.string({ required_error: "contactNumber is required" })
    .nonempty({ message: "contactNumber cannot be empty" })
    .regex(/^[6-9]\d{9}$/, { message: "contactNumber should be a valid 10-digit Indian number" }),

  emergency_number: z.string({ required_error: "emergencyNumber is required" })
    .nonempty({ message: "emergencyNumber cannot be empty" })
    .regex(/^[6-9]\d{9}$/, { message: "emergencyNumber should be a valid 10-digit Indian number" }),

  email: z.string({ required_error: "email is required" })
    .nonempty({ message: "email cannot be empty" })
    .email({ message: "email should be a valid email" }),

  date_of_birth: z.union([z.string(), z.literal("")]).optional(),

  residential_address: z.string({ required_error: "residentialAddress is required" })
    .nonempty({ message: "residentialAddress cannot be empty" })
    .min(10, { message: "residentialAddress must be at least 10 characters" }),

  district: z.string({ required_error: "district is required" })
    .nonempty({ message: "district cannot be empty" })
    .min(3, { message: "district must be at least 3 characters" })
    .max(255, { message: "district must be at most 255 characters" })
    .refine(notOnlyNumbers, { message: "district cannot be numbers only" }),

  state: z.string({ required_error: "state is required" })
    .nonempty({ message: "state cannot be empty" })
    .min(3, { message: "state must be at least 3 characters" })
    .max(255, { message: "state must be at most 255 characters" })
    .refine(notOnlyNumbers, { message: "state cannot be numbers only" }),

  status: z.union([
    z.enum(["Active", "Inactive"]),
    z.literal(""),
  ]).optional(),

  start_time: z.union([
    z.string().regex(/^([0-1]?[0-9]|2[0-3]):([0-5]?[0-9])$/, {
      message: "start_time should be in HH:MM format",
    }),
    z.literal("")
  ]).optional(),

  end_time: z.union([
    z.string().regex(/^([0-1]?[0-9]|2[0-3]):([0-5]?[0-9])$/, {
      message: "end_time should be in HH:MM format",
    }),
    z.literal("")
  ]).optional(),

  pincode: z.string({ required_error: "pincode is required" })
    .nonempty({ message: "pincode cannot be empty" })
    .regex(/^\d{6}$/, { message: "pincode should be a 6-digit number" }),

  permanent_address: z.string({ required_error: "permanentAddress is required" })
    .nonempty({ message: "permanentAddress cannot be empty" })
    .min(10, { message: "permanentAddress must be at least 10 characters" }),

  permanent_district: z.string({ required_error: "permanentDistrict is required" })
    .nonempty({ message: "permanentDistrict cannot be empty" })
    .min(3, { message: "permanentDistrict must be at least 3 characters" })
    .max(255, { message: "permanentDistrict must be at most 255 characters" })
    .refine(notOnlyNumbers, { message: "permanentDistrict cannot be numbers only" }),

  permanent_state: z.string({ required_error: "permanentState is required" })
    .nonempty({ message: "permanentState cannot be empty" })
    .min(3, { message: "permanentState must be at least 3 characters" })
    .max(255, { message: "permanentState must be at most 255 characters" })
    .refine(notOnlyNumbers, { message: "permanentState cannot be numbers only" }),

  permanent_pincode: z.string({ required_error: "permanentPincode is required" })
    .nonempty({ message: "permanentPincode cannot be empty" })
    .regex(/^\d{6}$/, { message: "permanentPincode should be a 6-digit number" }),

  department: z.array(z.number({ invalid_type_error: "department should contain only numbers" }).int())
    .min(1, { message: "department must have at least 1 department selected" }),

  salary: z.number({ required_error: "salary is required" })
    .positive({ message: "salary should be a positive number" }),

  joining_date: z.union([
    z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: "joiningDate must be in ISO format",
    }),
    z.date(),
  ]),

  account_number: z.string({ required_error: "accountNumber is required" })
    .nonempty({ message: "accountNumber cannot be empty" })
    .min(12, { message: "accountNumber must be at least 12 digits" })
    .max(16, { message: "accountNumber must be at most 16 digits" }),

  ifsc_code: z.string({ required_error: "ifscCode is required" })
    .nonempty({ message: "ifscCode cannot be empty" })
    .min(10, { message: "ifscCode must be at least 10 characters" })
    .max(15, { message: "ifscCode must be at most 15 characters" }),

  account_holder_name: z.string({ required_error: "accountHolderName is required" })
    .nonempty({ message: "accountHolderName cannot be empty" })
    .min(3, { message: "accountHolderName must be at least 3 characters" })
    .max(255, { message: "accountHolderName must be at most 255 characters" })
    .refine(notOnlyNumbers, { message: "accountHolderName cannot be numbers only" }),

  fcm_key: z.string().nullable().optional(),
  socket_id: z.string().nullable().optional(),

}).refine(
  (data) => data.contact_number !== data.emergency_number,
  {
    path: ['emergency_number'],
    message: "emergencyNumber should not be the same as contactNumber",
  }
);

module.exports = { employeeSchema };