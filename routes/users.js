"use strict";
const express = require("express")

const models = require("../models");
let router = express.Router();

const User = models.User;

router.post("/", function(req,res,next){
  let lastname = req.body.lastname;
  let firstname = req.body.firstname;
  let email = req.body.email;
  let pseudo = req.body.pseudo;
  let password = req.body.password;
  let phone = req.body.phone;
  User.create({
    lastname: lastname,
    firstname: firstname,
    email: email,
    pseudo: pseudo,
    password: password,
    phone_number: phone
  }).then(function(user){
    res.json(user);
  }).catch(next);
});

// Liste de ressource avec aps toutes les infos
router.get("/", function(req, res, next){
  let l = parseInt(req.query.limit) || 20;
  let o = parseInt(req.query.offset) || 0;
  let options = {
    limit: l,
    offset: o
  }

  let s = req.query.search;
  if(s != undefined){
    let where = {
      $or:{
        lastname: {
          $like: "%" + s + "%"
        },
        firstname: {
          $like: "%" + s + "%"
        }
      }

    }
    options.where = where
  }
  User.findAll(options).then(function(users){
    for (let i in users){
      users[i] = users[i].responsify();
    }
    res.json(users);
  }).catch(next);
})
//
// // ON recupere UNE ressource
// router.get("/:stud_id", function(req,res,next){
//   Student.find({
//     where: {
//       id: req.params.stud_id
//     },
//     include: [
//       models.School,
//       models.Project
//     ]
//   }).then(function(stud){
//     res.json(stud.responsify());
//   }).catch(next)
// })






module.exports = router;
