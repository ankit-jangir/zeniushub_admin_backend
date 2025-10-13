const { Op, fn, col, Sequelize } = require("sequelize");
const { EmployeeAttendence, Employee } = require('../models');
const { CrudRepository } = require("./crud.repo");
const { email } = require("zod/v4");
const customError = require("../utils/error.handler");

class EmployeeAttendanceRepository extends CrudRepository {
    constructor() {
        super(EmployeeAttendence);
    }

    /**
     * Marks or updates the attendance status of an employee for a given date.
     * @param {number} employee_id - ID of the employee.
     * @param {string|Date} attendence_date - Date of the attendance (YYYY-MM-DD format or Date object).
     * @param {string} status - Attendance status (e.g., 'Present', 'Absent').
     * @returns {Promise<object>} - The created or updated attendance record.
     */
    async markEmployeeAttendance(employee_id, attendence_date, status) {
        try {
            // 1. Check if employee is Active
            const employee = await Employee.findOne({ where: { id: employee_id, status: 'Active' } });

            if (!employee) {
                const msg = `Employee ${employee_id} is not Active. Skipping attendance.`;
                console.log(msg);
                return msg;
            }

            // 2. Try to find or create attendance record
            const [record, created] = await EmployeeAttendence.findOrCreate({
                where: {
                    employee_id,
                    attendence_date
                },
                defaults: {
                    status
                }
            });

            // 3. If already created, done
            if (created) {
                return `Attendance marked as ${status}`;
            }

            // 4. If already marked as same status, skip
            if (record.status === status) {
                const msg = `Employee ${employee_id} already marked as ${status} on ${attendence_date}. Skipping.`;
                console.log(msg);
                return msg;
            }

            // 5. Update only if status is different
            record.status = status;
            await record.save();

            return `Attendance updated to ${status}`;
        } catch (error) {
            console.error('Error marking employee attendance:', error);
            throw new customError('Failed to mark attendance');
        }
    }

    async employeseacrhing(attendance_date, first_name) {
        try {
            // ✅ Step 1: Default to today's date if attendance_date is not provided
            console.log("repo file code : ", attendance_date);

            if (!attendance_date) {
                const currentDate = new Date();
                attendance_date = currentDate.toISOString().split("T")[0];
            }
            console.log("👉 Searching for Attendance Date:", attendance_date);

            const today = new Date();
            const selectedDate = new Date(attendance_date);

            if (selectedDate > today) {
                throw new Error("Attendance date cannot be in the future.");
            }

            // ✅ Step 2: Fetch all active employees

            const whereClause = {
                status: 'Active',
            };

            // ✅ Filter by first name if provided
            if (first_name) {
                whereClause.first_name = {
                    [Op.iLike]: `%${first_name}%`, // Only works in Postgres
                    // [Op.substring]: first_name // Use this for other dialects like MySQL
                };
            }

            // ✅ Filter employees who joined on or before the attendance_date
            if (attendance_date) {
                whereClause.joining_date = {
                    [Op.lte]: new Date(attendance_date + 'T23:59:59.999Z') // ISO format (YYYY-MM-DD) works fine
                };
            }

            const employees = await Employee.findAll({
                where: whereClause,
                attributes: ["id", "first_name", "status", "joining_date", "email"],
            });


            if (employees.length === 0) {
                throw new Error("No active employees found.");
            }

            const activeEmployeeIds = employees.map(emp => emp.id);
            console.log(`✅ Found ${employees.length} Active Employees`);

            // ✅ Step 3: Fetch attendance records for these employees on the given date
            const attendances = await EmployeeAttendence.findAll({
                where: {
                    attendence_date: attendance_date,
                    employee_id: {
                        [Op.in]: activeEmployeeIds,
                    },
                },
                include: [{
                    model: Employee,
                    attributes: ["first_name", "joining_date", "status", "email"],
                }],
                attributes: ["employee_id", "status", "attendence_date", "in_time", "out_time"],
            });

            console.log(`📋 Attendance records found: ${attendances.length}`);

            // ✅ Step 4: Remove duplicate attendance records based on employee_id
            const uniqueAttendancesMap = new Map();
            attendances.forEach(a => {
                if (!uniqueAttendancesMap.has(a.employee_id)) {
                    uniqueAttendancesMap.set(a.employee_id, a.toJSON());
                }
            });
            const uniqueAttendances = Array.from(uniqueAttendancesMap.values());

            // ✅ Step 5: Identify employees who are absent
            const presentIds = new Set(uniqueAttendances.map(a => Number(a.employee_id)));

            const absentEmployees = employees.filter(emp => !presentIds.has(emp.id));

            const absentRecords = absentEmployees.map(emp => ({
                employee_id: emp.id,
                status: "absent",
                attendance_date,
                in_time: null,
                out_time: null,
                Employee: {
                    first_name: emp.first_name,
                    email: emp.email,
                    status: emp.status,
                    joining_date: emp.joining_date,
                },
            }));

            absentRecords.forEach(abs => {
                console.log(`❌ Absent: ${abs.Employee.first_name} (ID: ${abs.employee_id})`);
            });

            // ✅ Step 6: Merge unique attendance records and absent records
            const fullData = [
                ...uniqueAttendances,
                ...absentRecords,
            ];

            // ✅ Step 7: Calculate attendance summary
            const total = fullData.length;
            const present = fullData.filter(item => item.status.toLowerCase() === "present").length;
            const half_day = fullData.filter(item => item.status.toLowerCase() === "half_day" || item.status.toLowerCase() === "half-day").length;
            const absent = fullData.filter(item => item.status.toLowerCase() === "absent").length;

            console.log("📊 Final Summary =>", { total, present, half_day, absent });

            // ✅ Step 8: Return final response
            return {
                total,
                present,
                absent,
                half_day,
                data: fullData,
            };
        } catch (error) {
            console.error("🔥 Error in employeseacrhing:", error.message);
            throw error;
        }
    }

}

module.exports = new EmployeeAttendanceRepository();