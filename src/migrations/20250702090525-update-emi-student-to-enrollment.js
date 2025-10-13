'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Emis', 'enrollment_id', {
  type: Sequelize.INTEGER,
  allowNull: true,
  // defaultValue: 0 ,
  references: {
    model: 'Student_Enrollments',
    key: 'id'
  },
  onUpdate: 'CASCADE',
  onDelete: 'CASCADE'
});
;
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Emis', 'enrollment_id');
  }
};
