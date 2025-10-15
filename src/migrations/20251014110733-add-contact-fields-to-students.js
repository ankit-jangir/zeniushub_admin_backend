'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('students', 'father_contact_no', {
      type: Sequelize.STRING,
      allowNull: true,
      unique: false
    });

    await queryInterface.addColumn('students', 'mother_contact_no', {
      type: Sequelize.STRING,
      allowNull: true,
      unique: false
    });


  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('students', 'father_contact_no');
    await queryInterface.removeColumn('students', 'mother_contact_no');

  }
};
