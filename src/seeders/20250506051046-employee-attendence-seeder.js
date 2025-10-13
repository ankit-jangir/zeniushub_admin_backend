"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const attendenceData = [
      {
        employee_id: 45,
        status: "present",
        attendence_date: "2025-05-06",
        in_time: "09:00:00",
        out_time: "17:00:00",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        employee_id: 46,
        status: "half_day",
        attendence_date: "2025-05-06",
        in_time: "09:30:00",
        out_time: "13:00:00",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        employee_id: 47,
        status: "present",
        attendence_date: "2025-05-06",
        in_time: "08:45:00",
        out_time: "17:15:00",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    await queryInterface.bulkInsert("EmployeeAttendences", attendenceData, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete(
      "EmployeeAttendences",
      {
        employee_id: [40, 41, 44],
        attendence_date: "2025-05-06",
      },
      {}
    );
  },
};
