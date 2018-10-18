var request = require('request');
    express = require('express');
    router = express.Router();
    User = require('../models/user');
    Token = require('../models/reminder');
    flash = require('connect-flash');
    Group=require('../models/group');
    MemberList=require('../models/memberlist');
    Productlist=require('../models/list');
   
function ensureAuthenticated(req, res, next)
{
        if(req.isAuthenticated())
        {
          return next();
        }
        else
        {
          req.flash('error_msg','You are not logged in.');
          res.redirect('/users/login');
        }
}

router.get('/createReminder', ensureAuthenticated, function(req, res){
  res.render('createReminder');
});
//GET hOME pAGE
router.get('/',ensureAuthenticated,function(req,res){
  res.render('index');
})
//Api for get Group Member lIst details
router.get('/groupmember', ensureAuthenticated, function(req, res){
     var groupid=req.user.groupid     
     var conditionQuery = {groupid:groupid };  
     User.find(conditionQuery,function(err, content) {           
     res.send(content);               
   });
});


router.get('/error', ensureAuthenticated, function(req, res){
	res.render('error');
});

router.post('/createReminder', function (req, res) {
  var userid= req.user._id;
	var comment=req.body.comment;
	var date=req.body.date; 
	//validation
	req.checkBody('date', 'date value is required').notEmpty();
	req.checkBody('comment', 'comment value is required').notEmpty();
	var errors=req.validationErrors();
	if(errors){   
		res.render('createReminder', {
			errors:errors
		});
	}
  else
  {      
      var newToken = new Token({
        userid: userid,      
        comment: comment,
        date: date,        
        
      });        
       //method start for add reminder
       try
       {             
              Token.createToken(newToken, function(err, token){
                if(err) throw err; 
                console.log("Add Recored")           
              });  
              res.redirect('/');
         }
      catch(error)
      {
        req.flash('error_msg',error.toString());
        res.redirect('error');
      }
    
    
  }

});  
 
//Delete Home Reminder
router.get('/delete/:id', function(req, res) { 
  var db = req.db; 
  var uid = req.params.id.toString();    
    var conditionQuery = {_id:uid };
      try
      {
        Token.deleteToken(conditionQuery, function(err, res) {
          if (err) throw err;
          console.log("1 document delete");    
        });
        res.redirect('/');  
      }
      catch(error)
      {
        req.flash('error_msg',error.toString());
        res.redirect('error');
      }

});
//Delete reminder
router.get('/deletereminder/:id', function(req, res) { 
  var db = req.db; 
  var uid = req.params.id.toString();    
    var conditionQuery = {_id:uid };
      try
      {
        Token.deleteToken(conditionQuery, function(err, res) {
          if (err) throw err;
          console.log("1 document delete");    
        });
        res.redirect('/reminder');  
      }
      catch(error)
      {
        req.flash('error_msg',error.toString());
        res.redirect('error');
      }

});
//Find value and bind textbox for edit reminder
router.get('/edit/:id', function(req, res) 
{ 
  var db = req.db; 
    var  uid = req.params.id;    
    var conditionQuery = {_id:uid };   
    try
    {
      Token.find(conditionQuery,function(err, content) 
      {      
        res.render('edit', {  data:content[0] });    
      })
    }
    catch(error)
    {
      req.flash('error_msg',error.toString());
      res.redirect('error');
    }

});
//-----------------------Edit reminder value----------------------------------// 
router.post('/edit', function (req, res) {  
  var id=req.body.id.toString(); 
	var date=req.body.date;
	var comment=req.body.comment; 
  var  conditionQuerys = {_id:id};  
  try
  {
    newValues = { $set: {date:date,comment:comment}};        
    Token.updateTokenbyId(conditionQuerys, newValues, function(err, res)
      {
          if (err) throw err;
          console.log("Token  updated");
      });
    res.redirect('/'); 

  }
  catch(error)
  {
    req.flash('error_msg',error.toString());
    res.redirect('error');
  }
  
});

router.get('/Viewgroup', ensureAuthenticated, function(req, res){ 
    Group.find(function(err,content){ 
      res.render('Viewgroup', {data:content })  
        
    })
});
//Link for add group page
router.get('/addgroup', ensureAuthenticated, function(req, res){
  res.render('addgroup');
});
//Link for add group page
router.get('/memberlist', ensureAuthenticated, function(req, res){

  res.render('memberlist');
});
//Edit group
router.get('/editgroup', ensureAuthenticated, function(req, res){
  res.render('editgroup');
});
router.get('/editgroup/:id', ensureAuthenticated, function(req, res){
  var db = req.db; 
  var  groupid = req.params.id; 
  var conditionQuery = {_id:groupid };
    Group.find(conditionQuery,function(err, content) {           
      res.render('editgroup', { data:content[0] });              
    })   
});
router.post('/editgroup',function(req,res){//update group data
  var id=req.body.id.toString();
  var groupname=req.body.groupnameupdate; 
  var groupcondition={_id:id};
  console.log('groupid',groupcondition)
  newValues = { $set: {groupname:groupname}};        
    Group.updateTotal(groupcondition, newValues, function(err, res)
      {
          if (err) throw err;
          console.log("updated Group");
      });
    res.redirect('Viewgroup'); 
})
//Add New group
router.post('/addgroup', function (req, res) {
  var db = req.db; 
  var  groupid = req.params.id; 
  var conditionQuery = {_id:groupid };
 //console.log(conditionQuery) ;
  var userid= req.user._id;
	var groupname=req.body.groupname;
  var createdAt;
  var total;
	//validation
	req.checkBody('groupname', 'comment value is required').notEmpty();
	var errors=req.validationErrors();
	if(errors){   
		res.render('addgroup', {
			errors:errors
		});
	}
  else
  {      
      var newGroup = new Group({
        userid:userid,
        groupname: groupname, 
        total:0,     
        createdAt:createdAt
        
      });        
       //method start for add group
       try
       {             
              Group.createGroup(newGroup, function(err, group){
                if(err) throw err; 
                console.log("Add group")           
              });  
              res.redirect('Viewgroup');
         }
      catch(error)
      {
        req.flash('error_msg',error.toString());
        res.redirect('error');
      }  
  }

}); 
//route of add new member 
router.get('/addnewmember',ensureAuthenticated,function(req,res){
  res.render('addnewmember')
})
router.get('/addnewmember/:id', ensureAuthenticated, function(req, res){
  var db = req.db; 
  var  uid = req.params.id; 
  var conditionQuery = {_id:uid };
    Group.find(conditionQuery,function(err, content) {           
      res.render('addnewmember', {  data:content[0] });
      //console.log(content[0]);        
    })  
});
//Add new member
router.post('/newMember',function(req,res,next){
      var groupid=req.body.groupid; 
      var groupname=req.body.groupname;
      var username=req.body.fullname;
      var email=req.body.email;
      var mobile=req.body.mobile; 
      var password=req.body.password;
      var conditionQuery={groupid:groupid};
      var conditionQuerytotal={_id:groupid};
      var isAdmin=false;

        //validation
        req.checkBody('fullname', 'fullname value is required').notEmpty();
        req.checkBody('email', 'email value is required').notEmpty();
        req.checkBody('mobile', 'mobile value is required').notEmpty();
        req.checkBody('password', 'password value is required').notEmpty();
        var errors=req.validationErrors();
      if(errors){   
        res.render('addnewmember', {
          errors:errors
        });
      }
      else
      {      
              var newMemberList = new User({      
                groupid:groupid,
                groupname:groupname,
                username: username, 
                email:email,     
                mobile:mobile,
                isAdmin:isAdmin,
                password:password      
              });   
              User.FindToUsername({$and:[{email:email},{groupid:groupid}]},function(err,tokencodes){
                    if(err) throw err
                    if(tokencodes.length > 0 )
                    {				
                      req.flash('error_msg','The username/email already registered.');
                      //console.log('The username/email already registered.')
                      res.redirect('addnewmember');
                    }
                    else
                    {
                          try
                          {             
                              User.createUser(newMemberList, function(err, newMemberList){
                                      if(err) throw err; 
                                      console.log("Add group")                         
                                    });           
                                  res.redirect('Viewgroup');  
                                  //Count total member   
                                  User.count(conditionQuery,function(err,total){ 
                                  var totalmemberlist=total+1;//total member 
                                  //update total member in group document         
                                  newValues={ $set: {total:totalmemberlist}}; 
                                  Group.updateTotal(conditionQuerytotal,newValues,function(err,res){
                                    if (err) throw err;
                                    console.log("Total  updated");
                                  })
                                }); 
                            }
                                catch(error)
                                {
                                  req.flash('error_msg',error.toString());
                                  res.redirect('error');
                                } 
                      }
                })     
          
         }

});
//Delete Grouplist
router.get('/deletegroup/:id', function(req, res) { 
    var db = req.db; 
    var uid = req.params.id.toString();    
    var conditionQuery = {_id:uid };
      try
      {
        Group.deleteGroup(conditionQuery, function(err, res) {
          if (err) throw err;
          console.log("1 document delete");    
        });
        res.redirect('/Viewgroup');  
      }
      catch(error)
      {
        req.flash('error_msg',error.toString());
        res.redirect('error');
      }

});
//Get self Item in admin viewdetails by admin
router.get('/memberproductview/:id',(req,res)=>{
    var db = req.db; 
    var uid=req.params.id;
    Productlist.aggregate([    
      {     
        $match: { userid:uid.toString() }
      },
      {
        $group:{_id:'null',totalprice:{$sum: "$productprice"}}
      }
    ],function(err,getbyadminselftotalamount){   
        if (err) throw (err);     
        Productlist.find({userid:uid},(err,memberlist)=>{
          var Totalselfamt=getbyadminselftotalamount;
          var totalmerage=memberlist.concat(Totalselfamt);       
          res.render('memberproductview',{data:totalmerage});
      });
      })
    
 
});

//View Memberlist details
router.get('/viewmemberlist/:id',function(req,res){
  var db = req.db; 
  var  uid = req.params.id; 
  var conditionQuery = {groupid:uid };  
  User.find(conditionQuery,function(err, content) {           
    res.render('memberlist', { data:content });  
              
  })  
  
});
//delete memberlist
router.get('/deletemember/:id', function(req, res) { 
      var db = req.db; 
      var uid = req.params.id.toString();    
      var conditionQuery = {_id:uid };    
      try
      {
            MemberList.deleteMemberList(conditionQuery, function(err, res) {
              if (err) throw err;
              console.log("1 Member delete");    
            });
            res.redirect('/Viewgroup');
            // MemberList.find(conditionQuery,function(err,groupid){
            //   var conditionGroupid=groupid[0].groupid
            //   console.log(conditionGroupid)
            //   var conditionQuerytotal={_id:conditionGroupid};
            //   MemberList.count(conditionQuery,function(err,total){ 
            //     var totalmemberlist=total+1;//total member 
            //     //update total member in group document         
            //     newValues={ $set: {total:totalmemberlist}}; 
            //     Group.updateTotal(conditionQuerytotal,newValues,function(err,res){
            //       if (err) throw err;
            //       console.log("Total  updated");
            //     })
            //   });  
            // });
         
      }
      catch(error)
      {
        req.flash('error_msg',error.toString());
        res.redirect('error');
      }

});
//get reminder details by user id
router.get('/reminder',ensureAuthenticated,function(req,res){
    var userid=req.user._id;
    var conditionQuery={userid:userid};
    Token.find(conditionQuery,function(err,content){
      res.render('reminder',{data:content});
      console.log(content);
    })
 
});

//***************itemlist.handlebars/createlist.handbars****************************//
//get list
router.get('/createList', ensureAuthenticated, function(req, res){
  res.render('createList');
});
router.get('/myitems', ensureAuthenticated, function(req, res){
      var userid=req.user._id;
      conditionQueryid={userid:userid}       
      //Update self member product price
      Productlist.aggregate([    
        {     
          $match: { userid:userid.toString() }
        },
        {
          $group:{_id:'null',totalprice:{$sum: "$productprice"}}
        }
      ],function(err,totalamount){   
           if (err) throw (err);

           Productlist.find(conditionQueryid,function(err,content){ 
           // var concatSumoftotal=content.concat(totalamount);    
            res.render('myitems', {data:totalamount });
             //console.log(concatSumoftotal);
          })      
      
         });
        
});
//Api for Get Self Itemlist detail
router.get('/GetselfItemList',ensureAuthenticated,(req,res)=>{
  var userid=req.user._id;
  var conditionQueryid={userid:userid}  
  Productlist.find(conditionQueryid,function(err,content){    
    res.send(content);    
  }) 
})
//Calaculate totla
router.get('/listItem',ensureAuthenticated,(req,res)=>{
  var userid=req.user._id;     
  var groupid=req.user.groupid;             
  //All product item sum
  Productlist.aggregate([        { 
       $match: { groupid:groupid } 
    },
    {
        $group:{_id:'null',totalProductPrice:{$sum: "$productprice"},count:{$sum:1}}
    }
  ],function(err,totalamount){    
          if (err) return handleError(err);              
          if(JSON.stringify(totalamount)!=='[]') 
          {   
          Group.find({_id:groupid},(err, content)=> { //Find the total number of member in singel group
                var total=parseFloat(content[0].total); //Get total member             
                var avgbalance=totalamount[0].totalProductPrice/total; //Get average amount
                Avgbalance=avgbalance.toFixed(2);               
                User.updateToken({_id:userid},{avgbalance:Avgbalance},(err,res)=>{
                  if(err) throw err
                  console.log("Total  updated");
                })               
           });
          }
          console.log("Total  updated",totalamount[0]);
          res.render('listItem',{data:totalamount[0]});  
  });
// ***********End */
  
})
//Api for get item list
router.get('/GetlistItem', ensureAuthenticated,(req, res)=>{  
  var groupid=req.user.groupid;  
    conditionQueryGroupid={groupid:groupid}
    Productlist.find(conditionQueryGroupid,(err,content)=>{    
      res.send(content);       
    }); 
});


//Add New Itemlist
router.post('/createList', function (req, res) {  
  var userid= req.user._id;
  var groupid=req.user.groupid; 
  var username=req.user.username;
  var productname=req.body.listname;
  var productprice=req.body.listprice; 
  var path=req.user.path;  
	//validation
	req.checkBody('listname', 'list name value is required').notEmpty();
	req.checkBody('listprice', 'list price is required').notEmpty();
	var errors=req.validationErrors();
	if(errors){   
		res.render('createList', {
			errors:errors
		});
	}
  else
  {      
      var newList = new Productlist({
        userid: userid, 
        username:username,
        productname:productname,
        productprice:productprice,
        groupid:groupid,
        path:path      
        
      });        
       //method start for add reminder
       try
       {             
            Productlist.createList(newList, function(err, listToken){
                    if(err) throw err; 
                    console.log("Add Recored")           
                  });  
                  var userid=req.user._id;
                  var groupid=req.user.groupid;              
                  //all product item sum
                  Productlist.aggregate([    
                    { $match: { groupid:groupid } },
                    {
                        $group:{_id:'null',productprice:{$sum: "$productprice"},count:{$sum:1}}
                    }
                  ],function(err,totalamount){ 
                   // console.log('totalamount',totalamount)   
                    if(err) throw err; 
                    if(JSON.stringify(totalamount)!=='[]')
                    {
                    var totalListAmount=parseFloat(totalamount[0].productprice) + parseFloat(productprice);
                    var totalcount=parseFloat(totalamount[0].count)+1;
                    var Avgbalance=totalListAmount/totalcount; 
                    User.updateToken({_id:userid},{balance:totalListAmount,avgbalance:Avgbalance},function(err,res){                    
                      console.log("Total  updated");
                    })
                  }
                    console.log("Total Amount",totalListAmount);
                    console.log("Avergae Balance",Avgbalance);
                    console.log("totalcount",totalcount);
                  });
                  //***********End */ 
                  //Update self member product price
                  // Productlist.aggregate([    
                  //   {     
                  //     $match: { userid:userid.toString() }
                  //   },
                  //   {
                  //     $group:{_id:'null',productprice:{$sum: "$productprice"}}
                  //   }
                  // ],function(err,totalamount){   
                  //   if (err) throw (err); 
                  //   User.updateToken({_id:userid},{selfSpand:totalamount[0].productprice + parseFloat(productprice)},function(err,res){     
                  //     console.log("Total  updated");
                  //   })
                  //   console.log("Total Amount",totalamount[0]);
                  
                  // });                      
                     res.redirect('/listItem');
            
         }
      catch(error)
      {
        req.flash('error_msg',error.toString());
        res.redirect('error');
      }   
      }

}); 

/* Update itemList (edit) */
router.post('/editlist', function (req, res) {  
  var userid= req.user._id;
  var balance=req.user.balance;
  var id=req.body.id.toString(); 
  var productname=req.body.listname;
  var productprice=req.body.listprice;
  var Leftbalance=balance-productprice;  
  var moneycondition={_id:userid};   
  newValuesbalance = { $set: {balance:Leftbalance}};  
  var  conditionQuerys = {_id:id};  
  try
  {
    newValues = { $set: {productname:productname,productprice:productprice}};        
    Productlist.updateTokenbyId(conditionQuerys, newValues, function(err, res)
      {
          if (err) throw err;
          console.log("listItem  updated");
      });
      //Update balance
      User.updateToken(moneycondition, newValuesbalance, function(err, res)
      {
          if (err) throw err;
          console.log("left balance");
      });  
    res.redirect('/listItem'); 

  }
  catch(error)
  {
    req.flash('error_msg',error.toString());
    res.redirect('error');
  }
  
});

//Get value and bind textbox for edit listitem
router.get('/editlist/:id', function(req, res) 
{ 
      var db = req.db; 
      var  uid = req.params.id;      
      var conditionQuery = {_id:uid };   
      try
      {
        Productlist.find(conditionQuery,function(err, content) 
        {      
          res.render('editlist', {  data:content[0] });    
        })
      }
      catch(error)
      {
        req.flash('error_msg',error.toString());
        res.redirect('error');
      }

});
    

//Delete listItem
router.get('/deleteitmlst/:id', function(req, res) { 
  var db = req.db; 
  var uid = req.params.id.toString();    
    var conditionQuery = {_id:uid };
      try
      {
       
        Productlist.deleteToken(conditionQuery, function(err, res) {
          if (err) throw err;       
          console.log("1 document delete");    
        
        });
        res.redirect('/listItem');  
      }
      catch(error)
      {
        req.flash('error_msg',error.toString());
        res.redirect('error');
      }

});
//********************Ens******************/

//Go to profile information
router.get('/profile',function(req,res){
    res.render('profile');
});

//Update user  profile
router.post('/updateprofile',(req,res) =>{
      var userid=req.body.id;
      var username=req.body.username;
      var email=req.body.email;
      var mobile=req.body.mobile;
      conditionQueryProfileId={_id:userid};
      conditionQueryProductlist={userid:userid};
      newProductUserName={$set:{username:username}}
      newProfileVolue={$set:{username:username,email:email,mobile:mobile}}
        User.updateToken(conditionQueryProfileId,newProfileVolue,(err,res)=>{
          if (err) throw err;
          console.log("updated profile");
        })
        Productlist.updateMany(conditionQueryProductlist,newProductUserName,(err,res) =>{
            if (err) throw err;
            console.log("updated List username");
        });
        res.redirect('/profile');
});


module.exports = router;