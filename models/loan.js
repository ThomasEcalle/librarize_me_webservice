'use strict';
module.exports = function(sequelize, DataTypes) {
  var Loan = sequelize.define('Loan', {
    id: {
         type: DataTypes.BIGINT,
         primaryKey: true,
         autoIncrement: true
     },
     start_date: {
         type: DataTypes.DATE,
         allowNull: false
     },
     end_date: {
         type: DataTypes.DATE,
     }
   }, {
  paranoid: true,
  underscored: true,
  freezeTableName: true,
    classMethods: {
      associate: function(models) {
        // associations can be defined here
          Loan.belongsTo(models.User);
          Loan.belongsTo(models.Product);
      }
    },
    //Methode pour l'instance d'un étudiant
    instanceMethods: {
    }
  });
  return Loan;
};
