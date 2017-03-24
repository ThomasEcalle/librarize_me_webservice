"use strict";
const express = require("express")
const jwt = require('jsonwebtoken');

const models = require("../models");
let router = express.Router();
const User = models.User;


/******************************************
*             get all Users               *
*******************************************/
router.get("/",function(req, res, next){
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
    res.status(200);
    res.json(users);
  }).catch(next);
})



/******************************************
*             get one User                *
*******************************************/
router.get("/:user_id", function(req,res,next){
  User.find({
    where: {
      id: req.params.user_id
    }
  }).then(function(user){
    if(user){
      res.json(user);
    }
    res.status(200)
    res.json({
      "message": "No user found"
    });
  }).catch(next)
})



/******************************************
*             Update Pseudo               *
*******************************************/
router.put("/update/pseudo/:user_pseudo", function(req,res,next){
  if (req.user){
    let user = req.user;
    let newPseudo =  req.params.user_pseudo

    user.update({
    pseudo: newPseudo
    }).then(function() {
      res.status(200).send({
        result: 1,
        message: "Pseudo correctly updated"
      })
    }).catch(next);

  }
})


/******************************************
*             Update Email                *
*******************************************/
router.put("/update/email/:user_mail", function(req,res,next){
  if (req.user){
    let user = req.user;
    let newEmail =  req.params.user_mail
    user.update({
    email: newEmail
    }).then(function() {
      res.status(200).send({
        result: 1,
        message: "Email correctly updated"
      })
    }).catch(next);
  }
})



/******************************************
*             Update First name           *
*******************************************/
router.put("/update/firstname/:user_firstname", function(req,res,next){
  if (req.user){
    let user = req.user;
    let newFirstname =  req.params.user_firstname

    user.update({
    firstname: newFirstname
    }).then(function() {
      res.status(200).send({
        result: 1,
        message: "First name correctly updated"
      })
    }).catch(next);

  }
})



/******************************************
*             Update Last name            *
*******************************************/
router.put("/update/lastname/:user_lastname", function(req,res,next){
  if (req.user){
    let user = req.user;
    let newLastname =  req.params.user_lastname

    user.update({
    lastname: newLastname
    }).then(function() {
      res.status(200).send({
        result: 1,
        message: "Last name correctly updated"
      })
    }).catch(next);

  }
})



/******************************************
*             Update Phone number         *
*******************************************/
router.put("/update/phone/:user_phone", function(req,res,next){
  if (req.user){
    let user = req.user;
    let newPhone =  req.params.user_phone

    user.update({
    phone_number: newPhone
    }).then(function() {
      res.status(200).send({
        result: 1,
        message: "Phone number correctly updated"
      })
    }).catch(next);

  }
})


/******************************************
*             Update Password             *
*******************************************/
router.put("/update/password/:user_password", function(req,res,next){
  if (req.user){
    let user = req.user;
    let newPassword =  req.params.user_password

    user.update({
    password: newPassword
    }).then(function() {
      res.status(200).send({
        result: 1,
        message: "Password correctly updated"
      })
    }).catch(next);

  }
})


/********************************************************************************************
*                                      FRIEND ZONE                                          *
********************************************************************************************/




/******************************************
*               Add friend                *
*******************************************/
router.post("/add/friend/:friend_id", function(req, res, next){
  if (req.user){
    let answer = {};
    let user = req.user;
    let friend_id = req.params.friend_id
    User.find({
      where: {
        id: friend_id
      }
    }).then(function(friend){
      if (friend){
        if(user.id == friend.id){
          res.json({
            result: 0,
            message: "You can't add yourself as a friend... it is a little bit ackward !"
          })
        }
        else {
          user.addFriend(friend).then(function(){
            res.send({
              result: 1,
              message: "Friend correctly added"
            })
          })
        }
      }
      else {
        res.json({
          result: 0,
          message: "You try to add as a friend a user that does not exist"
        })
      }

    })
  }
})




module.exports = router;
