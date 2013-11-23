/*
	user.js
	View and update user profile

	Revision history
	Hemanth Kona, 2013.11.22: created
*/

var loggedIn = require('../middleware/loggedIn');
var mongoose = require('mongoose');
var User = mongoose.model('User');

var cleanString = require('../helpers/cleanString');
var hash = require('../helpers/hash');
var crypto = require('crypto');

module.exports = function(app) {

	//view profile details
	app.get("/profile", loggedIn, function(req, res, next) {
		var id = req.session.user;
		var currentCountry = req.session.currentCountry;
		var homeCountry = req.session.homeCountry;

		User.findById(id, function(err, user) {
			if(err) return next(err);
			res.render('profile.jade', { user : user } );
		})
	})

	//Get edit profile page
	app.get("/profile/edit/:id", loggedIn, function(req, res, next) {
		res.render('editProfile.jade', {
			user : User.findById(req.param('id'))
		})
	})

	// Edit profile and send data to database
	app.post("/profile/edit/:id", loggedIn, function(req, res, next) {
		var id = req.param('id');
		var currentCountry = req.param('currentCountry');
		var homeCountry = req.param('homeCountry');
		var email = req.param('email');

		var query = { _id: id };
		var update = { name : { first :req.param('firstname'), last:req.param('lastname') }};
		// update.id = email;
		update.currentCountry  = currentCountry;
		update.homeCountry  = homeCountry;

		User.update(query, update, function(err, num) {
			if(err) return next(err);

			if(0 === num){
				return next(new Error('No user updated'))
			}

			req.session.currentCountry = currentCountry;
			req.session.homeCountry = homeCountry;

			res.redirect("/profile")
		})
	})
}