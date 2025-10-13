const moment = require('moment');
const EmployeeSalaryRepositories = require('../repositories/employeeSalary.repo');
const customError = require('../utils/error.handler');
const employeeSalaryRepo = new EmployeeSalaryRepositories();

const calculateEmployeeSalary = async (employeeId, fromDate, toDate) => {
    // Input validation
    if (!employeeId) throw new customError('Employee ID is required');

    const dateFormat = 'YYYY-MM-DD';
    const start = moment(fromDate, dateFormat, true);
    const end = moment(toDate, dateFormat, true);

    if (!start.isValid() || !end.isValid()) {
        throw new customError('Invalid date format (expected: YYYY-MM-DD)');
    }

    if (end.isBefore(start)) {
        throw new customError('toDate must be greater than or equal to fromDate');
    }

    // Parallelize database calls for better performance
    const [employee, rawAttendances] = await Promise.all([
        employeeSalaryRepo.getDataById(employeeId),
        employeeSalaryRepo.getEmployeeAttendancesByDateRange(employeeId, fromDate, toDate)
    ]);

    if (!employee) {
        throw new customError('Employee not found');
    }

    if (!employee.salary || employee.salary <= 0) {
        throw new customError('Invalid employee salary');
    }

    // Process attendance data
    const attendanceMap = new Map();
    let presentDays = 0;
    let halfDays = 0;

    // Filter and count valid attendances within date range
    for (const attendance of rawAttendances) {
        const date = moment(attendance.date);

        // Skip if date is invalid, Sunday, or outside requested range
        if (!date.isValid() ||
            date.day() === 0 ||
            date.isBefore(start, 'day') ||
            date.isAfter(end, 'day')) {
            continue;
        }

        const dateKey = date.format(dateFormat);

        // Ensure we only count one record per day (latest one if duplicates exist)
        if (!attendanceMap.has(dateKey)) {
            attendanceMap.set(dateKey, attendance.status);

            if (attendance.status === 'present') presentDays++;
            else if (attendance.status === 'half_day') halfDays++;
        }
    }

    // Calculate total working days (excluding Sundays) more efficiently
    const totalWorkingDays = Math.max(0, end.diff(start, 'days') + 1 -
        Array.from({ length: end.diff(start, 'days') + 1 }, (_, i) =>
            start.clone().add(i, 'days').day() === 0 ? 1 : 0
        ).reduce((a, b) => a + b, 0));

    if (totalWorkingDays === 0) {
        throw new customError('No working days in the selected range');
    }

    // Validate attendance counts
    const absentDays = Math.max(0, totalWorkingDays - presentDays - halfDays);

    // Ensure we don't have more attendances than working days
    const validatedPresentDays = Math.min(presentDays, totalWorkingDays - halfDays);
    const validatedHalfDays = Math.min(halfDays, totalWorkingDays - validatedPresentDays);

    // Calculate salary components
    const perDaySalary = employee.salary / totalWorkingDays;
    const totalDeduction = (absentDays * perDaySalary) + (validatedHalfDays * 0.5 * perDaySalary);
    const finalSalary = employee.salary - totalDeduction;

    return {
        employee_id: employeeId,
        name: `${employee.first_name}${employee.last_name ? ' ' + employee.last_name : ''}`,
        base_salary: employee.salary,
        from_date: fromDate,
        to_date: toDate,
        per_day_salary: +perDaySalary.toFixed(2),
        total_working_days: totalWorkingDays,
        present_days: validatedPresentDays,
        half_days: validatedHalfDays,
        absent_days: absentDays,
        total_deduction: +totalDeduction.toFixed(2),
        final_salary: +finalSalary.toFixed(2),
    };
};


module.exports = {
    calculateEmployeeSalary,
};