/*
    loggedIn.js
	Checks whether the user is signed, if not then redirects to login page

    Revision history
	Hemanth Kona, 2013.11.12: created
*/

module.exports = function isLoggedIn(req, res, next) {
	if(!(req.session && req.session.user)) {
		return res.redirect('/login');
	}
	next();
};