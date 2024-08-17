module.exports = function (sequelize, DataTypes) {
  const ScheduleItems = sequelize.define('ScheduleItems', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    schedule_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'Schedules',
        key: 'id'
      }
    },
    exercise_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Exercises',
        key: 'id'
      }
    },
    section_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Sections',
        key: 'id'
      }
    },
    reps: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 12
    },
    sets: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 4
    },
    weight: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 5.00
    },
    status: {
      type: DataTypes.ENUM('Completed', 'Incomplete', 'No Record'),
      allowNull: false,
      defaultValue: 'No Record'
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    }
  }, {
    sequelize,
    tableName: 'ScheduleItems',
    timestamps: true,
    indexes: [
      {
        name: 'PRIMARY',
        unique: true,
        using: 'BTREE',
        fields: [
          { name: 'id' }
        ]
      },
      {
        name: 'exercise_id',
        using: 'BTREE',
        fields: [
          { name: 'exercise_id' }
        ]
      },
      {
        name: 'section_id',
        using: 'BTREE',
        fields: [
          { name: 'section_id' }
        ]
      }
    ]
  })

  ScheduleItems.associate = function (models) {
    ScheduleItems.belongsTo(models.Sections, { foreignKey: 'section_id', as: 'section' })
    ScheduleItems.belongsTo(models.Schedules, { foreignKey: 'schedule_id', as: 'schedule' })
    ScheduleItems.belongsTo(models.Exercises, { foreignKey: 'exercise_id', as: 'exercise' })
  }

  return ScheduleItems
}
