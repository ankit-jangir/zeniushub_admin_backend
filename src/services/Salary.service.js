// const { Department, Employee, Salary } = require('../models');
// const moment = require('moment');

// const getLastNMonths = (n) => {
//     const months = [];
//     const current = moment().startOf('month');
//     for (let i = 0; i < n; i++) {
//         months.push(current.clone().subtract(i, 'months').format('YYYY-MM'));
//     }
//     return months.reverse();
// };

// const getDatesBetween = (start, end) => {
//     const dates = [];
//     const current = moment(start);
//     while (current.isSameOrBefore(end, 'day')) {
//         dates.push(current.format('YYYY-MM-DD'));
//         current.add(1, 'day');
//     }
//     return dates;
// };

// const getDepartmentWiseSalaries = async () => {
//     const departments = await Department.findAll();
//     const employees = await Employee.findAll({
//         include: [
//             {
//                 model: Salary,
//                 as: 'salaries'
//             }
//         ]
//     });

//     const months = getLastNMonths(6);
//     const result = [];

//     for (const dept of departments) {
//         const deptObj = {
//             department: dept.name,
//             employees: []
//         };

//         const filteredEmployees = employees.filter(emp => {
//             return emp.department && emp.department.includes(dept.id);
//         });

//         for (const emp of filteredEmployees) {
//             const paidDays = new Set();

//             emp.salaries.forEach(sal => {
//                 const from = moment(sal.from_date);
//                 const to = moment(sal.to_date);
//                 const days = getDatesBetween(from, to);
//                 days.forEach(day => paidDays.add(day));
//             });

//             const monthlyData = [];

//             for (const month of months) {
//                 const startOfMonth = moment(month, 'YYYY-MM').startOf('month');
//                 const endOfMonth = moment(month, 'YYYY-MM').endOf('month');
//                 const daysInMonth = getDatesBetween(startOfMonth, endOfMonth);

//                 const paidInThisMonth = daysInMonth.filter(day => paidDays.has(day));
//                 const unpaidInThisMonth = daysInMonth.filter(day => !paidDays.has(day));

//                 const totalDays = daysInMonth.length;
//                 const paidDaysCount = paidInThisMonth.length;
//                 const unpaidDaysCount = unpaidInThisMonth.length;

//                 const salaryPerDay = emp.base_salary / totalDays;
//                 const paidAmount = salaryPerDay * paidDaysCount;
//                 const dueAmount = salaryPerDay * unpaidDaysCount;

//                 monthlyData.push({
//                     month,
//                     paid_days: paidDaysCount,
//                     unpaid_days: unpaidDaysCount,
//                     total_days: totalDays,
//                     fully_paid: paidDaysCount === totalDays,
//                     partially_paid: paidDaysCount > 0 && paidDaysCount < totalDays,
//                     unpaid: paidDaysCount === 0,
//                     salary: emp.base_salary,
//                     paid_amount: paidAmount.toFixed(2),
//                     due_salary: dueAmount.toFixed(2)
//                 });
//             }

//             const totalPaid = monthlyData.reduce((sum, m) => sum + parseFloat(m.paid_amount), 0);
//             const totalDue = monthlyData.reduce((sum, m) => sum + parseFloat(m.due_salary), 0);
//             const totalSalary = emp.base_salary * months.length;

//             deptObj.employees.push({
//                 name: emp.first_name,
//                 salary_status: monthlyData,
//                 final_salary_summary: {
//                     total_salary: totalSalary.toFixed(2),
//                     total_paid: totalPaid.toFixed(2),
//                     total_due: totalDue.toFixed(2)
//                 }
//             });
//         }

//         result.push(deptObj);
//     }

//     return result;
// };

// module.exports = {
//     getDepartmentWiseSalaries
// };


const { Department, Employee, Salary, sequelize, EmployeeAttendence } = require('../models');
const moment = require('moment');
const { Op, fn, col, literal, where } = require("sequelize");
const { employeeRepositories } = require('../repositories/employe.repo');
const { salaryRepositories } = require('../repositories/Salary.repo');
const EmployeeAttendanceRepository = require('../repositories/EmployeeAttendance.repo');
const customError = require('../utils/error.handler');
const { departmentRepositories } = require('../repositories/department.repo');
const employeeRepositorie = new employeeRepositories()
const salaryRepositorie = new salaryRepositories()
const departmentRepositorie = new departmentRepositories()


const getDepartmentWiseSalaries = {
    // getsalary: async (department_name) => {
    //     const departments = await Department.findAll({
    //         where: {
    //             name: {
    //                 [Op.iLike]: `%${department_name}%`
    //             }
    //         }
    //     });

    //     const departmentIds = departments.map(d => d.id);

    //     const allAttendanceRecords = await EmployeeAttendanceRepository.findAll({});
    //     const allEmployees = await Employee.findAll({
    //         where: {
    //             department: {
    //                 [Op.overlap]: departmentIds
    //             },
    //             status: {
    //                 [Op.iLike]: 'active'
    //             }
    //         }
    //     });

    //     function dateOnly(d) {
    //         const date = new Date(d);
    //         return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    //     }

    //     function daysInMonth(year, month) {
    //         return new Date(year, month + 1, 0).getDate();
    //     }

    //     function countSundays(year, month, startDate, endDate) {
    //         let sundays = 0;
    //         const days = daysInMonth(year, month);
    //         for (let i = 1; i <= days; i++) {
    //             const d = new Date(year, month, i);
    //             if (d.getDay() === 0 && d >= startDate && d <= endDate) sundays++;
    //         }
    //         return sundays;
    //     }

    //     const departmentSalarySummary = [];

    //     for (const dept of departments) {
    //         const deptId = dept.id;

    //         const deptEmployees = allEmployees.filter(emp =>
    //             emp.department.includes(deptId)
    //         );

    //         const deptResults = await Promise.all(deptEmployees.map(async emp => {
    //             const salaryRecord = await salaryRepositorie.findOneWithmodel({
    //                 where: { emp_id: emp.id },
    //                 order: [['from_date', 'DESC']]
    //             });

    //             const startDate = dateOnly(salaryRecord?.from_date || emp.joining_date);

    //             let endDate;
    //             const empAttendances = allAttendanceRecords.filter(rec => rec.employee_id === emp.id);
    //             if (empAttendances.length > 0) {
    //                 const maxAttendanceDate = new Date(Math.max(...empAttendances.map(r => new Date(r.attendence_date))));
    //                 endDate = dateOnly(maxAttendanceDate);
    //             } else {
    //                 endDate = dateOnly(new Date());
    //             }

    //             const empRecords = empAttendances.filter(record => {
    //                 const attDate = dateOnly(record.attendence_date);
    //                 return attDate >= startDate && attDate <= endDate;
    //             });

    //             const monthWise = {};

    //             empRecords.forEach(record => {
    //                 const date = dateOnly(record.attendence_date);
    //                 const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    //                 if (!monthWise[yearMonth]) {
    //                     monthWise[yearMonth] = { present: 0, half_day: 0, absent: 0 };
    //                 }

    //                 if (date.getDay() === 0) return;

    //                 if (record.status === 'present') monthWise[yearMonth].present++;
    //                 else if (record.status === 'half_day') monthWise[yearMonth].half_day++;
    //                 else if (record.status === 'absent') monthWise[yearMonth].absent++;
    //             });

    //             const salaryPerMonth = {};

    //             for (const yearMonth of Object.keys(monthWise)) {
    //                 const [year, monthStr] = yearMonth.split("-");
    //                 const yearNum = parseInt(year);
    //                 const monthNum = parseInt(monthStr) - 1;

    //                 const totalDays = daysInMonth(yearNum, monthNum);
    //                 const sundayCount = countSundays(yearNum, monthNum, startDate, endDate);
    //                 const workingDays = totalDays - sundayCount;
    //                 const perDaySalary = emp.salary / workingDays;

    //                 const data = monthWise[yearMonth];
    //                 const hasAnyWorking = data.present > 0 || data.half_day > 0;
    //                 const sundaySalary = hasAnyWorking ? (sundayCount * perDaySalary) : 0;

    //                 let total = (data.present * perDaySalary) + (data.half_day * perDaySalary * 0.5);

    //                 if (total > emp.salary) total = emp.salary;

    //                 salaryPerMonth[yearMonth] = {
    //                     total_salary: total,
    //                 };
    //                 console.log(`Employee ID: ${emp.id}, MonthWise Salary:`, salaryPerMonth);

    //             }

    //             return salaryPerMonth;
    //         }));

    //         const monthWiseTotal = {};
    //         for (const empResult of deptResults) {
    //             for (const [month, val] of Object.entries(empResult)) {
    //                 if (!monthWiseTotal[month]) {
    //                     monthWiseTotal[month] = 0;
    //                 }
    //                 monthWiseTotal[month] += val.total_salary;
    //             }
    //         }

    //         const totalMonthlySalary = Object.values(monthWiseTotal).reduce((sum, val) => sum + val, 0);

    //         departmentSalarySummary.push({
    //             department_id: dept.id,
    //             department_name: dept.name,
    //             total_employees: deptEmployees.length,
    //             monthly_salary: +totalMonthlySalary.toFixed(2)  // rounded to 2 decimal places
    //         });
    //         console.log(`Department: ${dept.name}, Monthly Salary Total:`, monthWiseTotal);
    //     }
    //     const totalMonthlySalaryAllDepartments = departmentSalarySummary.reduce((sum, dept) => sum + dept.monthly_salary, 0);

    //     return {
    //         total_monthly_salary: +totalMonthlySalaryAllDepartments.toFixed(2),
    //         departments: departmentSalarySummary,
    //     };
    // }


//     getsalary: async (department_name) => {
//         const departments = await Department.findAll({
//             where: {
//                 name: {
//                     [Op.iLike]: `%${department_name}%`
//                 }
//             }
//         });

//         const departmentIds = departments.map(d => d.id);

//         const allAttendanceRecords = await EmployeeAttendanceRepository.findAll({});
//         const allEmployees = await Employee.findAll({
//             where: {
//                 department: {
//                     [Op.overlap]: departmentIds
//                 },
//                 status: {
//                     [Op.iLike]: 'active'
//                 }
//             }
//         });

//         function dateOnly(d) {
//             const date = new Date(d);
//             return new Date(date.getFullYear(), date.getMonth(), date.getDate());
//         }

//         function daysInMonth(year, month) {
//             return new Date(year, month + 1, 0).getDate();
//         }

//         function countSundays(year, month, startDate, endDate) {
//             let sundays = 0;
//             const days = daysInMonth(year, month);
//             for (let i = 1; i <= days; i++) {
//                 const d = new Date(year, month, i);
//                 if (d.getDay() === 0 && d >= startDate && d <= endDate) sundays++;
//             }
//             return sundays;
//         }

//         const departmentSalarySummary = [];

//         for (const dept of departments) {
//             const deptId = dept.id;

//             const deptEmployees = allEmployees.filter(emp =>
//                 emp.department.includes(deptId)
//             );
//    console.log("============================================");
//         console.log("Department ID:", deptId);
//         console.log("Department Name:", dept.name);

//         // ✅ 🔎 Console employees in that department with id and name
//         console.log("Employees in this department:");
//         deptEmployees.forEach(emp => {
//             console.log("Employee ID:", emp.id, "| Employee Name:", emp.first_name);
//         });

//         // ✅ 🔎 Console total employees count
//         console.log("Total employees in department:", deptEmployees.length);
//         console.log("============================================");

        
//             const deptResults = await Promise.all(deptEmployees.map(async emp => {
//                 const salaryRecord = await salaryRepositorie.findOneWithmodel({
//                     where: { emp_id: emp.id },
//                     order: [['from_date', 'DESC']]
//                 });

//                 const joiningDate = dateOnly(emp.joining_date);
//                 const startDate = dateOnly(salaryRecord?.from_date || emp.joining_date);
//                 const today = dateOnly(new Date());

//                 const empAttendances = allAttendanceRecords.filter(rec => rec.employee_id === emp.id);

//                 const monthWise = {};

//                 // Loop through all months from joining/start to today
//                 let current = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
//                 while (current <= today) {
//                     const yearMonth = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
//                     monthWise[yearMonth] = { present: 0, half_day: 0, absent: 0 };

//                     current.setMonth(current.getMonth() + 1);
//                 }

//                 // Process attendance records
//                 empAttendances.forEach(record => {
//                     const date = dateOnly(record.attendence_date);
//                     const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

//                     if (!monthWise[yearMonth]) {
//                         monthWise[yearMonth] = { present: 0, half_day: 0, absent: 0 };
//                     }

//                     if (date.getDay() === 0) return;

//                     if (record.status === 'present') monthWise[yearMonth].present++;
//                     else if (record.status === 'half_day') monthWise[yearMonth].half_day++;
//                 });

//                 const salaryPerMonth = {};

//                 for (const yearMonth of Object.keys(monthWise)) {
//                     const [year, monthStr] = yearMonth.split("-");
//                     const yearNum = parseInt(year);
//                     const monthNum = parseInt(monthStr) - 1;

//                     const monthStart = new Date(yearNum, monthNum, 1);
//                     const monthEnd = new Date(yearNum, monthNum + 1, 0);

//                     // Adjust effective start and end dates
//                     const effectiveStart = joiningDate > monthStart ? joiningDate : monthStart;
//                     const effectiveEnd = today < monthEnd ? today : monthEnd;

//                     // If start is after end, skip
//                     if (effectiveStart > effectiveEnd) continue;

//                     const totalDays = Math.ceil((effectiveEnd - effectiveStart) / (1000 * 60 * 60 * 24)) + 1;

//                     // Count Sundays only within effective dates
//                     let sundayCount = 0;
//                     for (let d = new Date(effectiveStart); d <= effectiveEnd; d.setDate(d.getDate() + 1)) {
//                         if (d.getDay() === 0) sundayCount++;
//                     }

//                     const workingDays = totalDays - sundayCount;

//                     const data = monthWise[yearMonth];
//                     const perDaySalary = emp.salary / (workingDays > 0 ? workingDays : 1);

//                     const hasAnyAttendance = data.present > 0 || data.half_day > 0;

//                     // If no attendance records for this month, mark all working days as absent
//                     if (!hasAnyAttendance) {
//                         data.absent = workingDays;
//                     } else {
//                         const absentRaw = workingDays - (data.present + data.half_day);
//                         data.absent = absentRaw < 0 ? 0 : absentRaw;
//                     }

//                     const sundaySalary = hasAnyAttendance ? (sundayCount * perDaySalary) : 0;

//                     let total = (data.present * perDaySalary) + (data.half_day * perDaySalary * 0.5) + sundaySalary;

//                     if (!hasAnyAttendance) total = 0;
//                     if (total > emp.salary) total = emp.salary;

//                     salaryPerMonth[yearMonth] = {
//                         total_salary: +total.toFixed(2),
//                     };

//                     // 🔎 Debug
//                     // console.log(`Employee ID: ${emp.id}, Month: ${yearMonth}, Present: ${data.present}, Half Day: ${data.half_day}, Absent: ${data.absent}, TotalSalary: ${total.toFixed(2)}`);
//                 }

//                 return salaryPerMonth;
//             }));

//             const monthWiseTotal = {};
//             for (const empResult of deptResults) {
//                 for (const [month, val] of Object.entries(empResult)) {
//                     if (!monthWiseTotal[month]) {
//                         monthWiseTotal[month] = 0;
//                     }
//                     monthWiseTotal[month] += val.total_salary;
//                 }
//             }

//             const totalMonthlySalary = Object.values(monthWiseTotal).reduce((sum, val) => sum + val, 0);

//             departmentSalarySummary.push({
//                 department_id: dept.id,
//                 department_name: dept.name,
//                 total_employees: deptEmployees.length,
//                 monthly_salary: +totalMonthlySalary.toFixed(2)  // rounded to 2 decimal places
//             });
//             // console.log(`Department: ${dept.name}, Monthly Salary Total:`, monthWiseTotal);
//         }

//         const totalMonthlySalaryAllDepartments = departmentSalarySummary.reduce((sum, dept) => sum + dept.monthly_salary, 0);

//         return {
//             total_monthly_salary: +totalMonthlySalaryAllDepartments.toFixed(2),
//             departments: departmentSalarySummary,
//         };
//     }













    getsalary: async (department_name) => {
    console.log(`Fetching departments with name like: ${department_name}`);
    const departments = await Department.findAll({
        where: {
            name: { [Op.iLike]: `%${department_name}%` }
        }
    });
    console.log(`Found departments:`, departments.map(d => ({ id: d.id, name: d.name })));

    const departmentIds = departments.map(d => d.id);
    console.log(`Department IDs:`, departmentIds);

    const allAttendanceRecords = await EmployeeAttendanceRepository.findAll({});
    console.log(`All attendance records:`, allAttendanceRecords.map(r => ({
        id: r.id,
        employee_id: r.employee_id,
        status: r.status,
        attendence_date: r.attendence_date.toISOString ? r.attendence_date.toISOString() : r.attendence_date
    })));

    const allEmployees = await Employee.findAll({
        where: {
            department: { [Op.overlap]: departmentIds },
            status: { [Op.iLike]: 'active' }
        }
    });
    console.log(`All active employees in departments:`, allEmployees.map(e => ({
        id: e.id,
        name: e.first_name,
        department: e.department,
        joining_date: e.joining_date.toISOString(),
        salary: e.salary
    })));

    function dateOnly(d) {
        const date = new Date(d);
        return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
    }

    function daysInMonth(year, month) {
        return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    }

    const today = dateOnly(new Date());
    console.log(`Today (UTC): ${today.toISOString()}`);

    const employeeSalaries = new Map(); // Track unique employee salaries
    const departmentSalarySummary = [];

    // Process each employee only once
    const uniqueEmployees = new Map();
    allEmployees.forEach(emp => {
        if (!uniqueEmployees.has(emp.id)) {
            uniqueEmployees.set(emp.id, emp);
        }
        console.log(`Employee ${emp.id} departments: ${emp.department}`);
    });
    console.log(`Unique employees count: ${uniqueEmployees.size}`);

    const employeeResults = await Promise.all([...uniqueEmployees.values()].map(async emp => {
        console.log(`Processing employee ${emp.id} - ${emp.first_name}, Salary: ${emp.salary}, Joining: ${emp.joining_date.toISOString()}`);

        const empAttendances = allAttendanceRecords.filter(rec => rec.employee_id === emp.id);
        console.log(`Total attendance records for emp ${emp.id}: ${empAttendances.length}`);
        console.log(`Attendance for emp ${emp.id}:`, empAttendances.map(r => ({
            status: r.status,
            attendence_date: r.attendence_date.toISOString ? r.attendence_date.toISOString() : r.attendence_date
        })));

        if (empAttendances.length === 0) {
            console.log(`No attendance records for emp ${emp.id}, returning empty object`);
            return { empId: emp.id, salaryPerMonth: {} };
        }

        const salaryRecord = await salaryRepositorie.findOneWithmodel({
            where: { emp_id: emp.id },
            order: [['to_date', 'DESC']]
        });
        console.log(`Last salary record for emp ${emp.id}:`, salaryRecord ? {
            from_date: salaryRecord.from_date?.toISOString(),
            to_date: salaryRecord.to_date?.toISOString(),
            amount: salaryRecord.amount
        } : 'None');

        const earliestAttendance = empAttendances.length > 0
            ? dateOnly(empAttendances.map(r => new Date(r.attendence_date)).sort((a, b) => a - b)[0])
            : null;
        console.log(`Earliest attendance for emp ${emp.id}:`, earliestAttendance ? earliestAttendance.toISOString() : 'None');

        const joiningDate = dateOnly(emp.joining_date);
        console.log(`Joining Date UTC: ${joiningDate.toISOString()}`);

        let startDate;
        if (salaryRecord && salaryRecord.to_date) {
            const lastPaidDate = dateOnly(salaryRecord.to_date);
            startDate = new Date(Date.UTC(lastPaidDate.getUTCFullYear(), lastPaidDate.getUTCMonth(), lastPaidDate.getUTCDate() + 1));
            console.log(`Start Date from salary record: ${startDate.toISOString()}`);
        } else {
            startDate = earliestAttendance && earliestAttendance < joiningDate ? earliestAttendance : joiningDate;
            console.log(`Start Date from earliest attendance or joining: ${startDate.toISOString()}`);
        }

        const filteredAttendances = empAttendances.filter(rec => dateOnly(rec.attendence_date) >= startDate);
        console.log(`Filtered attendances count for emp ${emp.id}: ${filteredAttendances.length}`);
        console.log(`Filtered attendances:`, filteredAttendances.map(r => ({
            status: r.status,
            attendence_date: r.attendence_date.toISOString ? r.attendence_date.toISOString() : r.attendence_date
        })));

        const monthWise = {};
        let current = new Date(Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), 1));
        while (current <= today) {
            const yearMonth = `${current.getUTCFullYear()}-${String(current.getUTCMonth() + 1).padStart(2, '0')}`;
            monthWise[yearMonth] = { present: 0, half_day: 0, absent: 0 };
            current.setUTCMonth(current.getUTCMonth() + 1);
        }
        console.log(`Months for emp ${emp.id}:`, Object.keys(monthWise));

        const attendanceDates = new Map();
        filteredAttendances.forEach(record => {
            const date = dateOnly(record.attendence_date);
            const yearMonth = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
            const dateKey = date.toISOString().slice(0, 10);
            const existingStatus = attendanceDates.get(dateKey);
            if (record.status === 'present') {
                attendanceDates.set(dateKey, 'present');
            } else if (record.status === 'half_day' && existingStatus !== 'present') {
                attendanceDates.set(dateKey, 'half_day');
            }
            if (!monthWise[yearMonth]) {
                monthWise[yearMonth] = { present: 0, half_day: 0, absent: 0 };
            }
        });

        Object.keys(monthWise).forEach(yearMonth => {
            const [year, monthStr] = yearMonth.split("-");
            const yearNum = parseInt(year);
            const monthNum = parseInt(monthStr) - 1;

            const counts = { present: 0, half_day: 0 };
            attendanceDates.forEach((status, dateKey) => {
                const date = new Date(dateKey);
                const attYM = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
                if (attYM === yearMonth) {
                    if (status === 'present') counts.present++;
                    else if (status === 'half_day') counts.half_day++;
                }
            });
            monthWise[yearMonth].present = counts.present;
            monthWise[yearMonth].half_day = counts.half_day;
            console.log(`Counts for emp ${emp.id}, month ${yearMonth}: present ${counts.present}, half_day ${counts.half_day}`);
        });

        const salaryPerMonth = {};
        for (const yearMonth of Object.keys(monthWise)) {
            console.log(`Calculating salary for emp ${emp.id}, month ${yearMonth}`);
            const [year, monthStr] = yearMonth.split("-");
            const yearNum = parseInt(year);
            const monthNum = parseInt(monthStr) - 1;

            const monthStart = new Date(Date.UTC(yearNum, monthNum, 1));
            console.log(`Month start: ${monthStart.toISOString()}`);
            const monthEnd = new Date(Date.UTC(yearNum, monthNum + 1, 0));
            console.log(`Month end: ${monthEnd.toISOString()}`);

            const effectiveStart = startDate > monthStart ? startDate : monthStart;
            console.log(`Effective start: ${effectiveStart.toISOString()}`);
            const effectiveEnd = today < monthEnd ? today : monthEnd;
            console.log(`Effective end: ${effectiveEnd.toISOString()}`);

            if (effectiveStart > effectiveEnd) {
                console.log(`Skipping month ${yearMonth}: effectiveStart > effectiveEnd`);
                continue;
            }

            const totalDays = Math.floor((effectiveEnd - effectiveStart) / (1000 * 60 * 60 * 24)) + 1;
            console.log(`Total days in period: ${totalDays}`);

            let totalSundays = 0;
            for (let d = new Date(effectiveStart); d <= effectiveEnd; d.setUTCDate(d.getUTCDate() + 1)) {
                if (d.getUTCDay() === 0) totalSundays++;
            }
            console.log(`Total Sundays: ${totalSundays}`);

            const workingDays = totalDays - totalSundays;
            console.log(`Working days: ${workingDays}`);

            const data = monthWise[yearMonth];
            const perDaySalary = emp.salary / daysInMonth(yearNum, monthNum);
            console.log(`Per day salary: ${perDaySalary.toFixed(2)}`);

            const absentRaw = workingDays - (data.present + data.half_day);
            data.absent = absentRaw < 0 ? 0 : absentRaw;
            console.log(`Absent days: ${data.absent}`);

            const presentSalary = data.present * perDaySalary;
            console.log(`Present salary: ${presentSalary.toFixed(2)}`);
            const halfDaySalary = data.half_day * perDaySalary * 0.5;
            console.log(`Half day salary: ${halfDaySalary.toFixed(2)}`);

            let totalSalary = presentSalary + halfDaySalary;
            console.log(`Total salary before cap: ${totalSalary.toFixed(2)}`);

            if (totalSalary > emp.salary) totalSalary = emp.salary;
            console.log(`Total salary after cap: ${totalSalary.toFixed(2)}`);

            if (data.present === 0 && data.half_day === 0) totalSalary = 0;
            console.log(`Final total salary for month: ${totalSalary.toFixed(2)}`);

            salaryPerMonth[yearMonth] = {
                total_salary: +totalSalary.toFixed(2),
                present: data.present,
                half_day: data.half_day,
                absent: data.absent
            };
            console.log(`Salary per month for ${yearMonth}:`, salaryPerMonth[yearMonth]);
        }

        console.log(`Final salary per month for emp ${emp.id}:`, salaryPerMonth);
        return { empId: emp.id, salaryPerMonth };
    }));

    // Map employee salaries to departments
    const departmentMonthWiseTotals = new Map();
    departments.forEach(dept => {
        departmentMonthWiseTotals.set(dept.id, {});
        console.log(`Initialized month-wise totals for dept ${dept.id} - ${dept.name}`);
    });

    employeeResults.forEach(result => {
        const emp = uniqueEmployees.get(result.empId);
        if (!emp) return;

        const empDepartments = emp.department.filter(d => departmentIds.includes(d));
        console.log(`Employee ${result.empId} belongs to departments: ${empDepartments}`);

        Object.entries(result.salaryPerMonth).forEach(([month, val]) => {
            empDepartments.forEach(deptId => {
                const deptTotals = departmentMonthWiseTotals.get(deptId);
                if (!deptTotals[month]) deptTotals[month] = 0;
                deptTotals[month] += val.total_salary;
                console.log(`Added ${val.total_salary} to dept ${deptId}, month ${month}`);
            });
        });
    });

    for (const dept of departments) {
        const deptId = dept.id;
        const deptEmployees = allEmployees.filter(emp => emp.department.includes(deptId));
        const monthWiseTotal = departmentMonthWiseTotals.get(deptId);
        console.log(`Month-wise total salary for dept ${dept.name}:`, monthWiseTotal);

        const totalMonthlySalary = Object.values(monthWiseTotal).reduce((sum, val) => sum + val, 0);
        console.log(`Total monthly salary for dept ${dept.name}: ${totalMonthlySalary.toFixed(2)}`);

        departmentSalarySummary.push({
            department_id: dept.id,
            department_name: dept.name,
            total_employees: deptEmployees.length,
            monthly_salary: +totalMonthlySalary.toFixed(2)
        });
        console.log(`Department summary:`, departmentSalarySummary[departmentSalarySummary.length - 1]);
    }

    // Calculate total salary across all departments using unique employee salaries
    const totalMonthlySalaryAllDepartments = [...employeeResults].reduce((sum, result) => {
        const empSalary = Object.values(result.salaryPerMonth).reduce((s, val) => s + val.total_salary, 0);
        console.log(`Employee ${result.empId} total salary: ${empSalary.toFixed(2)}`);
        return sum + empSalary;
    }, 0);
    console.log(`Total monthly salary across all departments: ${totalMonthlySalaryAllDepartments.toFixed(2)}`);

    const result = {
        total_monthly_salary: +totalMonthlySalaryAllDepartments.toFixed(2),
        departments: departmentSalarySummary
    };
    console.log(`Final API response:`, result);

    return result;
}

    ,









































    //     salerycount: async (departmentid, name, page = 1, limit = 10) => {
    //         page = parseInt(page) || 1;
    //         limit = parseInt(limit) || 10;
    //         const offset = (page - 1) * limit;
    //         const department = await Department.findByPk(departmentid);
    //         if (!department) throw new customError("Department not found");

    //         const employees = await employeeRepositorie.employeactive(name, departmentid, page, limit)

    //         const allAttendanceRecords = await EmployeeAttendanceRepository.findAll({});

    //         console.log('====================================');
    //         console.log(allAttendanceRecords);
    //         console.log('====================================');



    //         function dateOnly(d) {
    //             const date = new Date(d);
    //             return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    //         }

    //         function isSunday(date) {
    //             return date.getDay() === 0;
    //         }

    //         function countSundays(year, month) {
    //             let sundays = 0;
    //             const daysInMonth = new Date(year, month + 1, 0).getDate();
    //             for (let day = 1; day <= daysInMonth; day++) {
    //                 const date = new Date(year, month, day);
    //                 if (date.getDay() === 0) sundays++;
    //             }
    //             return sundays;
    //         }

    //         function daysInMonth(year, month) {
    //             return new Date(year, month + 1, 0).getDate();
    //         }

    //         const result = await Promise.all(employees.data.map(async emp => {
    //             const joiningDate = dateOnly(emp.joining_date);

    //             const salaryRecord = await salaryRepositorie.findOneWithmodel({
    //                 where: { emp_id: emp.id },
    //                 order: [['from_date', 'DESC']]
    //             });



    //             let startDate, endDate;

    //             if (salaryRecord) {
    //                 const lastToDate = dateOnly(salaryRecord.to_date);
    //                 startDate = new Date(lastToDate);
    //                 startDate.setDate(startDate.getDate() + 1);
    //                 endDate = dateOnly(new Date());
    //             } else {
    //                 startDate = dateOnly(emp.joining_date);
    //                 endDate = dateOnly(new Date());
    //             }


    //             const empRecords = allAttendanceRecords.filter(record => {
    //                 const attDate = dateOnly(record.attendence_date);
    //                 return record.employee_id === emp.id && attDate >= startDate && attDate <= endDate && attDate.getDay() !== 0;
    //             });

    //             if (emp.id === 41) {
    //                 console.log("✅ Employee ID 41 Present Dates (Final without Sundays):");
    //                 empRecords
    //                     .filter(r => r.status === 'present')
    //                     .forEach(r => {
    //                         const date = new Date(r.attendence_date);
    //                         console.log(date.toISOString().split('T')[0], "Day:", date.getDay());
    //                     });
    //             }


    //             const monthWiseAttendance = {};


    //             for (const ym in monthWiseAttendance) {
    //                 const obj = monthWiseAttendance[ym];
    //                 obj.present = obj.presentDates.size;
    //                 delete obj.presentDates;
    //             }

    //             const attendanceWithSalary = {};

    //             const months = [];
    //             let current = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    //             const today = new Date();

    //             while (current <= endDate) {
    //                 const ym = `${current.getFullYear()}-${(current.getMonth() + 1).toString().padStart(2, '0')}`;
    //                 months.push(ym);
    //                 current.setMonth(current.getMonth() + 1);
    //             }


    //             for (const yearMonth of months) {
    //                 const counts = { present: 0, half_day: 0 };

    //                 empRecords.forEach(r => {
    //                     const attDate = dateOnly(r.attendence_date);
    //                     const attYM = `${attDate.getFullYear()}-${(attDate.getMonth() + 1).toString().padStart(2, '0')}`;

    //                     if (attYM === yearMonth && attDate.getDay() !== 0) {
    //                         if (r.status === 'present') counts.present++;
    //                         else if (r.status === 'half_day') counts.half_day++;
    //                     }
    //                 });

    //                 const [year, monthStr] = yearMonth.split("-");
    //                 const yearNum = parseInt(year);
    //                 const monthNum = parseInt(monthStr) - 1;

    //                 const monthStart = moment(`${yearNum}-${monthStr}-01`).startOf('month').startOf('day').toDate();
    // const monthEnd = moment(`${yearNum}-${monthStr}-01`).endOf('month').endOf('day').toDate();

    // let start_date = monthStart;

    // if (monthStart < joiningDate && monthEnd >= joiningDate) {
    //   start_date = joiningDate;
    // } else if (monthStart < startDate && monthEnd >= startDate) {
    //   start_date = startDate;
    // }
    // console.log("👉 monthStart:", monthStart);
    // console.log("👉 monthEnd:", monthEnd);
    // console.log("👉 joiningDate:", joiningDate);
    // console.log("👉 startDate:", startDate);

    // const end_date = monthEnd > endDate ? endDate : monthEnd;


    //                 const totalDays = Math.ceil((end_date - start_date) / (1000 * 60 * 60 * 24)) + 1;

    //                 let totalSundays = 0;
    //                 for (let d = new Date(start_date); d <= end_date; d.setDate(d.getDate() + 1)) {
    //                     if (d.getDay() === 0) totalSundays++;
    //                 }

    //                 const workingDays = totalDays - totalSundays;

    //                 const perDaySalary = emp.salary / daysInMonth(yearNum, monthNum);

    //                 const absentRaw = workingDays - (counts.present + counts.half_day);
    //                 const absent = absentRaw < 0 ? 0 : absentRaw;

    //                 const hasAnyWorkingDayPresent = counts.present > 0 || counts.half_day > 0;
    //                 const sundaySalary = hasAnyWorkingDayPresent ? (totalSundays * perDaySalary) : 0;

    //                 let totalSalaryForMonth =
    //                     (counts.present * perDaySalary) +
    //                     (counts.half_day * perDaySalary * 0.5) +
    //                     sundaySalary;

    //                 if (!hasAnyWorkingDayPresent) {
    //                     totalSalaryForMonth = 0;
    //                 }

    //                 if (totalSalaryForMonth > emp.salary) {
    //                     totalSalaryForMonth = emp.salary;
    //                 }

    //                 attendanceWithSalary[yearMonth] = {
    //                     present: counts.present,
    //                     half_day: counts.half_day,
    //                     absent,
    //                     per_day_salary: perDaySalary.toFixed(2),
    //                     total_salary: hasAnyWorkingDayPresent
    //                         ? ((counts.present * perDaySalary) +
    //                             (counts.half_day * perDaySalary * 0.5) +
    //                             sundaySalary).toFixed(2)
    //                         : "0.00",
    //                     start_date: start_date.toISOString(),
    //                     end_date: end_date.toISOString()
    //                 };
    //             }





    //             const totalSalarySum = Object.values(attendanceWithSalary)
    //                 .reduce((acc, month) => acc + (parseFloat(month.total_salary) || 0), 0);

    //             const totalTransactions = await salaryRepositorie.count({
    //                 emp_id: emp.id
    //             });


    //             return {
    //                 id: emp.id,
    //                 name: emp.first_name,
    //                 salary: emp.salary,
    //                 joining_date: emp.joining_date,
    //                 status: emp.status,
    //                 img: emp.image_path,
    //                 total_salary: totalSalarySum.toFixed(2),
    //                 total_transactions: totalTransactions,
    //                 attendance_by_month: attendanceWithSalary
    //             };
    //         }));



    //         return {
    //             currentPage: employees.currentPage,
    //             totalRecords: employees.totalRecords,
    //             totalPages: employees.totalPages,
    //             page: employees.page,
    //             limit: employees.limit,
    //             employees: result
    //         };
    //     }






salerycount: async (departmentid, name, page = 1, limit = 10) => {
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    const offset = (page - 1) * limit;

    const department = await Department.findByPk(departmentid);
    if (!department) throw new customError("Department not found");

    const employees = await employeeRepositorie.employeactive(name, departmentid, page, limit);
    const allAttendanceRecords = await EmployeeAttendanceRepository.findAll({});

    console.log('All attendance records:', allAttendanceRecords.map(r => ({
        id: r.id,
        employee_id: r.employee_id,
        status: r.status,
        attendence_date: r.attendence_date.toISOString ? r.attendence_date.toISOString() : r.attendence_date
    })));

    function dateOnly(d) {
        const date = new Date(d);
        return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
    }

    function daysInMonth(year, month) {
        return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    }

    const result = await Promise.all(employees.data.map(async emp => {
        console.log(`Processing employee ${emp.id} - ${emp.first_name}`);
        console.log(`Employee joining date: ${emp.joining_date.toISOString()}`);
        console.log(`Employee salary: ${emp.salary}`);

        const joiningDate = dateOnly(emp.joining_date);
        console.log(`Joining Date UTC: ${joiningDate.toISOString()}`);

        const salaryRecord = await salaryRepositorie.findOneWithmodel({
            where: { emp_id: emp.id },
            order: [['to_date', 'DESC']]
        });

        console.log(`Last salary record for emp ${emp.id}:`, salaryRecord ? {
            from_date: salaryRecord.from_date?.toISOString(),
            to_date: salaryRecord.to_date?.toISOString(),
            amount: salaryRecord.amount
        } : 'None');

        const empRecords = allAttendanceRecords.filter(record => record.employee_id === emp.id);
        console.log(`Total attendance records for emp ${emp.id}: ${empRecords.length}`);

        const earliestAttendance = empRecords.length > 0
            ? dateOnly(empRecords.map(r => new Date(r.attendence_date)).sort((a, b) => a - b)[0])
            : null;
        console.log(`Earliest attendance for emp ${emp.id}:`, earliestAttendance ? earliestAttendance.toISOString() : 'None');

        const effectiveJoiningDate = earliestAttendance && earliestAttendance < joiningDate ? earliestAttendance : joiningDate;
        console.log(`Effective Joining Date for emp ${emp.id}: ${effectiveJoiningDate.toISOString()}`);

        let startDate, endDate;
        if (salaryRecord && salaryRecord.to_date) {
            const lastToDate = dateOnly(salaryRecord.to_date);
            startDate = new Date(Date.UTC(lastToDate.getUTCFullYear(), lastToDate.getUTCMonth(), lastToDate.getUTCDate() + 1));
            console.log(`Start Date from salary record: ${startDate.toISOString()}`);
        } else {
            startDate = effectiveJoiningDate;
            console.log(`Start Date from effective joining: ${startDate.toISOString()}`);
        }
        endDate = dateOnly(new Date());
        console.log(`End Date UTC: ${endDate.toISOString()}`);

        const filteredEmpRecords = empRecords.filter(record => {
            const attDate = dateOnly(record.attendence_date);
            return attDate >= startDate && attDate <= endDate;
        });
        console.log(`Filtered attendance records count for emp ${emp.id}: ${filteredEmpRecords.length}`);
        console.log(`Filtered attendance for emp ${emp.id}:`, filteredEmpRecords.map(r => ({
            status: r.status,
            attendence_date: r.attendence_date.toISOString ? r.attendence_date.toISOString() : r.attendence_date
        })));

        const months = [];
        let current = new Date(Date.UTC(effectiveJoiningDate.getUTCFullYear(), effectiveJoiningDate.getUTCMonth(), 1));
        while (current <= endDate) {
            const ym = `${current.getUTCFullYear()}-${(current.getUTCMonth() + 1).toString().padStart(2, '0')}`;
            months.push(ym);
            current = new Date(Date.UTC(current.getUTCFullYear(), current.getUTCMonth() + 1, 1));
        }
        console.log(`Months for emp ${emp.id}:`, months);

        const attendanceWithSalary = {};

        for (const yearMonth of months) {
            console.log(`Processing month ${yearMonth} for emp ${emp.id}`);

            const counts = { present: 0, half_day: 0 };
            const attendanceDates = new Map();

            filteredEmpRecords.forEach(r => {
                const attDate = dateOnly(r.attendence_date);
                const attYM = `${attDate.getUTCFullYear()}-${(attDate.getUTCMonth() + 1).toString().padStart(2, '0')}`;
                if (attYM === yearMonth) {
                    const dateKey = attDate.toISOString().slice(0, 10);
                    const existingStatus = attendanceDates.get(dateKey);
                    if (r.status === 'present') {
                        attendanceDates.set(dateKey, 'present');
                    } else if (r.status === 'half_day' && existingStatus !== 'present') {
                        attendanceDates.set(dateKey, 'half_day');
                    }
                }
            });

            attendanceDates.forEach(status => {
                if (status === 'present') counts.present++;
                else if (status === 'half_day') counts.half_day++;
            });
            console.log(`Counts for month ${yearMonth}: present ${counts.present}, half_day ${counts.half_day}`);

            const [year, monthStr] = yearMonth.split("-");
            const yearNum = parseInt(year);
            const monthNum = parseInt(monthStr) - 1;

            const monthStart = new Date(Date.UTC(yearNum, monthNum, 1));
            console.log(`Month start: ${monthStart.toISOString()}`);
            const monthEnd = new Date(Date.UTC(yearNum, monthNum + 1, 0));
            console.log(`Month end: ${monthEnd.toISOString()}`);

            let start_date = monthStart;
            if (monthStart < effectiveJoiningDate) start_date = effectiveJoiningDate;
            console.log(`Start date after effective joining check: ${start_date.toISOString()}`);
            if (monthStart < startDate) start_date = startDate;
            console.log(`Start date after startDate check: ${start_date.toISOString()}`);

            const end_date = monthEnd > endDate ? endDate : monthEnd;
            console.log(`End date: ${end_date.toISOString()}`);

            if (start_date > end_date) {
                console.log(`Skipping month ${yearMonth} for emp ${emp.id}: start_date ${start_date.toISOString()} > end_date ${end_date.toISOString()}`);
                continue;
            }

            const totalDaysInMonth = daysInMonth(yearNum, monthNum);
            console.log(`Total days in month: ${totalDaysInMonth}`);

            const totalDaysInPeriod = Math.floor((end_date - start_date) / (1000 * 60 * 60 * 24)) + 1;
            console.log(`Total days in period: ${totalDaysInPeriod}`);

            let totalSundays = 0;
            for (let d = new Date(start_date); d <= end_date; d.setUTCDate(d.getUTCDate() + 1)) {
                if (d.getUTCDay() === 0) totalSundays++;
            }
            console.log(`Total Sundays in period: ${totalSundays}`);

            const perDaySalary = emp.salary / totalDaysInMonth;
            console.log(`Per day salary: ${perDaySalary.toFixed(2)}`);

            const workingDays = totalDaysInPeriod - totalSundays;
            console.log(`Working days: ${workingDays}`);

            let absent;
            if (counts.present === 0 && counts.half_day === 0) {
                absent = workingDays;
            } else {
                const absentRaw = workingDays - (counts.present + counts.half_day);
                absent = absentRaw < 0 ? 0 : absentRaw;
            }
            console.log(`Absent days: ${absent}`);

            const presentSalary = counts.present * perDaySalary;
            console.log(`Present salary: ${presentSalary.toFixed(2)}`);

            const halfDaySalary = counts.half_day * perDaySalary * 0.5;
            console.log(`Half day salary: ${halfDaySalary.toFixed(2)}`);

            let totalSalaryForMonth = presentSalary + halfDaySalary;
            console.log(`Total salary before cap: ${totalSalaryForMonth.toFixed(2)}`);

            if (totalSalaryForMonth > emp.salary) totalSalaryForMonth = emp.salary;
            console.log(`Total salary after cap: ${totalSalaryForMonth.toFixed(2)}`);

            attendanceWithSalary[yearMonth] = {
                present: counts.present,
                half_day: counts.half_day,
                absent,
                per_day_salary: perDaySalary.toFixed(2),
                total_salary: totalSalaryForMonth.toFixed(2),
                start_date: start_date.toISOString().slice(0, 10),
                end_date: end_date.toISOString().slice(0, 10)
            };
            console.log(`Attendance with salary for month ${yearMonth}:`, attendanceWithSalary[yearMonth]);
        }

        const totalSalarySum = Object.values(attendanceWithSalary)
            .reduce((acc, month) => acc + (parseFloat(month.total_salary) || 0), 0);
        console.log(`Total salary sum for emp ${emp.id}: ${totalSalarySum.toFixed(2)}`);

        const totalTransactions = await salaryRepositorie.count({
            emp_id: emp.id
        });
        console.log(`Total transactions for emp ${emp.id}: ${totalTransactions}`);

        console.log(`Final return object for emp ${emp.id}:`);
        const returnObj = {
            id: emp.id,
            name: emp.first_name,
            salary: emp.salary,
            joining_date: joiningDate.toISOString().slice(0, 10),
            status: emp.status,
            img: emp.image_path,
            total_salary: totalSalarySum.toFixed(2),
            total_transactions: totalTransactions,
            attendance_by_month: attendanceWithSalary
        };
        console.log(returnObj);

        return returnObj;
    }));

    return {
        currentPage: employees.currentPage,
        totalRecords: employees.totalRecords,
        totalPages: employees.totalPages,
        page: employees.page,
        limit: employees.limit,
        employees: result
    };
}


    ,




































































    salerycreate: async (emp_id, from_date, to_date) => {

        const emidata = await employeeRepositorie.findOne({ id: emp_id });
        if (!emidata) throw new Error("Employee not found");

        const perDaySalary = emidata.salary / 30;

        const attendancedata = await EmployeeAttendanceRepository.findAll({

            employee_id: emp_id,
            attendence_date: {
                [Op.between]: [from_date, to_date],
            },
        });

        const dateList = [];
        let current = moment(from_date);
        const end = moment(to_date);

        while (current.isSameOrBefore(end)) {
            dateList.push(current.format("YYYY-MM-DD"));
            current.add(1, 'day');
        }

        let totalSalary = 0;
        let presentCount = 0;
        let halfDayCount = 0;
        let absentCount = 0;

        for (const date of dateList) {
            const record = attendancedata.find(att => att.attendence_date === date);
            if (!record) {
                absentCount++;
                continue;
            }
            if (record.status === "present") {
                presentCount++;
                totalSalary += perDaySalary;
            } else if (record.status === "half_day") {
                halfDayCount++;
                totalSalary += perDaySalary / 2;
            }
        }

        return {
            employeesid: emp_id,
            amount: totalSalary.toFixed(2),
            present: presentCount,
            halfday: halfDayCount,
            absent: absentCount,
            from_date,
            to_date


        };
    },


    
    salerycreateEmploye: async (emp_id, amount, from_date, to_date) => {
        const existingSalary = await salaryRepositorie.findOne({
            emp_id, from_date, to_date
        });
        const lastSalary = await salaryRepositorie.findOneOrderWies(
            { emp_id },
            {
                order: [["to_date", "DESC"]]

            });

        if (lastSalary) {
            const lastToDate = new Date(lastSalary.to_date);
            const newFromDate = new Date(from_date);

            if (newFromDate <= lastToDate) {
                throw new customError(
                    `From Date must be after last paid salary's to_date (${lastToDate.toISOString().slice(0, 10)}).`,
                    400
                );
            }
        }


        const fromDate = new Date(from_date);
        const toDate = new Date(to_date);
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);
        fromDate.setHours(0, 0, 0, 0);
        toDate.setHours(0, 0, 0, 0);

        if (fromDate > currentDate) {
            throw new customError("From Date should not be in the future.", 400);
        }

        if (toDate > currentDate) {
            throw new customError("To Date should not be greater than current date.", 400);
        }






        if (existingSalary) {
            return { message: "Salary already generated for this employee in this date range." }
        }


        const emidata = await employeeRepositorie.findOne({ id: emp_id });
        if (!emidata) throw new Error("Employee not found");

        const perDaySalary = emidata.salary / 30;

        const attendancedata = await EmployeeAttendanceRepository.findAll({
            employee_id: emp_id,
            attendence_date: {
                [Op.between]: [from_date, to_date],
            },
        });

        const dateList = [];
        let current = moment(from_date);
        const end = moment(to_date);

        while (current.isSameOrBefore(end)) {
            dateList.push(current.format("YYYY-MM-DD"));
            current.add(1, 'day');
        }

        let totalSalary = 0;
        let presentCount = 0;
        let halfDayCount = 0;
        let absentCount = 0;

        for (const date of dateList) {
            const record = attendancedata.find(att => att.attendence_date === date);
            if (!record) {
                absentCount++;
                continue;
            }
            if (record.status === "present") {
                presentCount++;
                totalSalary += perDaySalary;
            } else if (record.status === "half_day") {
                halfDayCount++;
                totalSalary += perDaySalary / 2;
            }
        }

        const originalAmount = parseFloat(amount);
        const savedData = await salaryRepositorie.create({
            emp_id,
            amount: originalAmount,
            present: presentCount,
            halfday: halfDayCount,
            absent: absentCount,
            from_date,
            to_date
        });

        return {
            success: true,
            message: "Salary created successfully"
        };
    },


    particularEmploye: async (emp_id, page = 1, limit = 10) => {
        const offset = (page - 1) * limit;

        const { rows: salaryList, count: totalCount } = await salaryRepositorie.searchData(
            { emp_id: emp_id },
            parseInt(limit),
            parseInt(offset)
        );

        const [employee] = await employeeRepositorie.findAll({
            id: emp_id
        });

        const formattedData = salaryList.map(salary => ({
            employeName: employee?.first_name,
            employeContactNumber: employee?.contact_number,
            amount: salary.amount,
            present: salary.present,
            absent: salary.absent,
            halfday: salary.halfday,
            from_date: salary.from_date,
            to_date: salary.to_date
        }));

        return {
            data: formattedData,
            pagination: {
                totalPages: Math.ceil(totalCount / limit),
                page,
                limit
            }
        };
    },

















































    upcomingsalery:
     async (employee_id) => {
    const employee = await employeeRepositorie.findOne({ id: employee_id });
    if (!employee) throw new Error("Employee not found");

    const lastSalaryRecord = await salaryRepositorie.findOneOrderWies(
        { emp_id: employee_id },
        { order: [["to_date", "DESC"]] }
    );

    const allSalaries = await salaryRepositorie.findAll({ emp_id: employee_id });

    console.table(allSalaries.map(s => ({
        from: s.from_date ? new Date(s.from_date).toISOString().slice(0, 10) : null,
        to: s.to_date ? new Date(s.to_date).toISOString().slice(0, 10) : null,
        totalSalary: s.amount,
    })));

    let attendanceAll = await EmployeeAttendanceRepository.findAll({ employee_id });
    console.log('====================================');
    console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%% :  : ", attendanceAll);
    console.log('====================================');

    const joiningDate = new Date(employee.joining_date);
    let startDate;

    if (lastSalaryRecord && lastSalaryRecord.to_date) {
        startDate = new Date(lastSalaryRecord.to_date);
        startDate.setDate(startDate.getDate() + 1);
    } else if (attendanceAll.length > 0) {
        const firstAttendance = attendanceAll
            .map(a => new Date(a.attendence_date))
            .sort((a, b) => a - b)[0];
        startDate = firstAttendance > joiningDate ? firstAttendance : joiningDate;
    } else {
        startDate = joiningDate;
    }

    // Group attendance by month
    const attendanceByMonth = {};
    attendanceAll.forEach(att => {
        const date = new Date(att.attendence_date);
        const y = date.getFullYear();
        const m = (date.getMonth() + 1).toString().padStart(2, "0");
        const key = `${y}-${m}`;
        if (!attendanceByMonth[key]) attendanceByMonth[key] = [];
        attendanceByMonth[key].push(att);
    });

    const result = [];

    for (const month in attendanceByMonth) {
        const [year, mon] = month.split("-").map(Number);
        const attendanceList = attendanceByMonth[month];

        // Set fromDate and toDate for the month
        const firstDayOfMonth = new Date(year, mon - 1, 1);
        const lastDayOfMonth = new Date(year, mon, 0);
        const fromDate = startDate > firstDayOfMonth ? new Date(startDate) : firstDayOfMonth;
        const toDate = lastDayOfMonth;

        // Calculate total days in the full month for perDaySalary
        const totalDaysInMonth = lastDayOfMonth.getDate();
        // Calculate total days in the period for attendance
        const totalDaysInPeriod = Math.floor((toDate - fromDate) / (1000 * 60 * 60 * 24)) + 1;

        // Use full month for perDaySalary calculation
        const perDaySalary = employee.salary / totalDaysInMonth;

        let present = 0;
        let half_day = 0;
        const attendanceDates = new Map();

        // Map attendance records
        attendanceList.forEach(a => {
            const dateKey = new Date(a.attendence_date).toDateString();
            const existingStatus = attendanceDates.get(dateKey);

            if (a.status === "present") {
                attendanceDates.set(dateKey, "present");
            } else if (a.status === "half_day" && existingStatus !== "present") {
                attendanceDates.set(dateKey, "half_day");
            }
        });

        // Count present and half_day
        attendanceDates.forEach(status => {
            if (status === "present") present += 1;
            else if (status === "half_day") half_day += 1;
        });

        // Calculate absent days
        let absent = totalDaysInPeriod - (present + half_day);
        if (absent < 0) absent = 0;

        // Calculate salary
        const fullSalary = present * perDaySalary;
        const halfSalary = half_day * (perDaySalary / 2);
        let totalSalary = fullSalary + halfSalary;
        if (totalSalary > employee.salary) totalSalary = employee.salary;

        result.push({
            month,
            from: fromDate.toISOString().slice(0, 10),
            to: toDate.toISOString().slice(0, 10),
            totalDays: totalDaysInPeriod,
            present,
            half_day,
            absent,
            perDaySalary: perDaySalary.toFixed(2),
            totalSalary: totalSalary.toFixed(2),
            employeeName: employee.first_name
        });
    }

    // Handle months with no attendance (mark as absent)
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    const startYear = startDate.getFullYear();
    const startMonth = startDate.getMonth() + 1;

    for (let y = startYear; y <= currentYear; y++) {
        const startM = y === startYear ? startMonth : 1;
        const endM = y === currentYear ? currentMonth : 12;

        for (let m = startM; m <= endM; m++) {
            const monthKey = `${y}-${m.toString().padStart(2, "0")}`;
            if (!attendanceByMonth[monthKey]) {
                const firstDayOfMonth = new Date(y, m - 1, 1);
                const lastDayOfMonth = new Date(y, m, 0);
                const fromDate = startDate > firstDayOfMonth ? new Date(startDate) : firstDayOfMonth;
                const toDate = lastDayOfMonth;

                const totalDaysInMonth = lastDayOfMonth.getDate();
                const totalDaysInPeriod = Math.floor((toDate - fromDate) / (1000 * 60 * 60 * 24)) + 1;
                const perDaySalary = employee.salary / totalDaysInMonth;

                result.push({
                    month: monthKey,
                    from: fromDate.toISOString().slice(0, 10),
                    to: toDate.toISOString().slice(0, 10),
                    totalDays: totalDaysInPeriod,
                    present: 0,
                    half_day: 0,
                    absent: totalDaysInPeriod,
                    perDaySalary: perDaySalary.toFixed(2),
                    totalSalary: "0.00",
                    employeeName: employee.first_name
                });
            }
        }
    }

    return result.sort((a, b) => a.month.localeCompare(b.month));
}





};


module.exports = { getDepartmentWiseSalaries };