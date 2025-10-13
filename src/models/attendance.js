module.exports = (sequelize, DataTypes) => {
  const Attendance = sequelize.define('Attendance', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    student_enrollment_id: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'Student_Enrollments', // Table name in DB (plural)
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    status: {
      type: DataTypes.ENUM('present', 'absent', 'half day'),
      allowNull: false,
    },
    attendance_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    in_time: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    out_time: {
      type: DataTypes.TIME,
      allowNull: true,
    },
  }, {
    modelName: "Attendance",
    tableName: 'attendances',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['student_enrollment_id', 'attendance_date'], // Corrected index field
      }
    ]
  });

  Attendance.associate = (models) => {
    Attendance.belongsTo(models.Student_Enrollment, {
      foreignKey: 'student_enrollment_id',
      as: 'Student_Enrollment',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
  };

  return Attendance;
};
