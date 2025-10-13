const { logger } = require("sequelize/lib/utils/logger");
const EmployeeTaskSchema = require("../validators/employeeTask.validation");
const employeeTaskService = require("../services/employeeTask.service");
const { try_catch } = require("../utils/tryCatch.handler");
const customError = require("../utils/error.handler");


const employeeTask = {

    addEmployeeTask: try_catch(
        async (req, res) => {

            const fileData = {
                assigned_by: req.adminId,
                ...req.body
            };

            fileData.employee_id = parseInt(fileData.employee_id);


            if (req.file) {
                fileData._rawFile = req.file;
            }

            const result = EmployeeTaskSchema.pick({
                assigned_by: true,
                employee_id: true,
                due_date: true,
                attachments: true,
                description: true,
                task_tittle: true
            }).safeParse(fileData);

            if (!result.success) {
                throw new customError(result.error.errors.map(err => err.message).join(", "), 400);
            }


            await employeeTaskService.addEmployeeTask(fileData);

            return res.status(201).send({ status: "001", message: "Task created successfully" });
        }
    ),


    getAllTask: try_catch(
        async (req, res) => {
            const tasks = await employeeTaskService.getAllTask();
            return res.status(200).send({ status: "001", tasks });
        }
    ),

    getEmployeeTask: try_catch(
        async (req, res) => {
            const result = EmployeeTaskSchema.pick({ employee_id: true }).safeParse({ employee_id: parseInt(req.params.employee_id) });

            if (!result.success) {


                throw new customError(result.error.errors.map(err => err.message).join(", "), 400);
            }
            const employeeTasks = await employeeTaskService.getEmployeeTask(req.params.employee_id);
            return res.status(200).send({ status: "001", employeeTasks });
        }
    ),

    getEmployeeTaskById: try_catch(
        async (req, res) => {

            const result = EmployeeTaskSchema.pick({ id: true }).safeParse({ id: parseInt(req.params.id) });

            if (!result.success) {


                throw new customError(result.error.errors.map(err => err.message).join(", "), 400);
            }

            const employeeTask = await employeeTaskService.getEmployeeTaskById(req.params.id);
            if (!employeeTask) {

                throw new customError("Task not found", 404);

            }
            return res.status(200).send({ status: "001", employeeTask });
        }
    ),

    updateEmployeeTask: try_catch(
        async (req, res) => {
            if (req.file) {
                req.body.attachments = req.file.filename;
            } else {
                delete req.body.attachments;
            }

            req.body.assigned_by = req.adminId;
            req.body.employee_id = parseInt(req.body.employee_id);
            req.body.id = parseInt(req.body.id);

            const result = EmployeeTaskSchema.pick({
                id: true,
                assigned_by: true,
                employee_id: true,
                due_date: true,
                attachments: true,
                description: true,
                task_tittle: true
            }).safeParse(req.body);

            if (!result.success) {
                throw new customError(result.error.errors.map(err => err.message).join(", "), 400);
            }

            await employeeTaskService.updateEmployeeTask(req.body, req.file);
            return res.status(200).send({ status: "001", message: "Task updated successfully" });
        }
    ),



    deleteEmployeeTask: try_catch(
        async (req, res) => {

            const result = EmployeeTaskSchema.pick({ id: true }).safeParse({ id: parseInt(req.params.id) });

            if (!result.success) {


                throw new customError(result.error.errors.map(err => err.message).join(", "), 400);
            }

            const deleted = await employeeTaskService.deleteEmployeeTask(req.params.id);

            if (!deleted) {


                throw new customError("Task not found", 404);
            }
            return res.status(200).send({ status: "001", message: "Task deleted successfully" });
        }
    ),

    countEmployeeTask: try_catch(
        async (req, res) => {
            const result = EmployeeTaskSchema.pick({ employee_id: true }).safeParse({ employee_id: parseInt(req.params.employee_id) });

            if (!result.success) {


                throw new customError(result.error.errors.map(err => err.message).join(", "), 400);
            }
            const count = await employeeTaskService.countEmployeeTask(req.params.employee_id);
            return res.status(200).send({ status: "001", count: count });
        }
    ),

    countAllTask: try_catch(
        async (req, res) => {
            const count = await employeeTaskService.countAllTask();
            return res.status(200).send({ status: "001", count: count });
        }
    ),

    updateStatus: try_catch(
        async (req, res) => {
            req.body.id = parseInt(req.body.id);
            const result = EmployeeTaskSchema.pick({ id: true, status: true }).safeParse(req.body);

            if (!result.success) {


                throw new customError(result.error.errors.map(err => err.message).join(", "), 400);
            }
            await employeeTaskService.updateStatus({ status: req.body.status }, { id: req.body.id });

            return res.status(200).send({ status: "001", message: "Task status updated successfully" });
        }
    ),

}
module.exports = { employeeTask }




