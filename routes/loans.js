"use strict";
const express = require("express")
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const models = require("../models");
const constants = require('../constants');
let router = express.Router();
const User = models.User;
const Product = models.Product;
const Friendship = models.Friendship;
const Loan = models.Loan;


/******************************************
*             Make a loan                 *
*******************************************/

function checkDate(start, end, res, next){
        /* VERIFICATION OF THE DATE VALIDITY IN THE BODY */
        if(start != null && start.toString() == "Invalid Date"){
            return res.status(400).json({
                    result: 0,
                    message: "The start date of the loan is invalid. Format : DD/MM/YYYY"
                });
        }
        else if(end != null && end.toString() == 'Invalid Date'){
            return res.status(400).json({
                    result: 0,
                    message: "The end date of the loan is invalid. Format : DD/MM/YYYY"
                });
        }
        else if(end && end < start){
            return res.status(400).json({
                    result: 0,
                    message: "The end date cannot be before start date"
                });
        }
        else if(start < new Date() || (end && end < new Date())){
            return res.status(400).json({
                    result: 0,
                    message: "End or start date cannot be before today"
                });
        }
        else{
            next();
        }
}

function checkIfDateMatch(start, end, start_bdd, end_bdd, next, error){
    if(end_bdd == null){
        if(end == null) return false;
        else if(end >= start_bdd) return false;
    }
    else{
        if(end == null && start <= start_bdd){
             return false;
        }
        else{
            if(start <= start_bdd && end >= end_bdd) return false;
            else if(start >= start_bdd && start <= end_bdd) return false;
            else if(end >= start_bdd && end <= end_bdd) return false;
        }
    }
    return true;
}

router.post('/create/:code/:user_id', function(req, res, next){
    if(req.user){

        let start = req.body.start_date ? new Date(req.body.start_date) : new Date();
        let end = req.body.end_date ? new Date(req.body.end_date) : null;
        checkDate(start, end, res, function(){

            /* VERIFICATION IF THE USER ID IS NOT YOURSELF */
            if(req.params.user_id == req.user.id){
                return res.status(400).json({
                        result: 0,
                        message: "You can't make a loan to yourself."
                    });
            }

            /* VERIFICATION IF THE PRODUCT ID EXISTS */
            Product.findOne({
                where:
                {
                    id: req.params.code,
                    deleted_at: null
                }
            }).catch(function(err){
                return res.json(err);
            }).then(function(result){
                if(!result){
                    return res.status(400).json({
                        result: 0,
                        message: "No products match this id."
                    });
                }

                /* VERIFICATION IF THE PRODUCT BELONG TO THE ACTIVE USER */
                else if(result.user_id != req.user.id){
                    return res.status(400).json({
                        result: 0,
                        message: "The product does not belong to the active user."
                    });
                }

                /* VERIFICATION IF THE USER IS FRIEND WITH THE ACTIVE USER */
                Friendship.findOne({
                    where:
                    {
                        user_id: req.user.id,
                        friend_id: req.params.user_id,
                        deleted_at: null
                    }
                }).catch(function(err){
                    return res.json(err);
                }).then(function(result){
                    if(!result){
                        return res.status(400).json({
                            result: 0,
                            message: "The user is not friend with the loaner."
                        });
                    }

                    /* VERIFICATION IF THE PRODUCT ISN'T ALREADY IN LOAN */
                    Loan.findOne({
                        where:
                        {
                            product_id: req.params.code,
                            deleted_at: null
                        }
                    }).catch(function(err){
                        return res.json(err);
                    }).then(function(result){
                        if(result == null || checkIfDateMatch(start, end, result.start_date, result.end_date)){
                             models.Loan.create({
                                product_id: req.params.code,
                                user_id: req.params.user_id,
                                start_date: start,
                                end_date: end
                            }).catch(function(err){
                                return res.json(err);
                            }).then(function(){
                                 return res.status(200).json({
                                    result: 1,
                                    message: "The loan has been made."
                                    });
                                });
                        }
                        else{
                            return res.status(400).json({
                                    result: 0,
                                    message: "The product is already or maybe already in loan at this time. Try with mentioning a end date for the loan."
                            });
                        }
                    });
                })
            });
        });
    }
})

/******************************************
*        Declare end of a loan            *
*******************************************/

router.post('/end/:code/:user_id', function(req, res, next){
    if(req.user)
    {
        let start = req.body.start_date ? new Date(req.body.start_date) : null;
        let end = req.body.end_date ? new Date(req.body.end_date) : null;
        if(!start || start.toString() == "Invalid Date"){
            return res.status(400).json({
                result: 0,
                message: "A valid start date is needed to identify the loan."
            });
        }
        else if(!end || end.toString() == "Invalid Date"){
            return res.status(400).json({
                result: 0,
                message: "A valid end date is needed to update the end date of the loan."
            });
        }

        Loan.findOne({
            where:
            {
                product_id: req.params.code,
                user_id: req.params.user_id,
                start_date: start,
                end_date: null,
                deleted_at: null
            }
        }).catch(function(err){
            return res.json(err);
        }).then(function(result){
            if(!result){
                return res.status(400).json({
                    result: 0,
                    message: "No loan exist with this user id, product id and start date combination or one exists but it already has an end date."
                });
            }
            Product.findOne({
                where:
                {
                    id: req.params.code
                }
            }).catch(function(err){
                return res.json(err);
            }).then(function(product_result){
               if(product_result.user_id != req.user.id){
                   return res.status(400).json({
                       result: 0,
                       message: "A loan exist with this combination but the owner of the product isn't the active user."
                   });
               }
                else{
                    if(start >= end){
                        return res.status(400).json({
                                result: 0,
                                message: "A loan has been find but the end date you give is before the start_date, it's impossible."
                        });
                    }
                    else{
                        result.update({
                            end_date: end
                        }).then(function(){
                            return res.status(200).json({
                                result: 1,
                                message: "The end date of the loan has been updated."
                            });
                        }).catch(function(err){
                            return res.json(err);
                        });
                    }
                }
            });
        });
    }
})

/******************************************
*             Delete a loan               *
*******************************************/

router.delete('/delete/:code/:user_id', function(req, res, next){
    if(req.user){
        let start = req.body.start_date ? new Date(req.body.start_date) : null;
        if(!start || start.toString() == "Invalid Date"){
            return res.status(400).json({
                result: 0,
                message: "A valid start date is needed to identify the loan."
            });
        }
        Loan.findOne({
            where:
            {
                product_id: req.params.code,
                user_id: req.params.user_id,
                start_date: start,
                deleted_at: null
            }
        }).catch(function(err){
            return res.json(err);
        }).then(function(result){
            if(!result){
                return res.send(400).json({
                    result: 0,
                    message: "No loan exists with this user id, product id and start date combination."
                });
            }
            Product.findOne({
                where:
                {
                    id: req.params.code
                }
            }).catch(function(err){
                return res.json(err);
            }).then(function(product_result){
                if(product_result.user_id != req.user.id){
                    return res.send(400).json({
                        result: 0,
                        message: "The product subject of the loan does not belong to the active user."
                    });
                }
                else{
                    Loan.destroy({
                        where:
                        {
                            product_id: req.params.code,
                            user_id: req.params.user_id,
                            start_date: start,
                            deleted_at: null
                        }
                    }).catch(function(err){
                        return res.json(err);
                    }).then(function(result){
                        if(result == 1){
                            return res.send(200).json({
                                result: 1,
                                message: "The loan has been well deleted"
                            });
                        }
                        else{
                            return res.send(400).json({
                                result: 0,
                                message: "An error has occured and the loan hasn't been deleted"
                            });
                        }
                    })
                }
            });
        });
    }
})

/******************************************
*             Get all loans               *
*******************************************/

router.get("/search/", function(req, res, next){
    if(req.user){
        Loan.findAll({
          where:
          {
            deleted_at: null
          }
        }).then(function(loan){
          return res.status(200).json(loan);
        }).catch(next);
    }

})

/******************************************
*               Get a loan                *
*******************************************/

router.get("/search/:id", function(req, res, next){
    if(req.user){
        Loan.findOne({
          where:
          {
            id: req.params.id
          }
        }).then(function(loan){
            if(loan) return res.status(200).send(loan);
            return res.status(400).json({
                result: 0,
                message: "ID not found."
            });
        }).catch(next);
    }
})

/******************************************
*             Get my loans (owner)         *
*******************************************/

router.get("/search/owner/active", function(req, res, next){
    if(req.user){
        Loan.findAll({
          where:
          {
            deleted_at: null,
          }, include : [Product]
        }).then(function(loans){
            let result = [];
            for(let i in loans){
                if(loans[i].Product.user_id == req.user.id){
                    result.push(loans[i]);
                }
            }
            return res.status(200).send(result);
        }).catch(next);
    }

})

/******************************************
*             Get my loans (loaner)        *
*******************************************/

router.get("/search/loaner/active", function(req, res, next){
    if(req.user){
        Loan.findAll({
          where:
          {
            user_id: req.user.id,
            deleted_at: null
          }
        }).then(function(loans){
          return res.status(200).send(loans);
        }).catch(next);
    }

})

/******************************************
*      Get loans for a user (owner)       *
*******************************************/

router.get("/search/owner/:user_id", function(req, res, next){
    if(req.user){
        Loan.findAll({
          where:
          {
            deleted_at: null,
          }, include : [Product]
        }).then(function(loans){
            let result = [];
            for(let i in loans){
                if(loans[i].Product.user_id == req.params.user_id){
                    result.push(loans[i]);
                }
            }
            return res.status(200).send(result);
        }).catch(next);
    }

})

/******************************************
*       Get loans for a user (loaner)     *
*******************************************/

router.get("/search/loaner/:user_id", function(req, res, next){
    if(req.user){
        Loan.findAll({
          where:
          {
            user_id: req.params.user_id,
            deleted_at: null
          }
        }).then(function(loans){
          return res.status(200).send(loans);
        }).catch(next);
    }

})

module.exports = router;
