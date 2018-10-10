var express = require('express');
var router= express.Router();
var upload= require('./upload');
var Photo= require('../models/Photo');
var User = require('../models/user');
/* GET home page. */
router.get('/Profileimage', function(req, res, next) {
  res.render('uploadprofile');
});

/** Upload file to path and add record to database */
router.post('/upload', function(req, res) {

  upload(req, res,(error) => {
      if(error){
         res.redirect('/error');
      }else{
        if(req.file == undefined){

          res.redirect('/error');

        }else{             
            /*********Create new record in mongoDB**********/
            var fullPath = "files/"+req.file.filename;
            var userid=req.user._id;
            var  conditionQuerys = {_id:userid};
             newValues = { $set: {path:fullPath}};   
              User.updateImage(conditionQuerys,newValues,function(error){
                if(error){ 
                  throw error;
                } 
                res.redirect('/');
         });
      }
    }
  });    
});

module.exports = router;
