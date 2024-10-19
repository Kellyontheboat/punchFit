module.exports = function (sequelize, DataTypes) {
  const Image = sequelize.define('Images', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    url: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    exercises_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Exercises',
        key: 'id'
      }
    }
  }, {
    sequelize,
    tableName: 'Images',
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
        name: 'exercises_id',
        using: 'BTREE',
        fields: [
          { name: 'exercises_id' }
        ]
      }
    ]
  })

  Image.associate = function (models) {
    Image.belongsTo(models.Exercises, { foreignKey: 'exercises_id' })
  }

  return Image
}
