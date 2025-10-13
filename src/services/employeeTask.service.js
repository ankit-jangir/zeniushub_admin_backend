const { where } = require("sequelize");
const { EmployeeTask, Employee } = require("../models/");
const { employeeTaskRepositories } = require("../repositories/employeeTask.repo");
const customError = require("../utils/error.handler");
const { employeeRepositories } = require("../repositories/employe.repo");
const { uploadFileToAzure } = require("../utils/azureUploader");
const fs = require("fs");


const employeeTaskRepository = new employeeTaskRepositories(EmployeeTask);
const employeeRepository = new employeeRepositories(Employee);

const employeeTaskService = {

    addEmployeeTask: async (data) => {

        const check = await employeeRepository.getOneData({ id: data.employee_id });

        if (!check) {
            throw new customError("Employee not found", 404);
        }

        if (check.status === "Inactive") {
            throw new customError("Employee is Inactive", 400);
        }


        const [datePart, timePart] = data.due_date.split(" ");
        const [year, month, day] = datePart.split("-").map(Number);
        const [hour, minute] = timePart.split(":").map(Number);


        const due_date = new Date(year, month - 1, day, hour, minute);


        const now = new Date();


        if (due_date < now) {

            throw new customError("Due date cannot be in the past", 400);
        }

        if (data._rawFile) {
            const file = data._rawFile;
            const buffer = fs.readFileSync(file.path);
            const blobName = `task-attachment/${file.filename}`;

            const result = await uploadFileToAzure(buffer, blobName);

            if (!result.success) {

                throw new customError(`Azure upload failed: ${result.error}`, 502);
            }

            const fullUrl = result.url;
            const attachmentPath = fullUrl.split('/').slice(-2).join('/');
            data.attachments = attachmentPath;
            delete data._rawFile;
        }

        await employeeTaskRepository.create(data);
    }
    ,

    getEmployeeTask: async (id) => {

        // let check = await employeeTaskRepository.getOneData({ employee_id: id });
        // if (!check) {

        //     throw new customError("Employee task not found", 404);

        // }
        return await employeeRepository.getEmployeeTask(id);
    },

    getAllTask: async () => {
        return await employeeTaskRepository.getAllTask();
    },

    getEmployeeTaskById: async (id) => {
        return await employeeTaskRepository.getTaskById(id);
    },

    updateEmployeeTask: async (data, file) => {
        const existing = await employeeTaskRepository.getOneData({ id: data.id });

        if (!existing) {
            throw new customError("Task not found", 404);
        }

        if (file) {
            const filePath = file.path;
            const buffer = fs.readFileSync(filePath);
            const blobName = `task-attachment/${file.filename}`;

            const result = await uploadFileToAzure(buffer, blobName);

            if (!result.success) {
                throw new customError(`Azure upload failed: ${result.error}`, 502);
            }

            const fullUrl = result.url;
            const attachmentPath = fullUrl.split('/').slice(-2).join('/');
            data.attachments = attachmentPath;
        }

        await employeeTaskRepository.update(data, { id: data.id });
    }
    ,

    deleteEmployeeTask: async (id) => {
        return await employeeTaskRepository.deleteData(id);
    },

    countEmployeeTask: async (id) => {
        let check = await employeeTaskRepository.getOneData({ employee_id: id });
        if (!check) {

            throw new customError("Employee not found", 404);

        }
        return await employeeTaskRepository.countEmployeeTask(id);
    },

    countAllTask: async () => {
        return await employeeTaskRepository.countAllTask();
    },

    updateStatus: async (data, id) => {

        let check = await employeeTaskRepository.getOneData({ id: id.id });
        if (!check) {

            throw new customError("Task not found", 404);

        }

        if (check.status === data.status) {

            throw new customError(`The status is already ${data.status}.`, 409);
        }
        await employeeTaskRepository.update(data, id);
    },

}

module.exports = employeeTaskService