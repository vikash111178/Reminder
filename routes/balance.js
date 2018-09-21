var express = require('express');
    router = express.Router();
    User = require('../models/user');
    
    router.get('/addbalance',(req,res)=>{
        res.render('addbalance');

    });
  router.post('/addmoney',(req,res) =>{
    var id=req.user._id.toString();
    var balance=req.body.amount;    
    var moneycondition={_id:id};   
    newValues = { $set: {balance:balance}};        
      User.updateToken(moneycondition, newValues, function(err, res)
        {
            if (err) throw err;
            console.log("add money");
        });
      res.redirect('/Viewgroup'); 
  });

    module.exports = router;