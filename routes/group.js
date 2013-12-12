/*
	group.js
	Requests on Group model are handled here

	Revision history
	Hemanth Kona, 2013.11.30: created
*/

var loggedIn = require('../middleware/loggedIn');
var cleanString = require('../helpers/cleanString');

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
				'_id':0,
				groups: 1
			})
			.exec(function(err, user) {
				if(err) return next(err);

				if(!user) return next(err);

				user.forEach(function(groups) {
					
					groups = groups.groups;

					groups.forEach(function(group) {
						groupNames.push({name: group.name, groupId: group.groupId})
					})
					console.log(groupNames);

					res.render('group/index.jade', {groupNames: groupNames});
					
				})
		
			})

	})

	//create group
	app.get("/group/create", loggedIn, function(re, res) {
		res.render('group/create.jade');
	})

	app.post("/group/create", loggedIn, function(req, res, next) {
		var name = cleanString(req.param('name'));
		var user = req.session.user;
		var members = user;
		var numberOfMembers = 1;

		if(!name) return invalid();

		var query;
		var update;

		Group.create({
			name: name,
			admin: user,
			numberOfMembers : numberOfMembers,
			members: members
		}, function(err, group) {
			if(err) return next(err);

			console.log(req.session.group);
			
			req.session.currentGroupId = group.id;
			req.session.currentGroupName = group.name;
			
			var group = { name: name, groupId: group.id };

			query = { _id: user }
			update = { $addToSet : { groups : group } }

			User.update(query, update, function(err, num) {
				if(err) return next(err);

				if(0 === num)
				{
					return next(new Error('No user to modify'));
				}

				res.redirect('/group/' + req.session.currentGroupId)
			})		
		})

		function invalid() {
			return res.render('group/create.jade', { invalid: true });
		}
	})

	//view group details
	app.get('/group/:id', loggedIn, function(req,res, next) {
		var id = req.param('id');

		var query = Group.findById(id);
		query.exec( function(err, group) {
			if(err) return next(err);

			if(!group) return next();

			req.session.currentGroupId = group.id;
			req.session.currentGroupName = group.name;

			console.log(req.session.currentGroupId);
			console.log(req.session.currentGroupName);

			res.render('group/view.jade', { group: group })
		})
	})

	app.post('/group/addMember', loggedIn, function(req, res, next) {
		var currentGroupId = req.session.currentGroupId;
		var currentGroupName = req.session.currentGroupName;

		var groupId = req.param('groupId');
		var user = req.param('groupMember');

		var update = { $addToSet: { members: user }, $inc : { numberOfMembers: 1}};

		Group.update({_id: currentGroupId }, update, function(err, num) {
			if(err) return next(err);

			if (0 == num) {
				return new Error('No document updated');
			};

			var group = { name: currentGroupName, groupId: currentGroupId };

			query = { _id: user }
			update = { $addToSet : { groups : group } }

			User.update(query, update, function(err, num) {
				if(err) return next(err);

				if(0 === num)
				{
					return next(new Error('No user to modify'));
				}

				res.redirect('/group/' + currentGroupId)
			})

			User.update({_id: user}, updateUser, function(err, num) {
				if(err) return next(err);

				if (0 == num) {
					return new Error('No document updated');
				}

			})
	
		})
		
	})
}