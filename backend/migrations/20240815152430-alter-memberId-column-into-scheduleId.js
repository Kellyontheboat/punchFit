'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Rename the column member_id to schedule_id
    await queryInterface.renameColumn('ScheduleItems', 'member_id', 'schedule_id')

    // Alter the column data type to bigint unsigned
    await queryInterface.changeColumn('ScheduleItems', 'schedule_id', {
      type: Sequelize.BIGINT.UNSIGNED,
      allowNull: false
    })
  },

  async down (queryInterface, Sequelize) {
    // Revert the column name back to member_id
    await queryInterface.renameColumn('ScheduleItems', 'schedule_id', 'member_id')

    // Revert the column data type back to int
    await queryInterface.changeColumn('ScheduleItems', 'member_id', {
      type: Sequelize.INTEGER,
      allowNull: false
    })
  }
}
