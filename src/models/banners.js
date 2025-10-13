'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Banner extends Model {
    static associate(models) {
      // Define associations if needed
    }
  }

  Banner.init(
    {
      image_path: {
        type: DataTypes.STRING,
        allowNull: false,

      },

    },
    {
      sequelize,
      modelName: 'Banner',
      tableName: 'Banners',
      underscored: true,
      timestamps: true,
    }
  );

  return Banner;
};