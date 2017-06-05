'use strict';
module.exports = function(sequelize, DataTypes) {
  var Product = sequelize.define('Product', {
    id: {
         type: DataTypes.BIGINT,
         primaryKey: true,
         autoIncrement: true
     },
     type: {
         type: DataTypes.STRING,
         allowNull: false
     },
     bar_code: {
         type: DataTypes.STRING,
         allowNull: false
     },
     date: {
         type: DataTypes.DATE,
     },
     price: {
       type: DataTypes.DOUBLE,
     },
     name: {
       type: DataTypes.STRING,
     },
     editor: {
       type: DataTypes.STRING,
     },
     genre: {
       type: DataTypes.STRING,
     },
     autor: {
       type: DataTypes.STRING,
     },
     actors: {
       type: DataTypes.STRING,
     }
   }, {
  paranoid: true,
  underscored: true,
  freezeTableName: true,
    classMethods: {
      associate: function(models) {
        // associations can be defined here
          Product.belongsTo(models.User);
      }
    },
    //Methode pour l'instance d'un étudiant
    instanceMethods: {
    }
  });
  return Product;
};