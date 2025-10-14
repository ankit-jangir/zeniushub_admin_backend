'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Courses', 'date'); // Remove date column

    await queryInterface.changeColumn('Courses', 'course_type', {
      type: Sequelize.STRING,
      defaultValue:'offline',
      allowNull: true,  // Making it nullable
    }); 
    await queryInterface.changeColumn('Courses', 'discount_price', {
      type: Sequelize.FLOAT,
      defaultValue:0,
      allowNull: true,  // Making it nullable
    });
    await queryInterface.changeColumn('Courses','banner',{
      type: Sequelize.STRING,
      allowNull:true
    })  
  },

  async down (queryInterface, Sequelize) {
   
  }
};
