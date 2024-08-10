const Sequelize = require('sequelize')
module.exports = function (sequelize, DataTypes) {
  const Schedules = sequelize.define('Schedules', {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    schedule_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    member_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Members',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    }
  }, {
    sequelize,
    tableName: 'Schedules',
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

  Schedules.associate = function (models) {
    Schedules.belongsTo(models.Members, { foreignKey: 'member_id', as: 'member' })
  }

  return Schedules
}
