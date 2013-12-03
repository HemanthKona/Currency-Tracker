/*
	group.js
	Requests on Group model are handled here

	Revision history
	Hemanth Kona, 2013.11.30: created
*/

var loggedIn = require('../middleware/loggedIn');
var mongoose = require('mongoose');
var Group = mongoose.model('Group');
var User = mongoose.model('User');

module.exports = function(app) {

	app.get('/group/', loggedIn, function(req, res) {
		res.render('group/index.jade');
	})

	app.get("/group/createGroup", loggedIn, function(re, res) {
		res.render('group/createGroup.jade');
	})

	app.post("/group/createGroup", loggedIn, function(req, res, next) {
		var name = req.param('name');
		var category = req.param('category');
		var user = req.session.user;
		var members = [user];

		var query;
		var update;

		Group.create({
			name: name,
			category: category,
			members: members
		}, function(err, group) {
			if(err) return next(err);

			req.session.group = group.id;

			query = { _id: user}
			update = { $addToSet : { groups : group.id } };

			User.update(query, update, function(err, num) {
				if(err) return next(err);

				if(0 === num)
				{
					return next(new Error('No user to modify'));
				}

				res.redirect('/group/' + group.id)
			})		
		})
	})

	app.get('/group/:id', loggedIn, function(req,res, next) {
		var id = req.param('id');

		var query = Group.findById(id);
		query.exec( function(err, group) {
			if(err) return next(err);

			if(!group) return next();

			res.render('group/viewGroup.jade', { group: group })
		})
	})

	app.get('/group/add/', loggedIn, function(req,res) {
		res.render('group/add.jade');
	}) 
}