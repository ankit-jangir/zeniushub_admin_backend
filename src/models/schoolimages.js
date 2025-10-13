'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class SchoolImage extends Model {
    static associate(models) {
      // define association here if needed
    }
  }

  SchoolImage.init(
    {
      school_name: {
        type: DataTypes.STRING,
        allowNull: false,

      },
      school_description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      image_path: {
        type: DataTypes.STRING,
        allowNull: false,

      },
    },
    {
      sequelize,
      modelName: 'SchoolImage',
      tableName: 'SchoolImages',
      underscored: true,
      timestamps: true,
    }
  );

  return SchoolImage;
};
