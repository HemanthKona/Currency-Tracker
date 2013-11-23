module.exports = function(app) {
	app.use(function(req, res, next) {
		res.status(404);

		if(req.accepts('html')){
			return res.send("<h3>Page not found</h3>");
		}

		if(req.accepts('json')) {

			return res.json({ error: 'Not found' });
		}

		res.type('txt');
		res.send("Page not found !.");
	});

	app.use(function(err, req, res, next) {
		console.error('error at %s \n', req.url, err.stack);
		res.send(500, "500 error");
	});
};