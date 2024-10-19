'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Messages', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      roomNumber: {
        type: Sequelize.STRING,
        allowNull: false
      },
      sender_id: {
        type: Sequelize.STRING,
        allowNull: false
      },
      message_text: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      timestamp: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: false
      },
      read: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      }
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Messages')
  }
}
