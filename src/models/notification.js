'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Notification extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Notification.belongsTo(models.Batches, { foreignKey: 'batchId', onUpdate: 'CASCADE'  });
      Notification.belongsTo(models.Course, {
        foreignKey: "course_id",
        onUpdate: "CASCADE", 
      });
    }
  }

  Notification.init(
    {
      head: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      batchId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'Batches',
          key: 'id'
        }
      },
      course_id:{
        type: DataTypes.INTEGER,
        allowNull:true,
        references:{
          model:"Course",
          key:'id'
        }

      },
      date: {  // New field
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,  // Default value as the current date and time
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      }
    },
    {
      sequelize,
      modelName: 'Notifications',
      tableName: 'Notifications',
      timestamps: true,  
      // underscored:true
    }
  );

  return Notification;
};
