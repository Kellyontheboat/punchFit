'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('ScheduleItems', 'section_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Sections',
        key: 'id'
      },
      after: 'exercise_id'
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('ScheduleItems', 'section_id')
  }
}
