/*
	transaction.js
	Transaction routes are handled here

	Revision history
	Hemanth Kona, 2013.11.18: created
	Hemanth Kona, 2013.11.22: Implemented MongoDB aggreagation framework to find the total amount spent
	Hemanth Kona, 2013.11.26: Sort by 

*/

var loggedIn = require('../middleware/loggedIn');
var mongoose = require('mongoose');
var Transaction = mongoose.model('Transaction');
var User = mongoose.model('User');
var numeral = require('numeral');
var fx = require('money');
var oxr = require('open-exchange-rates');
oxr.set({ app_id: 'f03d2d61cca9406abd745c5c3b4e66ed'});

module.exports = function(app) {

	app.get("/transaction/create", loggedIn, function(req, res) {
		res.render('transaction/create.jade');
	})

	//Create new transaction
	app.post("/transaction/create", loggedIn, function(req, res, next) {
		var place = req.param('place');
		var category = req.param('category');
		var paymentType = req.param('paymentType');
		var amountForeign = req.param('amountForeign');
		var groupId = req.param('groupId');
		var amountHome;
		var user = req.session.user;
		var currentCountry = req.session.currentCountry;
		var homeCountry = req.session.homeCountry;
		
		
		oxr.latest(function() {
			fx.base = oxr.base;
			fx.rates = oxr.rates;
			
			amountForeign = numeral(amountForeign).format('0.00');
			amountHome = fx(amountForeign).from(currentCountry).to(homeCountry);
			amountHome = numeral(amountHome).format('0.00');
					
			Transaction.create({
				user: user,
				place: place,
				category: category,
				paymentType: paymentType,
				amountForeign: amountForeign,
				amountHome: amountHome,
				groupId: groupId
			}, function(err, transaction) {
			if(err) return next(err);
				res.redirect('/transaction/' + transaction.id);
			});
			
		});
	})

	//View particular transaction
	app.get("/transaction/:id", loggedIn, function(req, res, next) {
		var id = req.param('id');

		var query = Transaction.findById(id).populate('user');
		query.exec(function(err, transaction) {
			if(err) return next(err);

			if(!transaction) return next();

			res.render('transaction/view.jade', {transaction: transaction })		
		})
	})

	//view all transactions
	app.get("/transactions", loggedIn, function(req, res, next) {
		getSumOfTransactions(req, function(transactions, totals) {
			res.render('transaction/index.jade', { transactions: transactions, totals: totals});
		})
	})

	function getSumOfTransactions(req, callback){
		var user = req.session.user;
		var limit = req.param('limit') || 10;

		var date = new Date();
		var month = req.param('month') || date.getMonth();
		var year = req.param('year') || date.getFullYear();
		var startDate = new Date(year, --month, 12);
		var endDate = new Date(year, --month, 31);

		var query = Transaction.find( {
			user:user,
		 //'created': { $gt: startDate, $lt : endDate  }
		  } );
		query.limit(limit)

		query.exec(function(err, transactions) {
			if(err) return next(err);

			if(!transactions) return next();

			Transaction.aggregate()
				.match({ user: user})
				.limit(limit)
				.group({ 
					_id: null,
					totalForeign: { $sum: '$amountForeign' },
					totalHome: { $sum: '$amountHome' }
				})
				.exec(function(err,totals) {
					if(err) return next(err);

					totals.forEach(function(total) {
						total.totalForeign = numeral(total.totalForeign).format('0.00');
						total.totalHome = numeral(total.totalHome).format('0.00');
					}) 
					console.log(transactions[0].created.getMonth());
					req.session.totals = totals;
					
					callback(transactions, totals);
				})
		});

	}

	//Update
	app.get("/transaction/edit/:id", loggedIn, function(req, res, next) {
		res.render('transaction/create.jade', {
			transaction: Transaction.findById(req.param('id'))
		})
	})

	app.post("/transaction/edit/:id", loggedIn, function(req, res, next) {
		var id = req.param('id');
		var user = req.session.user;
		var place = req.param('place');
		var category = req.param('category');
		var paymentType = req.param('paymentType');
		var amountForeign = req.param('amountForeign');
		var currentCountry = req.session.currentCountry;
		var homeCountry = req.session.homeCountry;

		oxr.latest(function() {
			fx.base = oxr.base;
			fx.rates = oxr.rates;
			
			amountHome = fx(amountForeign).from(currentCountry).to(homeCountry)
			amountHome = numeral(amountHome).format('0.00');

			var query = { _id: id, user: user};
			var update = {};
			update.place = place;
			update.category = category;
			update.paymentType = paymentType;
			update.amountForeign = amountForeign;
			update.amountHome = amountHome;

			Transaction.update(query, update, function (err, num) {
				if(err) return next(err);
				
				if(0 === num){
					return next(new Error('No transaction to modify'));
				}

				res.redirect("/transaction/"+ id);
			})
		})
	})

	//Remove
	app.get("/transaction/remove/:id", loggedIn, function(req,res, next) {
		var id = req.param('id');

		Transaction.findOne({_id: id}, function (err, transaction) {
			//validate user
			if(transaction.user != req.session.user){
				return res.send(403);
			}

			transaction.remove(function(err) {
				if(err) return next(err);

				res.redirect('/transactions');
			})
		})
		
	})

	//Sort by date, place, category, paymentType, amountForeign, amountHome

	app.get("/transactions/sortBy/:sort", loggedIn, function(req, res, next) {
		var sort = req.param('sort');
		var user = req.session.user;
		var totals = req.session.totals;
		
		if(!req.session.sortDirection) req.session.sortDirection = 1;
		else if(req.session.sortDirection === 1) req.session.sortDirection = -1;
		else req.session.sortDirection = 1;

		var query = Transaction.aggregate().match({ user: user})
		
		if(sort == "created"){
			query.sort({
				created : req.session.sortDirection
			})
		}
		
		else if(sort == "place"){
			query.sort({
				place : req.session.sortDirection
			})
		}
		else if(sort == "category"){
			query.sort({
				category : req.session.sortDirection
			})
		}
		
		else if(sort == "paymentType"){
			query.sort({
				paymentType : req.session.sortDirection
			})
		}

		else if(sort == "amountForeign"){
			query.sort({
				amountForeign : req.session.sortDirection
			})
		}
		
		else if(sort == "amountHome"){
			query.sort({
				amountHome : req.session.sortDirection
			})
		}

		query.exec(function(err,transactions) {
			if(err) return next(err);

			if(!transactions) return next();
			
			res.render('transaction/index.jade', { transactions: transactions, totals: totals});
		})

	})

};

exports.getSumOfTransactions = function(req, callback){
		var user = req.session.user;
		var limit = req.param('limit') || 10;

		var date = new Date();
		var month = req.param('month') || date.getMonth();
		var year = req.param('year') || date.getFullYear();
		var startDate = new Date(year, --month, 12);
		var endDate = new Date(year, --month, 31);

		var query = Transaction.find( {
			user:user,
		 //'created': { $gt: startDate, $lt : endDate  }
		  } );
		query.limit(limit)

		query.exec(function(err, transactions) {
			if(err) return next(err);

			if(!transactions) return next();

			Transaction.aggregate()
				.match({ user: user})
				.limit(limit)
				.group({ 
					_id: null,
					totalForeign: { $sum: '$amountForeign' },
					totalHome: { $sum: '$amountHome' }
				})
				.exec(function(err,totals) {
					if(err) return next(err);

					totals.forEach(function(total) {
						total.totalForeign = numeral(total.totalForeign).format('0.00');
						total.totalHome = numeral(total.totalHome).format('0.00');
					}) 
					console.log(transactions[0].created.getMonth());
					req.session.totals = totals;
					
					return callback(transactions, totals);
				})
		});

	}