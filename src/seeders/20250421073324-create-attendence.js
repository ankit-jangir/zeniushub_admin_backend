'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const attendanceData = [
      {
        enrollment_id: '1234001',
        status: 'present',
        attendance_date: '2025-04-20',
        in_time: '09:00:00',
        out_time: '17:00:00',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        enrollment_id: '1234002',
        status: 'half day',
        attendance_date: '2025-04-20',
        in_time: '09:00:00',
        out_time: '13:00:00',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        enrollment_id: '1234003',
        status: 'present',
        attendance_date: '2025-04-20',
        in_time: '09:10:00',
        out_time: '17:10:00',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        enrollment_id: '1234004',
        status: 'half day',
        attendance_date: '2025-04-20',
        in_time: '10:00:00',
        out_time: '13:30:00',
        createdAt: new Date(),
        updatedAt: new Date()
      },
    ];

    await queryInterface.bulkInsert('attendances', attendanceData, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('attendances', null, {});
  }
};
