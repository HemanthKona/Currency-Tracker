/*
	login.js
	Sign up and login user requests are handled

	Revision history
	Hemanth Kona, 2013.11.13: created
	Hemanth Kona, 2013.11.14: Signup and login requests handled
*/

var mongoose = require('mongoose');
var User = mongoose.model('User');

var cleanString = require('../helpers/cleanString');
var hash = require('../helpers/hash');
var crypto = require('crypto');

module.exports = function(app) {
	
	app.get('/signup', function(req, res) {
		res.render('user/signup.jade');
	});

	// create account
	app.post('/signup', function(req, res, next) {
		var firstname = cleanString(req.param('firstname'));
		var lastname = cleanString(req.param('lastname'));
		var email = cleanString(req.param('email'));
		var password = cleanString(req.param('password'));
		var currentCountry = cleanString(req.param('currentCountry'));
		var homeCountry = cleanString(req.param('homeCountry'));

		if(!(email && password)){
			return invalid();
		}

		User.findById(email, function(err, user) {
			if(err){
				console.log("2");
				return next(err);
			}

			if(user) {
				console.log('3');
				return res.render('user/signup.jade', { exists: true});
			}

			crypto.randomBytes(16, function (err, bytes) {
				if(err) return next(err);

				var user = {
					_id: email,
					name: { first: firstname, last: lastname},
					currentCountry: currentCountry,
					homeCountry: homeCountry
				};
				user.salt = bytes.toString('utf8');
				user.hash = hash(password, user.salt);

				User.create(user, function(err, newUser) {
					if(err) {
						if(err instanceof mongoose.Error.ValidationError) {
							console.log("4");
							return invalid();
						}
						console.log('5');
						return next(err);
					}

					//user created successfully
					req.session.isLoggedIn = true;
					req.session.user = email;
					req.session.currentCountry = currentCountry;
					req.session.homeCountry = homeCountry;
					console.log('created user: %s', email);
					return res.redirect('/');
				});
			});
		});

	function invalid() {
		return res.render('user/signup.jade', { invalid: true });
	}
	});
	
	//login
	app.get('/login', function(req, res) {
		res.render('user/login.jade');
	});

	app.post('/login', function(req, res) {
		var email = cleanString(req.param('email'));
		var password = cleanString(req.param('password'));
		if(!(email && password)){
			console.log("Email");
			return invalid();	
		} 

		email = email.toLowerCase();

		User.findById(email, function(err, user) {
			
			if(err){
				console.log("2");
				return next(err);
			} 

			if(!user){
				console.log("3");
				return invalid();
			} 

			if(user.hash != hash (password, user.salt)){
				console.log("4");
				return invalid();
			} 

			console.log("5");

			req.session.isLoggedIn = true;
			req.session.user = email;
			req.session.currentCountry = user.currentCountry;
			req.session.homeCountry = user.homeCountry;
			res.redirect('/');
		});
		
		function invalid() {
			return res.render('user/login.jade', { invalid: true });
		}
	});

	//logout
	app.get('/logout', function(req, res) {
		req.session.isLoggedIn = false;
		req.session.user = null;
		res.redirect('/');
	});
};