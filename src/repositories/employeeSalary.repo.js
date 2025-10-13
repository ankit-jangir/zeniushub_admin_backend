const { Employee, EmployeeAttendence } = require('../models');
const { Op } = require('sequelize');
const { CrudRepository } = require('./crud.repo');

class EmployeeSalaryRepositories extends CrudRepository {
    constructor() {
        super(Employee);
    }

    /**
     * Get employee by ID (uses CrudRepository's getDataById)
     * @param {string} employeeId
     * @returns {Promise<Employee>}
     */
    async getDataById(employeeId) {
        return await this.model.findByPk(employeeId);
    }

    /**
     * Get attendance records for a specific month
     * @param {string} employeeId
     * @param {string} month - Format: YYYY-MM
     * @returns {Promise<EmployeeAttendence[]>}
     */
    async getEmployeeAttendances(employeeId, month) {
        const startDate = new Date(`${month}-01`);
        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + 1);

        return await EmployeeAttendence.findAll({
            where: {
                employee_id: employeeId,
                attendence_date: {
                    [Op.gte]: startDate,
                    [Op.lt]: endDate,
                },
            },
        });
    }

    /**
     * Get attendance records between any two dates (used in salary calculation)
     * @param {string} employeeId
     * @param {string} fromDate - Format: YYYY-MM-DD
     * @param {string} toDate - Format: YYYY-MM-DD
     * @returns {Promise<EmployeeAttendence[]>}
     */
    async getEmployeeAttendancesByDateRange(employeeId, fromDate, toDate) {
        return await EmployeeAttendence.findAll({
            where: {
                employee_id: employeeId,
                attendence_date: {
                    [Op.between]: [new Date(fromDate), new Date(toDate)],
                },
            },
        });
    }
}

module.exports = EmployeeSalaryRepositories;