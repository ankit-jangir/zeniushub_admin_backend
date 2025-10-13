const { EmployeeTask, Admin } = require("../models/");
const { CrudRepository } = require("./crud.repo");

class employeeTaskRepositories extends CrudRepository {
    constructor() {
        super(EmployeeTask);
    }




    async getAllTask() {
        return await EmployeeTask.findAll({

            include: [
                {
                    model: Admin,

                }
            ]
        });

    }


    async getTaskById(id) {
        return await EmployeeTask.findByPk(id, {

            include: [
                {
                    model: Admin,

                }
            ]
        });
    }

    async countEmployeeTask(id) {
        return await EmployeeTask.count({
            where: { employee_id: id }
        });

    }

    async countAllTask() {
        return await EmployeeTask.count();

    }
}

module.exports = { employeeTaskRepositories }
