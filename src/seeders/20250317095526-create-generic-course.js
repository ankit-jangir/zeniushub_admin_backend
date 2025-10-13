'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('AccessControls', [
      { name: 'Dashboard', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Academic', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Accounts', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Support', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Students', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Attendance', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Team', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Leads', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Advertisement', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Setting', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Log out', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Validation', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Live Class', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Scheduled', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Quizzes', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Exams', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Assignment', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Batches', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Doubts', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Pre-recorded', createdAt: new Date(), updatedAt: new Date() }
    ], {});
  },


  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('AccessControls', null, {});
  }
};
