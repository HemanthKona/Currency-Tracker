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

var mongoUri = 'mongodb://localhost/currency' || 'mongodb://admin:^ight^@dharma.mongohq.com:10068/currency';

//mongoose.set('debug', true);

//Connecting to mongo instance
mongoose.connect(mongoUri, function(err) {
	if(err) throw err;

	var app = express();
	middleware(app);
	routes(app);

	var port = app.get('port');

	app.listen(port, function() {
		console.log('Now listening on localhost port ' + port);
	});
});

console.log("Hello Mongoose");