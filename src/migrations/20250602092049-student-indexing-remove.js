"use strict";

module.exports = {
  // Up is left empty intentionally, as indexes are already created in earlier migration
  up: async (queryInterface, Sequelize) => {
    // no-op
        await queryInterface.removeIndex("students", ["enrollment_id"]);
    await queryInterface.removeIndex("students", ["serial_no"]);
    await queryInterface.removeIndex("students", ["name"]);
    await queryInterface.removeIndex("students", ["father_name"]);
    await queryInterface.removeIndex("students", ["status"]);
    await queryInterface.removeIndex("students", ["rt"]);
    await queryInterface.removeIndex("students", ["batch_id"]);
    await queryInterface.removeIndex("students", ["course_id"]);
    
  },

  down: async (queryInterface, Sequelize) => {
    // Remove indexes from students table
    await queryInterface.removeIndex("students", ["enrollment_id"]);
    await queryInterface.removeIndex("students", ["serial_no"]);
    await queryInterface.removeIndex("students", ["name"]);
    await queryInterface.removeIndex("students", ["father_name"]);
    await queryInterface.removeIndex("students", ["status"]);
    await queryInterface.removeIndex("students", ["rt"]);
    await queryInterface.removeIndex("students", ["batch_id"]);
    await queryInterface.removeIndex("students", ["course_id"]);
  }
};
