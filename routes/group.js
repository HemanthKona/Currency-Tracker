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

	//group home
	app.get('/group/', loggedIn, function(req, res) {
		var id = req.session.user;
		var groupNames = [];

		User.aggregate()
			.match({_id: id})
			.project({
				_id: 0,
				groups: 1
			})
			.exec(function(err, grouplist) {
				if(err) return next(err);

				if(!grouplist) return next();

				console.log(grouplist);

				grouplist.forEach(function(groups) {
					var j = 0;
					groups.forEach(function(g) {
						Group.findById(groups[j], {_id: false, name: true}, function(err, groupName) {
							if(err) return next(err);

							if(!groupName) return next();

							groupNames.push(groupName.name);

							j++;
						});
					})
				})


				for (var i = 0; i < grouplist.length; i++)
					var groups = grouplist[i].groups;
					for(var j = 0; j < groups.length; j++)
						Group.findById(groups[j], {_id: false, name: true}, function(err, groupName) {
							if(err) return next(err);

							if(!groupName) return next();

							groupNames.push(groupName.name);

							
						});
				
				console.log(groupNames);
				res.render('group/index.jade', { groupNames: groupNames });

			})

	})

	//create group
	app.get("/group/createGroup", loggedIn, function(re, res) {
		res.render('group/createGroup.jade');
	})

	app.post("/group/createGroup", loggedIn, function(req, res, next) {
		var name = req.param('name');
		var category = req.param('category');
		var user = req.session.user;
		var members = user;

		var query;
		var update;

		Group.create({
			name: name,
			category: category,
			members: members
		}, function(err, group) {
			if(err) return next(err);

			req.session.group = group.id;
			console.log(req.session.group)
			var group = { name: name, groupId:group.id};

			query = { _id: user}
			update = { $addToSet : { groups : group } }

			User.update(query, update, function(err, num) {
				if(err) return next(err);

				if(0 === num)
				{
					return next(new Error('No user to modify'));
				}

				res.redirect('/group/' + req.session.group)
			})		
		})
	})

	//view group details
	app.get('/group/:id', loggedIn, function(req,res, next) {
		var id = req.param('id');

		var query = Group.findById(id);
		query.exec( function(err, group) {
			if(err) return next(err);

			if(!group) return next();

			res.render('group/viewGroup.jade', { group: group })
		})
	})

	//add group
	app.get('/group/add/', loggedIn, function(req,res) {
		res.render('group/add.jade');
	}) 

	//add group transactoin
	app.get('/group//transaction/newTransaction', function(req, res) {

		Group.findById()
		res.render('/transaction/newTransaction', {})
	})
}