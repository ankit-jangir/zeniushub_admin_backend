const { CategoryRepositories } = require("../repositories/Category.repo");
const { employeeRepositories } = require("../repositories/employe.repo");
const { LeadsRepositories } = require("../repositories/Leads.repo");
const customError = require("../utils/error.handler");
const {Employee,category,Session} = require("../models/");
const { studentRepositories } = require("../repositories/student.repo");
const {Leads} = require('../models')
const LeadsRepositorie = new LeadsRepositories();
const CategoryRepositorie = new CategoryRepositories();
const employeeRepositorie = new employeeRepositories();
const studentRepositorie = new studentRepositories()

const Leadsservices = {
  addleadsservices: async (data) => {
  try {
    const {
      name,
      address,
      email,
      phone_number,
      assign_to,
      status,
      session_id,
    } = data;

    console.log("Full data:", data);

    const findSession = await Session.findOne({
      where: { id: session_id },
    });

    if (!findSession) {
      throw new customError("Session id not exist in Session model");
    }

    const today = new Date();

    const sessionYear = findSession.session_year;  

    if (sessionYear !== today.getFullYear()) {
      return {
        status: false,
        message: "You can only add leads for the current year session.",
      };
    }

    if (findSession.start_date && findSession.end_date) {
      const start = new Date(findSession.start_date);
      const end = new Date(findSession.end_date);

      if (today < start || today > end) {
        return {
          status: false,
          message: "Lead can only be added within the current session period.",
        };
      }
    }

    if (
      !name ||
      !address ||
      !email ||
      !phone_number ||
      !assign_to ||
      !session_id
    ) {
      return { status: false, message: "All fields are required." };
    }

    const isValidLength = (val) =>
      typeof val === "string" && val.length >= 3 && val.length <= 50;

    if (
      !isValidLength(name) ||
      !isValidLength(address) ||
      !isValidLength(email)
    ) {
      return {
        status: false,
        message: "Fields must be between 3 and 50 characters.",
      };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { status: false, message: "Invalid email format." };
    }

    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone_number)) {
      return {
        status: false,
        message: "Phone number must be exactly 10 digits.",
      };
    }

    const existing = await LeadsRepositorie.findOne({ phone_number });
    if (existing) {
      return {
        status: false,
        message: "Phone number already exists.",
      };
    }

    const createdLead = await LeadsRepositorie.create(data);
    return { status: true, data: createdLead };
  } catch (error) {
    console.error("Error in addleadsservices:", error);
    return {
      status: false,
      message:
        error?.errors?.[0]?.message ||
        "Something went wrong while creating lead.",
    };
  }
}, 
 
getAllLeadsServices: async (getCritieria, page = 1, limit = 10) => {
    if (isNaN(page) || page <= 0) {
      throw new customError("Invalid page number, it must be a positive integer.");
    }
    if (isNaN(limit) || limit <= 0) {
      throw new customError("Invalid limit, it must be a positive integer.");
    }
  
    const whereClause = {};
  
    if (getCritieria.session_id) {
      whereClause.session_id = getCritieria.session_id;
    } else {
      throw new customError("session_id is required in the criteria.");
    }
  
    if (getCritieria.name) {
      whereClause.name = { [Op.iLike]: `%${getCritieria.name}%` };
    }
  
  
    const offset = (page - 1) * limit;
  
    const { count, rows } = await LeadsRepositorie.findAndCountAll({
      where: whereClause,
      include: [
        { model: category, attributes: ['id', 'name'] },
        { model: Employee, attributes: ['id', 'first_name'] },
        { model: Session, attributes: ['id', 'session_year'] }
      ],
      order: [['created_at', 'DESC']],
      limit,
      offset
    });
  
    return {
      totalRecords: count,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      data: rows
    }}, 

  deleteLeadsservices: async (id) => {
    const newdata = await LeadsRepositorie.getDataById(id);
    if (!newdata) {
      throw new customError("Does not exist Leads_id  in Leads model: ");
    }
    return await LeadsRepositorie.deleteData({ id: id });
  },

  filterleadsstatusServices: async (status) => {
    const ALLOWED_STATUSES = ["Inconservation", "Droped", "Hot", "Converted"];
    console.log("**********************************8", status);
    if (!ALLOWED_STATUSES.includes(status)) {
      throw new customError(`Invalid status: ${status}`);
    }

    const employeesdata = await LeadsRepositorie.filterbystatus(status);
    console.log("employeesdata", employeesdata);
    if (!employeesdata) {
      console.log("Not exist:");
      return null;
    }

    return employeesdata;
  },

  FilterCategoryServices: async (category_id) => {
    try {
      let categoryName = "";
      let leads = [];

      if (category_id) {
        const category = await CategoryRepositorie.getDataById(category_id);
        categoryName = category?.name || "";
        leads = (await LeadsRepositorie.findAll({ category_id })) || [];
      } else {
        leads = (await LeadsRepositorie.findAll()) || [];
      }

      if (!leads.length) return { data: [] };

      const { assign_to } = leads[0]?.dataValues || {};
      const { first_name: employesName } =
        (await employeeRepositorie.getOneData({ id: assign_to })) || {};

      const data = leads.map(({ dataValues }) => {
        const { createdAt, updatedAt, ...rest } = dataValues;
        return { ...rest, categoryName, employesName };
      });

      return { data };
    } catch (error) {
      console.error("Error in FilterCategoryServices:", error.message);
      throw error;
    }
  },

  searchingleadsService: async (body, page, limit) => {
  return await LeadsRepositorie.searchingleadsService(body, page, limit);



  // const statusCounts = {
  //   Inconservation: 0,
  //   Droped: 0,
  //   Hot: 0,
  //   Converted: 0,
  // };

  // statusResult.forEach(row => {
  //   statusCounts[row.status] = parseInt(row.get('count'), 10);
  // });

  // const totalLeads = await Leads.count({
  //   where: {
  //     session_id: body.id
  //   }
  // });

  // const data = await LeadsRepositorie.Getdatabyname(body, page, limit);

  // return {
  //   data,
  //   totalLeads,
  //   inconservationCount: statusCounts.Inconservation,
  //   droppedCount: statusCounts.Droped,
  //   hotCount: statusCounts.Hot,
  //   convertedCount: statusCounts.Converted,
  // };
},
  changestatusLeads: async (id, status) => {
    console.log(id, status);

    return await LeadsRepositorie.update({ status }, { id });
  },
  changeAssineTaskLeads: async (id, assign_to) => {
    console.log(assign_to,"dfff",id)
    const exist = await LeadsRepositorie.getDataById(id)
      if (!exist) {
    throw new customError("Lead not found");
  }
    return await LeadsRepositorie.update(
    { assign_to },     // ✅ object with column to update
    { id }             // ✅ plain object with key used in where clause
  );
  },
  filterAndSearchLeads: async (getDataall) => {
    return await LeadsRepositorie.Getdatabyname(getDataall);
  },

  getLeadsStatusSummary: async (id) => {
    const leads = await LeadsRepositorie.findAll({
      // attributes: ["status"],
      session_id:id,
      // raw: true,
    });
    console.log(leads)

    const totalLeads = leads.length;

    const statusCounts = {
      Inconservation: 0,
      Droped: 0,
      Hot: 0,
      Converted: 0,
    };

    leads.forEach((lead) => {
      if (statusCounts.hasOwnProperty(lead.status)) {
        statusCounts[lead.status]++;
      }
    });

    return {
      totalLeads,
        inconservationCount: statusCounts.Inconservation,
        droppedCount: statusCounts.Droped,
        hotCount: statusCounts.Hot,
        convertedCount: statusCounts.Converted, 
    };
  },

  converttostudentServices: async (leadsId, courseId, batchId,adhar_noo,gender,father_name,mother_name,dob) => {
    console.log("father_name, : ",father_name,mother_name)


    // const check = await LeadsRepositorie(leadsId);
    const leadsdata = await LeadsRepositorie.getDataById(leadsId);
     if(leadsdata.status==="Converted"){
    throw new customError("already  Converted   : " )
  }
    console.log("user data   :LLL L  : : : : : ",leadsdata.status)
    if (!leadsdata) {
   throw new customError("Lead not found");
   
 }
//  return leadsId

  const threeYearsAgo = new Date();
  threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);
  if (new Date(dob) > threeYearsAgo) {
    throw new customError("DOB must be at least 3 years before today.");
  }
    
  const studentPayload = {
    course_id: courseId,
    batch_id: batchId,
    name: leadsdata.name,
    address: leadsdata.address,
    email: leadsdata.email || null,
    contact_no: leadsdata.phone_number,
    status: "active", 
    adhar_no:adhar_noo, 
    father_name,
    mother_name,
    dob,
    gender: gender, 
    adhar_front_back: null,
    pancard_no: null,
    pancard_front_back: null,
    parent_adhar_no: null,
    parent_adhar_front_back: null,
    parent_account_no: null,
    ifsc_no: null,
    count_emi: null,
    discount_amount: null,
    final_amount: 0,
    invoice_status: null,
    socket_id: null,
    fcm_key: null,
    serial_no: null,
    rt: false,
    ex_school: null,
    profile_image: null,
  };

  const student = await studentRepositorie.create(studentPayload);
  // await LeadsRepositorie.deleteData(Number(leadsId));
 
  await LeadsRepositorie.update(
   { status: "Converted" },  // fields to update
  { id: leadsId }             // condition to match
);



  return student  
}

};

module.exports = Leadsservices;
