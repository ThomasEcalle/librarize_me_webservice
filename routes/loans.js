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
            res.status(400).json({
                    result: 0,
                    message: "The start date of the loan is invalid. Format : DD/MM/YYYY"
                });
        }
        else if(end != null && end.toString() == 'Invalid Date'){
            res.status(400).json({
                    result: 0,
                    message: "The end date of the loan is invalid. Format : DD/MM/YYYY"
                });
        }
        else if(end && end < start){
            res.status(400).json({
                    result: 0,
                    message: "The end date cannot be before start date"
                });
        }
        else if(start < new Date() || (end && end < new Date())){
            res.status(400).json({
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
                res.status(400).json({
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
                res.json(err);
            }).then(function(result){
                if(!result){
                    res.status(400).json({
                        result: 0,
                        message: "No products match this id."
                    });
                }

                /* VERIFICATION IF THE PRODUCT BELONG TO THE ACTIVE USER */
                else if(result.user_id != req.user.id){
                    res.status(400).json({
                        result: 0,
                        message: "The product does not belong to the active user."
                    });
                }

                /* VERIFICATION IF THE USER IS FRIEND WITH THE ACTIVE USER */
                Friendship.findOne({
                    user_id: req.user.id,
                    friend_id: req.params.user_id
                }).catch(function(err){
                    res.json(err);
                }).then(function(result){
                    if(!result){
                        res.status(400).json({
                            result: 0,
                            message: "The user is not friend with the loaner."
                        });
                    }

                    /* VERIFICATION IF THE PRODUCT ISN'T ALREADY IN LOAN */
                    Loan.findOne({
                        product_id: req.params.code,
                        deleted_at: null
                    }).catch(function(err){
                        res.json(err);
                    }).then(function(result){
                        if(result == null || checkIfDateMatch(start, end, result.start_date, result.end_date)){
                             models.Loan.create({
                                product_id: req.params.code,
                                user_id: req.params.user_id,
                                start_date: start,
                                end_date: end
                            }).catch(function(err){
                                res.json(err);
                            }).then(function(){
                                 res.status(200).json({
                                    result: 1,
                                    message: "The loan has been made."
                                    });
                                });
                        }
                        else{
                            res.status(400).json({
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

module.exports = router;
