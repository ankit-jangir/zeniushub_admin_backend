const { Op, fn, col } = require("sequelize");
const { departmentRepositories } = require("../repositories/department.repo");
const { employeeRepositories } = require("../repositories/employe.repo");
const db = require("../models/index");
const customError = require("../utils/error.handler");
const departmentValidationSchema = require("../validators/departmentValidator");


const departmentRepository = new departmentRepositories();
const employeeRepositorie = new employeeRepositories();
const departmentservice = {
 adddepartment: async (data) => {
  const { name, access_control } = data;

  // Step 1: Trim and validate
  const trimmedName = name?.trim();
  if (!trimmedName) {
    throw new customError("Department name cannot be empty or whitespace.", 400);
  }

  const validationResult = departmentValidationSchema
    .pick({ name: true, access_control: true })
    .safeParse({ name: trimmedName, access_control });

  if (!validationResult.success) {
    const errorMessages = validationResult.error.errors.map(err => err.message).join(", ");
    throw new customError(errorMessages, 400);
  }

  // Step 2: Check for duplicate name (case-insensitive)
  const existing = await departmentRepository.findOne({
    name: trimmedName.toLowerCase()
  });

  if (existing) {
    throw new customError("Department with the same name already exists.", 400);
  }

  // Step 3: Create
  return await departmentRepository.create({
    name: trimmedName.toLowerCase(),
    access_control
  });
}
,
  getdepartment: async (name) => {
    return await departmentRepository.searchapi(name);
  },
  getOnedepartment: async (id) => {
    return await departmentRepository.getDataById(id);
  },
  updatedepartment: async (id, name, access_control) => {
    return await departmentRepository.update(id, {
      access_control: access_control,
      name: name,
    });
  },
  delete: async (id) => {
    // Optional: Check if department exists before deleting
    const existing = await departmentRepository.getDataById(id);
    if (!existing) {
      throw new customError("Department not found", 404);
    }

    // ✅ Step 1: Remove department ID from Employee.department array
    await db.Employee.update(
      {
        department: fn("array_remove", col("department"), id),
      },
      {
        where: {
          department: {
            [Op.contains]: [id],
          },
        },
      }
    );

    // ✅ Step 2: Delete the department itself
    return await departmentRepository.deleteData(id);
  },
  accessdepartment: async (id, data) => {
    return await departmentRepository.addAccessControl(id, data);
  },
  getAccessDepartment: async (id) => {
    return await departmentRepository.getAccessControl(id);
  },
  getAccessControl: async (id) => {
    return await departmentRepository.getAccessControll(id);
  },
  getAllAccessControl: async () => {
    return await departmentRepository.getAllAccessControl();
  },
  updateAccessDepartmentt: async (id, newData) => {
    const data = await departmentRepository.updateAccessControl(id, newData);
    console.log(data);
    return data;
  },
  // updateAccessDepartment: async (id, newData) => {
  //     const existing = await departmentRepository.checkDuplicateAccessControls(id,newData);

  //     if (existing) {
  //         throw new Error('Access control for this department ID already exists.');
  //     }

  //     return await departmentRepository.updateAccessControl(id, newData);
  // },
  async updateAccessDepartment(id, newData) {
    let dataArray = [];

    // Agar newData ek string ho (jaise "1,2,3")
    if (typeof newData === "string") {
      try {
        dataArray = JSON.parse(newData); // Try JSON parsing
      } catch (err) {
        dataArray = newData.split(",").map(Number); // fallback: comma se split
      }
    }
    // Agar already array hai
    // else if (Array.isArray(newData)) {
    //     dataArray = newData.map(Number);
    // }
    // // Agar single number ho (like 5)
    // else if (typeof newData === 'number') {
    //     dataArray = [newData];
    // }
    // // Agar kuch aur hai (invalid)
    // else {
    //     throw new Error('Invalid data format for access controls');
    // }

    // Ab dataArray sahi format mein hai
    console.log(id, dataArray);

    await departmentRepository.checkDuplicateAccessControls(id, dataArray);

    // Access control update call
    return await departmentRepository.updateAccessControl(id, dataArray);
  },
  // datafilterservices: async(id)=>{
  //     const alldata = await departmentRepository.findOne(id);
  //     const finaldata = await employeeRepositorie.findOne(id)
  //     return {
  //         alldata,
  //         finaldata
  //     };
  // }
  datafilterservices: async (input) => {
    const id = parseInt(input?.id || input);
    console.log("Parsed ID:", id);

    if (!id) throw new customError("Valid ID is required");
    const alldata = await departmentRepository.findOne(id);

    if (!alldata) {
      throw new customError(`department with id ${id} does not exist`);
    }

    const employesdata = await departmentRepository.Firlterdata(id);

    return {
      alldata,
      employesdata,
    };
  },
};

module.exports = { departmentservice };
