'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('students', 'father_contact_no', {
      type: Sequelize.STRING,
      allowNull: true,
      unique: false
    });

    await queryInterface.changeColumn('students', 'mother_contact_no', {
      type: Sequelize.STRING,
      allowNull: true,
      unique: false
    });

    await queryInterface.changeColumn('students', 'contact_no', {
      type: Sequelize.STRING,
      allowNull: true,
      unique: false
    });
  },

  async down(queryInterface, Sequelize) {
    
  }
};
