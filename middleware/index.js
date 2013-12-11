var express = require('express');

module.exports = function(app) {
	app.use(express.logger('dev'));

	app.use(express.cookieParser());
	app.use(express.session({ secret: 'Currency Tracking' }));
	app.use(express.bodyParser());
	app.use(express.static('public'));

	app.set('port', process.env.PORT || 3000);
  	app.set('view engine', 'jade');
  	app.set('view options', { layout: true });

	app.use(function (req, res, next) {
		res.locals.session = req.session;
		next();
	});

};