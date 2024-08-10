const Sequelize = require('sequelize')
module.exports = function (sequelize, DataTypes) {
  const ScheduleModules = sequelize.define('ScheduleModules', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    schedule_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    schedule_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'Schedules',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    module_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'Modules',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    }
  }, {
    sequelize,
    tableName: 'ScheduleModules',
    timestamps: false,
    indexes: [
      {
        name: 'PRIMARY',
        unique: true,
        using: 'BTREE',
        fields: [
          { name: 'id' }
        ]
      }
    ]
  })

  // Define associations
  ScheduleModules.associate = function (models) {
    ScheduleModules.belongsTo(models.Schedules, { foreignKey: 'schedule_id', as: 'schedule' })
    ScheduleModules.belongsTo(models.Modules, { foreignKey: 'module_id', as: 'module' })
  }

  return ScheduleModules
}
