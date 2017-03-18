'use strict';
module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define('User', {
    id: {
         type: DataTypes.BIGINT,
         primaryKey: true,
         autoIncrement: true
     },
     email: {
       type: DataTypes.STRING,
       allowNull: false
     },
     lastname: {
         type: DataTypes.STRING,
         allowNull: false
     },
     firstname: {
         type: DataTypes.STRING,
     },
     pseudo: {
         type: DataTypes.STRING,
         allowNull: false
     },
     password: {
       type: DataTypes.STRING,
       allowNull: false
     },
     phone_number: {
       type: DataTypes.STRING,
     }
   }, {
  paranoid: true,
  underscored: true,
  freezeTableName: true,
    classMethods: {
      associate: function (models) {
        User.belongsToMany(User, {
        as: 'Friends',
        foreignKey: 'friendId',
        through: 'friends'
      })
        }
    },
    //Methode pour l'instance d'un étudiant
    instanceMethods: {
      responsify: function(){
        let result = {};
        result.id = this.id;
        result.lastname = this.lastname;
        result.firstname = this.firstname;
        return result;
      }
    }
  });
  return User;
};
