'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Remove the schedule_date column from the ScheduleItems table
    await queryInterface.removeColumn('ScheduleItems', 'schedule_date');
  },

  async down (queryInterface, Sequelize) {
    // Add the schedule_date column back to the ScheduleItems table
    await queryInterface.addColumn('ScheduleItems', 'schedule_date', {
      type: Sequelize.DATE,
      allowNull: true, // Adjust this as necessary
    });
  }
};
