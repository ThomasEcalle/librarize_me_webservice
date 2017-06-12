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
  awsSecret: "",,
  awsTag: "node02-20"
});

/******************************************
*             Search a book               * // ONLY "Books" FOR NOW, TO SEE IF WE NEED TO INCLUDE MORE
*******************************************/

router.get("/amazon/books/:str", function(req, res, next){
    if(req.user){
        client.itemSearch({
            keywords: req.params.str,
            searchIndex: 'Books'
        }).catch(function(err){
            return res.json(err);
        }).then(function(results){
            let result = [];
            for(let r in results){
                let attributes = results[r].ItemAttributes[0];
                result.push({
                    ASIN: results[r].ASIN ? results[r].ASIN.join(';') : null,
                    name: attributes.Title ? attributes.Title.join(';') : null,
                    editor: attributes.Publisher ? attributes.Publisher.join(';') :
                        (attributes.Label ? attributes.Label.join(';') : null),
                    date: attributes.ReleaseDate ? attributes.ReleaseDate.join(';') :
                        (attributes.PublicationDate ? attributes.PublicationDate.join(';') : null)
                });
            }
            return res.status(200).json(result);
        });
    }
})

/******************************************
*             Search a film               * // ONLY "DVD" FOR NOW, TO SEE IF WE NEED TO INCLUDE MORE
*******************************************/

router.get("/amazon/films/:str", function(req, res, next){
    if(req.user){
        client.itemSearch({
            keywords: req.params.str,
            searchIndex: 'DVD'
        }).catch(function(err){
            return res.json(err);
        }).then(function(results){
            let result = [];
            for(let r in results){
                let attributes = results[r].ItemAttributes[0];

                result.push({
                    ASIN: results[r].ASIN ? results[r].ASIN.join(';') : null,
                    name: attributes.Title ? attributes.Title.join(';') : null,
                    genre: attributes.Genre ? attributes.Genre.join(';') : null,
                    date: attributes.ReleaseDate ? attributes.ReleaseDate.join(';') :
                        (attributes.PublicationDate ? attributes.PublicationDate.join(';') : null)
                });
            }
            return res.status(200).json(result);
        });
    }
})

/******************************************
*             Search a music              * ONLY "Music" FOR NOW, TO SEE IF WE NEED TO INCLUDE MORE
*******************************************/

router.get("/amazon/music/:str", function(req, res, next){
    if(req.user){
        client.itemSearch({
            keywords: req.params.str,
            searchIndex: 'Music'
        }).catch(function(err){
            return res.json(err);
        }).then(function(results){
            let result = [];
            for(let r in results){
                let attributes = results[r].ItemAttributes[0];
                result.push({
                    ASIN: results[r].ASIN ? results[r].ASIN.join(';') : null,
                    name: attributes.Title ? attributes.Title.join(';') : null,
                    artist: attributes.Artist ? attributes.Artist.join(';') : null,
                    date: attributes.ReleaseDate ? attributes.ReleaseDate.join(';') :
                        (attributes.PublicationDate ? attributes.PublicationDate.join(';') : null)
                });
            }
            return res.status(200).json(result);
        });
    }
})

/******************************************
*           Search a video game           * ONLY "VideoGames" FOR NOW, TO SEE IF WE NEED TO INCLUDE MORE
*******************************************/

router.get("/amazon/game/:str", function(req, res, next){
    if(req.user){
        client.itemSearch({
            keywords: req.params.str,
            searchIndex: 'VideoGames'
        }).catch(function(err){
            return res.json(err);
        }).then(function(results){
            let result = [];
            for(let r in results){
                let attributes = results[r].ItemAttributes[0];
                result.push({
                    ASIN: results[r].ASIN ? results[r].ASIN.join(';') : null,
                    name: attributes.Title ? attributes.Title.join(';') : null,
                    genre: attributes.Genre ? attributes.Genre.join(';') :
                        (attributes.HardwarePlatform ? attributes.HardwarePlatform.join(';') : null),
                    date: attributes.ReleaseDate ? attributes.ReleaseDate.join(';') :
                        (attributes.PublicationDate ? attributes.PublicationDate.join(';') : null)
                });
            }
            return res.status(200).json(result);
        });
    }
})

/******************************************
*       Get informations of a product     *
*******************************************/

router.get("/amazon/:code/:codetype", function(req, res, next){
    if(req.user){
        client.itemLookup({
            idType: req.params.codetype,
            itemId: req.params.code
        }).catch(function(err){
            return res.json(err);
        }).then(function(result){
            return res.json(result);
        });
    }
})

/******************************************
*             Create product              * -------- PROBLEM WITH PRICE BECAUSE DOUBLE AND MULTIPLE CURRENCIES POSSIBLE !!<!!>!!
*******************************************/

router.post("/create/:code/:codetype", function(req, res, next){
    if(req.user){
        client.itemLookup({
          idType: req.params.codetype,
          itemId: req.params.code
        }).catch(function(err) {
            return res.json(err);
        }).then(function(results){
            let attributes = results[0].ItemAttributes[0];
            console.log("\nthomaslog "  + attributes.Binding.join(';') + "\n");
            switch(attributes.Binding.join(';')){
                // all possibilities behind
                default:
                    getJSON(attributes, req, function(){
                        return res.status(200).json({
                            result: 1,
                            message: "The product has been well added to the database."
                        });
                    }, function(){
                        return res.status(400).json({
                            result: 0,
                            message: "Parsing impossible from amazon result to database."
                        })
                    });
                    break;
                // default:
                //     return res.status(400).json({
                //         result: 0,
                //         message: "The item has been found but doesn't belong to the possible categories."
                //     });
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
    let name = attributes.Title ? attributes.Title.join(';') + (attributes.OperatingSystem ? ';' + attributes.OperatingSystem.join(';') : "") : null;
    let editor = attributes.Publisher ? attributes.Publisher.join(';') :
        (attributes.Label ? attributes.Label.join(';') : null);
    let genre = attributes.Genre ? attributes.Genre.join(';') : null;
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

router.delete("/delete/:product_id", function(req, res, next){
    if(req.user){
        Product.destroy({
            where:
            {
                user_id: req.user.id,
                id: req.params.product_id
            }
        }).then(function(resp){
            if(resp == 1)
                return res.status(200).json({
                    result: 1,
                    message: "The product has been well deleted"
                });
            else if(resp == 0)
                return res.status(400).json({
                    result: 0,
                    message: "The product hasn't been deleted, maybe the id does not exists or the product doesn't belong to the active user."
                });
            return res.json(resp);
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
          return res.status(200).send(result);
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
            if(product) return res.status(200).send(product);
            return res.status(400).json({
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
          return res.status(200).send(result);
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
          return res.status(200).send(result);
        }).catch(next);
    }

})

module.exports = router;
