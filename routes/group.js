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
var Transaction = mongoose.model('Transaction');
var numeral = require('numeral');


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
						groupNames.push({name: group.name, groupId: group.groupId, groupNumber: group.groupNumber})
					})
					console.log(groupNames);


					res.render('group/index.jade', {groupNames: groupNames});
					
				})
		
			})

	})

	//create group
	app.get("/group/create", loggedIn, function(req, res) {
		req.session.success = false;
		req.session.exists = false;

		res.render('group/create.jade');
	})

	app.post("/group/create", loggedIn, function(req, res, next) {
		var name = cleanString(req.param('name'));
		var user = req.session.user;
		var members = user;
		var numberOfMembers = 1;
		var groupNumber = 0;

		Group.aggregate()
			.group({
				_id: null, 
				groupMax: { $max: '$groupNumber'}
			})
			.exec(function(err, group) {
				if(err) return next();

				console.log(group);

				if(!group || group.length == 0) groupNumber = 1;

				else{
					groupNumber = ++group[0].groupMax;
				}
				
				if(!name) return invalid();

				var query;
				var update;

				Group.create({
					groupNumber: groupNumber,
					name: name,
					admin: user,
					numberOfMembers : numberOfMembers,
					members: members
				}, function(err, group) {
					if(err) return next(err);

					
					req.session.currentGroupId = group.id;
					req.session.currentGroupName = group.name;
					req.session.currentGroupNumber = group.groupNumber;

					console.log(req.session.currentGroupNumber);

					var group = { name: name, groupId: group.id, groupNumber: group.groupNumber };

					query = { _id: user }
					update = { $addToSet : { groups : group } }

					User.update(query, update, function(err, num) {
						if(err) return next(err);

						if(0 === num)
						{
							return next(new Error('No user to modify'));
						}

						res.redirect('/group/' + req.session.currentGroupNumber)
					})
			});
		
				
		})

		function invalid() {
			return res.render('group/create.jade', { invalid: true });
		}
	})

	//view group details
	app.get('/group/:id', loggedIn, function(req,res, next) {
		var id = req.param('id');
		var user = req.session.user;
		var exists = req.session.exists;
		var success = req.session.success;
		
		req.session.currentGroupNumber = id;
		
		var query = Group.find({groupNumber: id});
		query.exec( function(err, group) {
			if(err) return next(err);

			if(!group) return next();
			console.log(group);
			console.log(group[0].groupNumber);

			Transaction.find({groupId: group[0].groupNumber}, function(err, transactions) {
				if(err) return next(err);
				
				if(transactions.length == 0) {
					
					res.render('group/view.jade', { group: group[0], transactions: 0, 
						exists: exists, success: success 
					})
				}

				else {
					Transaction.aggregate()
						.match({ groupId:group[0].groupNumber})
						.group({
							_id: null,
							totalForeign: { $sum: '$amountForeign' },
							totalHome: { $sum: '$amountHome' }
						})
						.exec(function(err, totals) {
							if(err) return next(err);

							totals.forEach(function(total) {
								total.totalForeign = numeral(total.totalForeign).format('0.00');
								total.totalHome = numeral(total.totalHome).format('0.00');
							}) 
							console.log(totals);
							console.log(transactions[0].created.getMonth());
							req.session.totals = totals;
		
							res.render('group/view.jade', { transactions: transactions, 
								totals: totals, group: group[0], success: success, 
								exists: exists 
							})
							
						})
				}
			})

		})
	})

	app.post('/group/addMember', loggedIn, function(req, res, next) {
		var currentGroupId = req.session.currentGroupId;
		var currentGroupName = req.session.currentGroupName;
		var currentGroupNumber = req.session.currentGroupNumber;

		var groupNumber = req.param('groupNumber');
		var groupName = req.param('groupName');

		var user = req.param('groupMember');
		
		var update;

		Group.find({ members: user}, function(err, members) {
			if(err) return next();

			if(members.length == 0){
				req.session.success = true;
				req.session.exists = false;				
				update = { $addToSet: { members: user }, $inc : { numberOfMembers: 1}};
			}
			else{
				req.session.success = false;
				req.session.exists = true;				
				res.redirect('/group/' + currentGroupNumber);
			}

			Group.update({groupNumber: currentGroupNumber }, update, function(err, num) {
				if(err) return next(err);

				if (0 == num) {
					return new Error('No document updated');
				};

				var group = { name: groupName, groupId: currentGroupId, groupNumber: currentGroupNumber };

				query = { _id: user }
				update = { $addToSet : { groups : group } }

				User.update(query, update, function(err, num) {
					if(err) return next(err);

					if(0 === num)
					{
						return next(new Error('No user to modify'));
					}

					res.redirect('/group/' + currentGroupNumber)
				})
	
			})
		})

		
	})

	app.get('/group/members/:id', loggedIn, function(req, res, next) {
		var id = req.session.currentGroupNumber;

		var query = Group.find({ groupNumber: id});
		query.exec(function(err, group) {
			if(err) return next(err);

			res.render('group/members.jade', { group: group[0] });
		})
	})
}