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
  awsId: "AKIAINQMPU52EXNVKOMA",
  awsSecret: "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",
  awsTag: "node02-20"
});

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('Welcome in products part');
});

/******************************************
*             Create product              * -------- PROBLEM WITH PRICE BECAUSE DOUBLE AND MULTIPLE CURRENCIES POSSIBLE !!<!!>!!
*******************************************/

router.post("/create/:barcode", function(req, res, next){
    if(req.user){
        client.itemLookup({
          idType: 'UPC',
          itemId: req.params.barcode
        }).catch(function(err) {
            res.status(400).json({
                result: 0,
                message: "This product ID don't exist, try another."
            });
        }).then(function(results){
            let attributes = results[0].ItemAttributes[0];
            res.json(results);
            switch(attributes.Binding.join(';')){
                case "Blu-ray":
                case "DVD":
                    getJSONForDVD(attributes, req, function(){
                        res.status(200).json({
                            result: 1,
                            message: "The product has been well added to the database."
                        });
                    });
                case "CD":
                    // TO DO
                    break;
                case "BOOK":
                    // TO DO
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

function getJSONForDVD(attributes, req, next){
   models.Product.create({
        type: attributes.Binding.join(';'),
        bar_code: req.params.barcode,
        date: attributes.ReleaseDate.join(';'),
        price: attributes.ListPrice[0].FormattedPrice.join(';'),
        name: attributes.Title.join(';'),
        editor: attributes.Publisher.join(';'),
        genre: null,
        autor: attributes.Director.join(';'),
        actors: attributes.Actor.join(';'),
        user_id: req.user.id
   }).catch(function(err) {
       res.status(400).json({
            result: 0,
            message: "Parsing impossible from amazon result to daabase."
        });
   }).then(next());
}

/******************************************
*             Delete product              *
*******************************************/

router.put("/delete/:product_id", function(req, res, next){
    if(req.user){
        models.Product.destroy({where: {id: 1}}).then(function(arg){
           res.json("coucou"); 
        }).catch(next);
    }
});

/******************************************
*             Get my products             *
*******************************************/

/******************************************
*             Get a product               *
*******************************************/

/******************************************
*             Get products for user       *
*******************************************/
module.exports = router;