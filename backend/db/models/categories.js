const common = require('../../helpers/common');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('categories', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(60),
      allowNull: false
    },
    image: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    addedBy: {
      type: DataTypes.INTEGER(2),
      allowNull: false
    },
    createdAt: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: common.timestamp()
    },
    updatedAt: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: common.timestamp()
    },
  }, {
    tableName: 'categories',
    timestamps: false
  });
};
