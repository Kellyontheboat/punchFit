const Sequelize = require('sequelize');
module.exports = function (sequelize, DataTypes) {
  const Modules = sequelize.define('Modules', {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true,
      defaultValue: 0,
      autoIncrement: true
    },
    member_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    },
    section_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'Modules',
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
  });

  // Define associations here if needed
  Modules.associate = function (models) {
    Modules.belongsTo(models.Sections, { foreignKey: 'section_id', as: 'section' });
    Modules.belongsTo(models.Members, { foreignKey: 'member_id', as: 'member' });
  };

  return Modules;
};
