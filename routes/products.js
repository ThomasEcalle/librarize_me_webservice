"use strict";
const express = require("express")
const jwt = require('jsonwebtoken');
const amazon = require('amazon-product-api');
const models = require("../models");
const constants = require('../constants');
let router = express.Router();
const User = models.User;
const Product = models.Product;
const Friendship = models.Friendship;
const client = amazon.createClient({
  awsId: "",
  awsSecret: "",
  awsTag: "node02-20"
});

/******************************************
*             Create product              * -------- PROBLEM WITH PRICE BECAUSE DOUBLE AND MULTIPLE CURRENCIES POSSIBLE !!<!!>!!
*******************************************/

router.post("/create/:code/:codetype", function(req, res, next){
    if(req.user){
        client.itemLookup({
          idType: req.params.codetype,
          itemId: req.params.code
        }).catch(function(err) {
            res.json(err);
        }).then(function(results){
            let attributes = results[0].ItemAttributes[0];
            switch(attributes.Binding.join(';')){ 
                // all possibilities behind
                case "Blu-ray":
                case "DVD":
                case "Audio CD":
                case "CD":
                case "Hardcover":    
                case "Paperback":
                    getJSON(attributes, req, function(){
                        res.status(200).json({
                            result: 1,
                            message: "The product has been well added to the database."
                        });
                    }, function(){
                        res.status(400).json({
                            result: 0,
                            message: "Parsing impossible from amazon result to database."
                        })
                    });
                    break;
                default: 
                    res.status(400).json({
                        result: 0,
                        message: "The item has been find but doesn't belong to the possible categories."
                    });
            }
        });
    }
});

function getJSON(attributes, req, next, error){
    let type = attributes.Binding ? attributes.Binding.join(';') : null;
    let date = attributes.ReleaseDate ? attributes.ReleaseDate.join(';') : 
        (attributes.PublicationDate ? attributes.PublicationDate.join(';') : null); 
    let price = attributes.ListPrice ?
        (attributes.ListPrice[0].FormattedPrice ? attributes.ListPrice[0].FormattedPrice.join(';') : null) : null;
    let name = attributes.Title ? attributes.Title.join(';') : null;
    let editor = attributes.Publisher ? attributes.Publisher.join(';') : 
        (attributes.Label ? attributes.Label.join(';') : null);
    let genre = null;
    let actors = attributes.Actor ? attributes.Actor.join(';') : null;
    let autor = attributes.Author ? attributes.Author.join(';') : 
        (attributes.Artist ? attributes.Artist.join(';') : 
        (attributes.Director ? attributes.Director.join(';') : null));
    
    models.Product.create({
        type: type,
        bar_code: req.params.codetype + ';' + req.params.code,
        date: date,
        price: price,
        name: name,
        editor: editor,
        genre: genre,
        autor: autor,
        actors: actors,
        user_id: req.user.id
    }).catch(error).then(next);
}

/******************************************
*             Delete product              *
*******************************************/

router.put("/delete/:product_id", function(req, res, next){
    if(req.user){
        Product.destroy({
            where:
            {
                user_id: req.user.id,
                id: req.params.product_id
            }
        }).then(function(resp){
            if(resp == 1)
                res.status(200).json({
                    result: 1,
                    message: "The product has been well deleted"
                });
            else if(resp == 0)
                res.status(400).json({
                    result: 0,
                    message: "The product hasn't been deleted, maybe the id does not exists or the product doesn't belong to the active user."
                });
            res.json(resp);
        }).catch(next);
    }
});

/******************************************
*             Get all products            *
*******************************************/

router.get("/search/", function(req, res, next){
    if(req.user){
        Product.findAll({
          where:
          {
            deleted_at: null
          }
        }).then(function(products){
          let result = [];
          for (let i in products){
            result.push({ id: products[i].id, bar_code: products[i].bar_code, user_id: products[i].user_id });
          }
          res.status(200).send(result);
        }).catch(next);
    }

})

/******************************************
*             Get a product               *
*******************************************/

router.get("/search/:id", function(req, res, next){
    if(req.user){
        Product.findOne({
          where:
          {
            id: req.params.id
          }
        }).then(function(product){
            if(product) res.status(200).send(product);
            res.status(400).json({
                result: 0,
                message: "ID not found."
            });
        }).catch(next);
    }  
})

/******************************************
*             Get my products             *
*******************************************/

router.get("/search/user/active", function(req, res, next){
    if(req.user){
        Product.findAll({
          where:
          {
            user_id: req.user.id,
            deleted_at: null
          }
        }).then(function(products){
          let result = [];
          for (let i in products){
            result.push({ id: products[i].id, bar_code: products[i].bar_code, user_id: products[i].user_id });
          }
          res.status(200).send(result);
        }).catch(next);
    }

})

/******************************************
*             Get products for user       *
*******************************************/

router.get("/search/user/:user_id", function(req, res, next){
    if(req.user){
        Product.findAll({
          where:
          {
            user_id: req.params.user_id,
            deleted_at: null
          }
        }).then(function(products){
          let result = [];
          for (let i in products){
            result.push({ id: products[i].id, bar_code: products[i].bar_code, user_id: products[i].user_id });
          }
          res.status(200).send(result);
        }).catch(next);
    }

})

module.exports = router;