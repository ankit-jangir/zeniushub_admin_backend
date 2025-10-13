const { Sequelize, Op, literal } = require("sequelize");
const { Department, AccessControl, Employee } = require("../models/");
const { CrudRepository } = require("./crud.repo");
const customError = require("../utils/error.handler");

class departmentRepositories extends CrudRepository {
    constructor() {
        super(Department);
    }

    async addAccessControl(id, data) {

        return await Department.update(
            { access_control: Sequelize.literal(` access_control || ARRAY${data}`) },
            { where: { id: id } }
        );
    }
    async getAccessControl(id) {
        // Step 1: Get the department by primary key
        const department = await Department.findByPk(id);

        if (!department) {
            throw new customError("Department not found");
        }

        // Step 2: Get the access_control array from department
        const accessControlIds = department.access_control; // <-- use this key as per your DB column
        console.log("Access Control IDs:", accessControlIds);

        // Step 3: Get access control names using IDs
        const accessControls = await AccessControl.findAll({
            where: {
                id: {
                    [Op.in]: accessControlIds
                }
            },
            attributes: ['id', 'name'],
            logging: console.log  // Logs the generated query
        });

        console.log("Fetched Access Controls:", accessControls);

        // Step 4: Return department with access control names
        return {
            // ...department.toJSON(),
            accessControls: accessControls.map(a => a.toJSON())
        };


    }
    async getAccessControll(id) {
        // Step 1: Get the department by primary key
        const department = await Department.findByPk(id);

        if (!department) {
            throw new customError("Department not found");
        }

        // Step 2: Get the access_control array from department
        const accessControlIds = department.access_control; // <-- use this key as per your DB column
        console.log("Access Control IDs:", accessControlIds);

        // Step 3: Get access control names using IDs
        const accessControls = await AccessControl.findAll({
            where: {
                id: {
                    [Op.notIn]: accessControlIds
                }
            },
            attributes: ['id', 'name'],
            logging: console.log  // Logs the generated query
        });

        console.log("Fetched Access Controls:", accessControls);

        // Step 4: Return department with access control names
        return {
            // ...department.toJSON(),
            accessControls: accessControls.map(a => a.toJSON())
        };


    }

    async checkDuplicateAccessControls(id, newAccessControls) {
        // Validate department existence
        const department = await Department.findByPk(id);
        if (!department) {
            throw new customError("Department not found");
        }

        // Ensure newAccessControls is an array of numbers
        const accessControls = Array.isArray(newAccessControls)
            ? newAccessControls.map(Number)
            : [Number(newAccessControls)];

        // Check for duplicates using PostgreSQL array overlap
        const duplicates = await Department.findAll({
            where: {
                id,
                access_control: {
                    [Op.overlap]: accessControls, // Checks if any new access controls already exist
                },
            },
            attributes: ['id'],
        });

        console.log("duplicates:", duplicates);

        if (duplicates.length > 0) {
            throw new customError("One or more access controls are already assigned to this department");
        }

        return true; // No duplicates found
    }

    async updateAccessControl(id, newData) {
        return await Department.update(
            {
                access_control: Sequelize.literal(`array_remove(access_control, ${Number(newData)})`)
            },
            {
                where: { id: id }
            }
        );
    }

    async Firlterdata(id) {
        console.log("Filter Repo: Department ID ->", id);
        const employees = await Employee.findAll({
            where: {
                department: {
                    [Op.contains]: [id]  
                }
            },
             attributes: {
            exclude: ["password"]  
        }
        });
        return employees;
    }
    async getAllAccessControl (id) {
        // console.log("Filter Repo: Department ID ->", id);
       return await AccessControl.findAll({});
    }

     async searchapi(name) {
            const whereCondition = name ? {
                name: { [Op.like]: `%${name}%` }
            } : {};
        
            return await Department.findAll({
                where: whereCondition
            });
        }

}

module.exports = { departmentRepositories }
