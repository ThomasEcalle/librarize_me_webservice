'use strict';
var emailValidator = require("email-validator");
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
        User.belongsToMany(User, { as: "Friends", through: "friendship"});
        }
    },
    //Methode pour l'instance d'un étudiant
    instanceMethods: {
      responsify: function(){
        let result = {};
        result.id = this.id;
        result.pseudo = this.pseudo;
        return result;
      },

      isValidPseudo: function(newPseudo, next){
        if(isNaN(newPseudo)){
          if(newPseudo.length >= 4){
            User.find({
              where: {
                pseudo: newPseudo
              }
            }).then(function(user){
              if(user){
                console.log("FOUND user with id " + user.id);
                next(false, "This pseudo already exist");
              }
              else {
                console.log("else statement la famille");
                next(true);
              }
            })
          }
          else {
            next(false, "Your pseudo must be longer than 4 characters");
          }
        }
        else {
          next(false, "Please enter a pseudo with letters");
        }
      },
      isValidEmail: function(newEmail, next){
        if(newEmail){
          emailValidator.validate_async(newEmail, function(err, isValidEmail) {
            if (isValidEmail){
              User.find({
                where: {
                  email: newEmail
                }
              }).then(function(user){
                if(user){
                  next(false, "This email is already used");
                }
                else {
                  next(true);
                }
              })
            }
            else{
              next(false, "This email is not a valid one");
            }
          });
        }
        else {
          next(false,"Please enter an email");
        }
      },
      isValidName: function(name, next){
        let num = false;
        if (name){
          for(let char of name){
            if (!isNaN(char)){
              next(false,"A name only contains characters");
            }
            next(true);
          }
        }
        else {
          next(false,"Please enter a valid name");
        }
      },
      isValidPhone: function(phone, next){
        if(isNaN(phone)){
          next(false, "Please enter a number without characters");
        }
        else {
          next(true);
        }
      },
      isValidPassword: function(password, next){
        if(password){
            if (password.length >= 8){
              let numberCounter = 0;
              let majCounter = 0;
              let minCaseCounter = 0;

              for (let letter of password){
                if (isNaN(letter)){
                  if(letter === letter.toUpperCase()){
                    majCounter++;
                  }
                  else {
                    minCaseCounter++;
                  }
                }
                else {
                  numberCounter++;
                }
              }
              if (numberCounter >= 2 && minCaseCounter >= 2 && majCounter >= 2){
                next(true);
              }
              else {
                next(false, "A password must contains 2 numbers, 2 min case characters and 2 maj case characters");
              }
            }
            else {
              next(false, "The password must be 8 characters long at least");
            }
        }
      }

    }
  });
  return User;
};
