/*
	index.js
	Starting point of the application

	Revision history
	Hemanth Kona, 2013.11.12: created
*/

var mongoose = require('mongoose');
var express = require('express');
// mongoose query 
require('express-mongoose');

var models = require('./models');
var routes = require('./routes');
var middleware = require('./middleware');

mongoose.set('debug', true);

mongoose.connect('mongodb://localhost/currency', function(err) {
	if(err) throw err;

	var app = express();
	middleware(app);
	routes(app);

	app.listen(3000, function() {
		console.log('Now listening on localhost port 3000');
	});
});

console.log("Hello Mongoose");