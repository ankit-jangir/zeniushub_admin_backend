"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Employees", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      first_name: {
        // Update to snake_case
        type: Sequelize.STRING,
        allowNull: false,
      },
      highest_qualification: {
        // Update to snake_case
        type: Sequelize.STRING,
        allowNull: false,
      },
      institution_name: {
        // Update to snake_case
        type: Sequelize.STRING,
        allowNull: false,
      },
      contact_number: {
        // Update to snake_case
        type: Sequelize.STRING,
        allowNull: false,
      },
      emergency_number: {
        // Update to snake_case
        type: Sequelize.STRING,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      date_of_birth: {
        // Update to snake_case
        type: Sequelize.DATE,
        allowNull: false,
      },

      // Address Details
      residential_address: {
        // Update to snake_case
        type: Sequelize.STRING,
        allowNull: false,
      },
      district: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      state: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      start_time: {
        // Update to snake_case
        type: Sequelize.TIME,
        allowNull: true,
      },
      end_time: {
        // Update to snake_case
        type: Sequelize.TIME,
        allowNull: true,
      },
      pincode: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      permanent_address: {
        // Update to snake_case
        type: Sequelize.STRING,
        allowNull: false,
      },
      permanent_district: {
        // Update to snake_case
        type: Sequelize.STRING,
        allowNull: false,
      },
      permanent_state: {
        // Update to snake_case
        type: Sequelize.STRING,
        allowNull: false,
      },
      permanent_pincode: {
        // Update to snake_case
        type: Sequelize.STRING,
        allowNull: false,
      },

      // Control Details
      department: {
        type: Sequelize.ARRAY(Sequelize.INTEGER),
        allowNull: false,
      },

      // CTC Management
      salary: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      joining_date: {
        // Update to snake_case
        type: Sequelize.DATE,
        allowNull: false,
      },

      // Bank Account Details
      account_number: {
        // Update to snake_case
        type: Sequelize.STRING,
        allowNull: false,
      },
      ifsc_code: {
        // Update to snake_case
        type: Sequelize.STRING,
        allowNull: false,
      },
      account_holder_name: {
        // Update to snake_case
        type: Sequelize.STRING,
        allowNull: false,
      },
      fcm_key: {
        // Update to snake_case
        type: Sequelize.STRING,
        allowNull: true,
      },
      socket_id: {
        // Update to snake_case
        type: Sequelize.STRING,
        allowNull: true,
      },

      created_at: {
        // Update to snake_case
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        // Update to snake_case
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Employees");
  },
};
