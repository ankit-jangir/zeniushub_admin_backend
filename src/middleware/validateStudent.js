const customError = require("../utils/error.handler");
const { try_catch } = require("../utils/tryCatch.handler");

const validateStudent = try_catch((req, res, next) => {
  const { name, adhar_no, father_name, mother_name, dob, joining_date } = req.body;
  const isEmptyOrSpaces = (str) => typeof str !== 'string' || str.trim().length === 0;

  if (!name) throw new customError("Name is required", 400);
  if (!adhar_no) throw new customError("Aadhar number is required", 400);
  if (isEmptyOrSpaces(father_name)) throw new customError("Father name is required", 400);
  if (isEmptyOrSpaces(mother_name)) throw new customError("Mother name is required", 400);
  if (!dob) throw new customError("Date of birth is required", 400);
  if (!joining_date) throw new customError("Joining date is required", 400);

  
  const aadharRegex = /^\d{12}$/;
  if (!aadharRegex.test(adhar_no)) {
    throw new customError("Aadhar number must be 12 digits", 400);
  }
  if (adhar_no === "000000000000") {
    throw new customError("Aadhar number cannot be all zeros", 400);
  }

  
  const nameRegex = /^[A-Za-z\s'.-]+$/;
  if (!nameRegex.test(father_name)) {
    throw new customError("Father name must contain only alphabets", 400);
  }
  if (!nameRegex.test(mother_name)) {
    throw new customError("Mother name must contain only alphabets", 400);
  }

  
  const birthDate = new Date(dob);
  const today = new Date();
  if (isNaN(birthDate.getTime())) {
    throw new customError("Invalid date of birth", 400);
  }

  const ageInMs = today - birthDate;
  const ageInYears = ageInMs / (1000 * 60 * 60 * 24 * 365.25);

  if (ageInYears < 3) {
    throw new customError("Student must be at least 3 years old", 400);
  }
  if (ageInYears > 50) {
    throw new customError("Student age must not be more than 50 years", 400);
  }

  
  if (joining_date) {
    const joinDate = new Date(joining_date);
    if (isNaN(joinDate.getTime())) {
      throw new customError("Joining date is invalid", 400);
    }

    if (joinDate < birthDate) {
      throw new customError("Joining date cannot be before Date of Birth", 400);
    }

    const minJoinDate = new Date(birthDate);
    minJoinDate.setFullYear(minJoinDate.getFullYear() + 3);
    if (joinDate < minJoinDate) {
      throw new customError("Student must be at least 3 years old at time of joining", 400);
    }

    const oneMonthAgo = new Date(today);
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const oneMonthLater = new Date(today);
    oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);

    if (joinDate < oneMonthAgo || joinDate > oneMonthLater) {
      throw new customError("Joining date must be within 1 month range from today", 400);
    }
  }

  next(); // All validations passed
});




// const validatePagination = (req, res, next) => {
//   let { page, limit } = req.query;

//   // ✅ Validate 'page'
//   if (!page || isNaN(Number(page)) || Number(page) < 1) {
//     return res.status(400).json({
//       success: false,
//       message: "Invalid 'page' value. It must be a positive integer.",
//     });
//   }

//   // ✅ Validate 'limit'
//   if (!limit || isNaN(Number(limit)) || Number(limit) < 1) {
//     return res.status(400).json({
//       success: false,
//       message: "Invalid 'limit' value. It must be a positive integer.",
//     });
//   }

//   // ✅ Enforce max limit of 50
//   limit = Number(limit) > 50 ? 50 : Number(limit);

//   // ✅ Attach to req for further use
//   req.query.page = Number(page);
//   req.query.limit = limit;

//   next();
// };

// middleware/validatePagination.js
const validatePagination = (req, res, next) => {
  let { page, limit } = req.query;

  // Convert to numbers
  page = Number(page);
  const validateStudent = (req, res, next) => {
    const { name, adhar_no, father_name } = req.body;

    // ✅ Check for missing fields
    if (!name) return res.status(400).json({ error: "Name is required" });
    // if (!email) return res.status(400).json({ error: 'Email is required' });
    // if (!contact_no)
    //   return res.status(400).json({ error: "Contact number is required" });
    if (!adhar_no)
      return res.status(400).json({ error: "Aadhar number is required" });
    // if (!pancard_no) return res.status(400).json({ error: 'PAN card number is required' });
    if (!father_name)
      return res.status(400).json({ error: "Father name is required" });

    // ✅ Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // ✅ Contact number format validation (10 digits)
    // const contactRegex = /^\d{10}$/;
    // if (!contactRegex.test(contact_no)) {
    //   return res
    //     .status(400)
    //     .json({ error: "Contact number must be 10 digits" });
    // }

    // ✅ Aadhar number format validation (12 digits)
    const aadharRegex = /^\d{12}$/;
    if (!aadharRegex.test(adhar_no)) {
      return res.status(400).json({ error: "Aadhar number must be 12 digits" });
    }

    // ✅ PAN card format validation (5 letters, 4 digits, 1 letter)
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panRegex.test(pancard_no)) {
      return res.status(400).json({ error: "Invalid PAN card format" });
    }

    next(); // ✅ If all validations pass, proceed to the next middleware
  };

  // const validatePagination = (req, res, next) => {
  //   let { page, limit } = req.query;

  //   // ✅ Validate 'page'
  //   if (!page || isNaN(Number(page)) || Number(page) < 1) {
  //     return res.status(400).json({
  //       success: false,
  //       message: "Invalid 'page' value. It must be a positive integer.",
  //     });
  //   }

  //   // ✅ Validate 'limit'
  //   if (!limit || isNaN(Number(limit)) || Number(limit) < 1) {
  //     return res.status(400).json({
  //       success: false,
  //       message: "Invalid 'limit' value. It must be a positive integer.",
  //     });
  //   }

  //   // ✅ Enforce max limit of 50
  //   limit = Number(limit) > 50 ? 50 : Number(limit);

  //   // ✅ Attach to req for further use
  //   req.query.page = Number(page);
  //   req.query.limit = limit;

  //   next();
  // };

  // middleware/validatePagination.js
  const validatePagination = (req, res, next) => {
    let { page, limit } = req.query;

    // Convert to numbers
    page = Number(page);
    limit = Number(limit);

    // Set default if missing or invalid
    if (!page || isNaN(page) || page < 1) {
      page = 1;
    }

    if (!limit || isNaN(limit) || limit < 1) {
      limit = 10;
    }

    // Enforce max limit
    limit = limit > 50 ? 50 : limit;

    req.query.page = page;
    req.query.limit = limit;

    next();
  };

  module.exports = { validateStudent, validatePagination };

  limit = Number(limit);

  // Set default if missing or invalid
  if (!page || isNaN(page) || page < 1) {
    page = 1;
  }

  if (!limit || isNaN(limit) || limit < 1) {
    limit = 10;
  }

  // Enforce max limit
  limit = limit > 50 ? 50 : limit;

  req.query.page = page;
  req.query.limit = limit;

  next();
};

module.exports = { validateStudent, validatePagination };
