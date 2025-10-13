"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("students", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      course_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Courses",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      batch_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      enrollment_id: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      address: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      adhar_no: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      adhar_front_back: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      pancard_no: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      pancard_front_back: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      contact_no: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      father_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      mother_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      parent_adhar_no: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: false,
      },
      parent_adhar_front_back: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      parent_account_no: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      ifsc_no: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      count_emi: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      discount_amount: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      final_amount: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      type: {
        type: Sequelize.STRING,
        allowNull: true
      },
      due_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM("active", "inactive"),
        defaultValue: "active",
        allowNull: false,
      },
      invoice_status: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      socket_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      fcm_key: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      dob: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      serial_no: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      rt: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      gender: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      ex_school: {
        type: Sequelize.STRING,
        allowNull: true,
      },
    });

    // ✅ Indexing for better query performance
    await queryInterface.addIndex("students", ["enrollment_id"]);
    await queryInterface.addIndex("students", ["serial_no"]);
    await queryInterface.addIndex("students", ["name"]);
    await queryInterface.addIndex("students", ["father_name"]);
    await queryInterface.addIndex("students", ["status"]);
    await queryInterface.addIndex("students", ["rt"]);
    await queryInterface.addIndex("students", ["batch_id"]);
    await queryInterface.addIndex("students", ["course_id"]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("students"); // ✅ Just drop the table — no need to remove indexes manually
  },
};