var express = require('express');
	router = express.Router();
	passport = require('passport');
	LocalStrategy = require('passport-local').Strategy;
	User = require('../models/user');
	async = require('async');
	crypto = require('crypto');
	nodemailer = require('nodemailer');
	xoauth2 = require('xoauth2');
	bcrypt = require('bcryptjs');

// Register
router.get('/register', function (req, res) {
	res.render('register');
});
//Forget password
router.get('/forgot',function(req,res){
	res.render('forgot', {
		user: req.user
	  });
	
});

// 
// Login
router.get('/login', function (req, res) {
	if(!req.isAuthenticated())
		res.render('login');
	else
		res.redirect('/');
});

// Register User
router.post('/register', function (req, res) {	
	var username=req.body.username;
		email=req.body.email;
		mobile=req.body.mobile;
		password=req.body.password;
		password2= req.body.password2;
	//validation
	req.checkBody('username', 'Username is required').notEmpty();	
	req.checkBody('password', 'Password is required').notEmpty();
	req.checkBody('password2', 'Password do not match').equals(req.body.password);
	var errors=req.validationErrors();
 
	if(errors){
		res.render('register', {
			errors:errors
		});
	}
	else{
		 secretToken=crypto.randomBytes(64).toString('hex');
		 	
		var newUser = new User({			
				email: email,
				username: username,
				mobile:mobile,
				password: password,
				secretToken:secretToken 
		});								
		User.FindToUsername({$or:[{username:username},{email:email}]},function(err,tokencodes){
			if(err) throw err
			if(tokencodes.length > 0 )
			{				
				req.flash('error_msg','The username/email already registered.');
				res.redirect('/users/register');
			}
			else
			{
			 
				 User.createUser(newUser, function(err, user){

								 if(err) throw err;
								 console.log(user);
						 });
		 
						 req.flash('success_msg', 'You are registered and can now login');
		 
						 res.redirect('/users/login');
			}
		 });
	 }
 });
passport.use(new LocalStrategy(function(email, password, done){
	User.getUserByUsername(email, function(err, user){
		if(err) 
		{
			//throw err;
			return done(null, false, {message: 'Error:'+err});
		}

		if(!user)
		{
			return done(null, false, {message: 'Unknown User'});
		}
		
		User.comparePassword(password, user.password, function(err, isMatch)
		{
			if(err) throw err;
			if(isMatch)
			{	
				
				return done(null, user);
				
			}
			else
			{
				return done(null, false, {message: 'Invalid password'});
				res.redirect('/users/login');
			}
		});
		
	})

}));

passport.serializeUser(function(user, done) 
{
	done(null, user.id);
 });
  
  passport.deserializeUser(function(id, done) 
  {
	User.getUserById(id, function(err, user) 
	{
	  done(err, user);	 
	});
  });

//Login User
router.post('/login',
	passport.authenticate('local',{successRedirect: '/', failureRedirect: '/users/login', failureFlash: true}),
	function(req, res)
	{	
		res.redirect('/');
    }
);
router.get('/logout', function(req, res){
	req.logOut();

	req.flash('success_msg','You are logged out.');

	res.redirect('/users/login');
});
//******************Forgor password************************ */
router.post('/forgot', function(req, res, next) {
	async.waterfall([
	  function(done) {
		crypto.randomBytes(20, function(err, buf) {
		  var token = buf.toString('hex');
		  done(err, token);
		});
	  },
	  function(token, done) {
		User.findOne({ email: req.body.email }, function(err, user) {
		  if (!user) {
			req.flash('error_msg', 'No account with that email address exists.');
			return res.redirect('forgot');		
		  }         
		  user.resetPasswordToken = token;
		  user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
  
		  user.save(function(err) {
			done(err, token, user);
		  });
		});
		},
		
		
	  function(token, user, done) {
		var smtpTransport = nodemailer.createTransport({
		  service: 'Gmail',
		  auth: {			
				user: 'mymindvikash@gmail.com',
				pass: '8447567447'			
		  },
		  tls: {
			rejectUnauthorized: false
		  }
		});
		var mailOptions = {
		  to: user.email,
		  from: 'mymindvikash@gmail.com',
		  subject: 'Reset Password',
		  text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
			'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
			'http://' + req.headers.host + '/users/reset/' + token + '\n\n' +
			'If you did not request this, please ignore this email and your password will remain unchanged.\n'
		};
		smtpTransport.sendMail(mailOptions, function(err) {
		  req.flash('error_msg', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
		  done(err, 'done');
		});
	  }
	], function(err) {
	  if (err) return next(err);
	  res.redirect('login');
	});
  });

  router.get('/reset/:token',function(req,res){
	User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
		if (!user) {
		  req.flash('error','Password reset token is invalid or has expired.');
		  return res.redirect('/users/login');
		}
		res.render('reset', {
		  user: req.user
		});
	  });
	
});
//Update Password and send email conformation
router.post('/reset/:token',function(req,res){
	async.waterfall([
		function(done) {
		  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
			if (!user) {
			  req.flash('error_msg', 'Password reset token is invalid or has expired.');
			 return res.render('login');
			 //return res.redirect('/users/login');
			}				
			user.password = req.body.password;
			user.resetPasswordToken = undefined;
			user.resetPasswordExpires = undefined;
	
			User.createPassword(user,function(err) {
			  req.logIn(user, function(err) {
				done(err, user);
				
			  });
			});
		  });
		},
		function(user, done) {
		  var smtpTransport = nodemailer.createTransport( {
				service: 'Gmail',
			auth: {			
				  user: 'mymindvikash@gmail.com',
				  pass: '8447567447'			
			},
			tls: {
			  rejectUnauthorized: false
			}
		  });
		  var mailOptions = {
			to: user.email,
			from: 'mymindvikash@gmail.com',
			subject: 'Your password has been changed',
			text: 'Hello,\n\n' +
			  'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
		  };
		  smtpTransport.sendMail(mailOptions, function(err) {
			req.flash('error_msg', 'Success! Your password has been changed.');
			done(err);
		 	
		  });
		}
	  ], function(err) {
		res.render('login');
	  });
	

});
/************************* */

  router.get('/reset/:token',function(req,res){
	User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
		if (!user) {
		  req.flash('error','Password reset token is invalid or has expired.');
		  return res.redirect('/users/login');
		}
		res.render('reset', {
		  user: req.user
		});
	  });
	
});
//Update Password and send email conformation
router.post('/reset/:token',function(req,res){
	async.waterfall([
		function(done) {
		  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
			if (!user) {
			  req.flash('error_msg', 'Password reset token is invalid or has expired.');
			 return res.render('login');
			 //return res.redirect('/users/login');
			}				
			user.password = req.body.password;
			user.resetPasswordToken = undefined;
			user.resetPasswordExpires = undefined;
	
			User.createPassword(user,function(err) {
			  req.logIn(user, function(err) {
				done(err, user);
				
			  });
			});
		  });
		},
		function(user, done) {
		  var smtpTransport = nodemailer.createTransport( {
				service: 'Gmail',
				auth: {			
						user: 'mymindvikash@gmail.com',
						pass: '8447567447'			
				},
			tls: {
			  rejectUnauthorized: false
			}
		  });
		  var mailOptions = {
			to: user.email,
			from: 'mymindvikash@gmail.com',
			subject: 'Your password has been changed',
			text: 'Hello,\n\n' +
			  'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
		  };
		  smtpTransport.sendMail(mailOptions, function(err) {
			req.flash('error_msg', 'Success! Your password has been changed.');
			done(err);
		 	
		  });
		}
	  ], function(err) {
		res.render('login');
	  });
	

});


module.exports = router;
