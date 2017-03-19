"use strict";
const express = require("express")
const jwt = require('jsonwebtoken');

const models = require("../models");
let router = express.Router();

const User = models.User;


// get all users
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
/*
* get one user
*/
router.get("/:user_id", function(req,res,next){
  User.find({
    where: {
      id: req.params.user_id
    }
  }).then(function(user){
    res.status(200)
    res.json(user);
  }).catch(next)
})


module.exports = router;
