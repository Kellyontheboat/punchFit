'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('ScheduleItems', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      }, 
      member_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      exercise_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Exercises', 
          key: 'id'           
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      reps: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 12
      },
      sets: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 4 
      },
      weight: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 5.00
      },
      schedule_date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('Completed', 'Incomplete', 'No Record'),
        allowNull: false,
        defaultValue: 'No Record'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('ScheduleItems');
  }
};
