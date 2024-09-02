module.exports = (sequelize, DataTypes) => {
  const Invitations = sequelize.define('Invitations', {
    schedule_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: 'schedule_id',
    },
    coach_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: 'coach_id',
    },
    student_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: 'student_id',
    },
    status: {
      type: DataTypes.ENUM('pending', 'accepted', 'rejected'),
      defaultValue: 'pending',
    }
  }, {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  Invitations.associate = (models) => {
    Invitations.belongsTo(models.Schedules, { as: 'schedule',foreignKey: 'schedule_id' });
    Invitations.belongsTo(models.Members, { as: 'coach', foreignKey: 'member_id' });
    Invitations.belongsTo(models.Members, { as: 'student', foreignKey: 'member_id' });
  };

  return Invitations;
};
