'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Schedules', 'content', {
      type: Sequelize.STRING(255),
      allowNull: true
    })

    await queryInterface.addColumn('Schedules', 'video', {
      type: Sequelize.STRING(255),
      allowNull: true
    })

    await queryInterface.addColumn('Schedules', 'coachComment', {
      type: Sequelize.STRING(255),
      allowNull: true
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Schedules', 'content')
    await queryInterface.removeColumn('Schedules', 'video')
    await queryInterface.removeColumn('Schedules', 'coachComment')
  }
}
