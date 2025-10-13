const { calculateEmployeeSalary } = require('../services/employeeSalaryService');

const getSalary = async (req, res) => {
    const { employeeId, fromDate, toDate } = req.body;

    try {
        const salary = await calculateEmployeeSalary(employeeId, fromDate, toDate);
        res.json(salary);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

module.exports = { getSalary };