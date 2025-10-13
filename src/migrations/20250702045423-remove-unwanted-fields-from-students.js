"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn('students', 'course_id');
    await queryInterface.removeColumn('students', 'batch_id');
    await queryInterface.removeColumn('students', 'invoice_status');
    await queryInterface.removeColumn('students', 'serial_no');
    await queryInterface.removeColumn('students', 'due_date');
    await queryInterface.removeColumn('students', 'count_emi');
    await queryInterface.removeColumn('students', 'discount_amount');
    await queryInterface.removeColumn('students', 'final_amount');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('students', 'course_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "courses",
        key: "id",
      },
    });

    await queryInterface.addColumn('students', 'batch_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "batches",
        key: "id",
      },
    });

    await queryInterface.addColumn('students', 'invoice_status', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('students', 'serial_no', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('students', 'due_date', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn('students', 'count_emi', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.addColumn('students', 'discount_amount', {
      type: Sequelize.FLOAT,
      allowNull: true,
    });

    await queryInterface.addColumn('students', 'final_amount', {
      type: Sequelize.FLOAT,
      allowNull: true,
      defaultValue: 0,
    });
  },
};
