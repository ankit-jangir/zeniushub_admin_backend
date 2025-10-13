const { try_catch } = require("../utils/tryCatch.handler");
const { employeeProfileSchema } = require("../validators/employeeSubject.validation")
const employeeSubjectService = require("../services/employeeSubject.service")

const employeeSubjectController = {
    addemployeeSubject: try_catch(async (req, res) => {
        const result = employeeProfileSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: result.error.errors.map(err => ({
                    field: err.path.join('.'),
                    message: err.message
                }))
            });
        }

        await employeeSubjectService.addEmployeeSubjectService(result.data);
        return res.send({
            success: true,
            Message: "Subject add SuccessFully"
        })


    }),

    getEmployeeSubject: try_catch(async (req, res) => {
        // const employeeId = req.params.employeeId;
        const employeeId = parseInt(req.params.employeeId, 10);
        const employeeGetSubject = await employeeSubjectService.getEmployeeSubjectService(employeeId);
        return res.status(200).send({
            success: true,
            data: employeeGetSubject
        })
    }),

    getEmployeeNonAddingSubject: try_catch(async (req, res) => {
        const employeeId = parseInt(req.params.employeeId, 10);

        if (isNaN(employeeId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid employee ID'
            })
        }
        const EmployeeNonAddingSubject = await employeeSubjectService.getEmployeeNonAddingSubjectService(employeeId);
        return res.status(200).send({
            success: true,
            data: EmployeeNonAddingSubject
        })


    }),

    delEmployeeSubj: try_catch(async (req, res) => {
        const id = parseInt(req.params.id, 10);

        if (isNaN(employeeId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid  ID'
            })
        }
        const EmployeeNonAddingSubject = await employeeSubjectService.getEmployeeNonAddingSubjectService(id);
        return res.status(200).send({
            success: true,
            data: EmployeeNonAddingSubject
        })


    })
}

module.exports = employeeSubjectController;