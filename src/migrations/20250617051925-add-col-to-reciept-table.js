'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add new columns
    // await queryInterface.addColumn('PaymentReceipts', 'amount', {
    //   type: Sequelize.FLOAT,
    //   allowNull: false,
    // });

    // await queryInterface.addColumn('PaymentReceipts', 'student_id', {
    //   type: Sequelize.INTEGER,
    //   allowNull: false,
    //   references: {
    //     model: 'students',
    //     key: 'id',
    //   },
    //   onUpdate: 'CASCADE',
    //   onDelete: 'CASCADE',
    // });

    // Remove emi_id column
    await queryInterface.removeColumn('PaymentReceipts', 'emi_id');
  },

  async down(queryInterface, Sequelize) {
    // Re-add emi_id (rollback)
    await queryInterface.addColumn('PaymentReceipts', 'emi_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Emis',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    // Remove added columns (rollback)
    // await queryInterface.removeColumn('PaymentReceipts', 'amount');
    // await queryInterface.removeColumn('PaymentReceipts', 'student_id');
  }
};
