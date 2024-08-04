const Sequelize = require('sequelize')
module.exports = function (sequelize, DataTypes) {
  const Secondaryparts = sequelize.define('Secondaryparts', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    secondaryparts_name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    exercise_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Exercises',
        key: 'id'
      }
    }
  }, {
    sequelize,
    tableName: 'Secondaryparts',
    timestamps: false,
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
      }
    ]
  })

  // // Define associations
  // Secondarypart.associate = function (models) {
  //   Secondarypart.belongsTo(models.Exercises, { foreignKey: 'sections_id', as: 'section' });
  // };

  return Secondaryparts
}
