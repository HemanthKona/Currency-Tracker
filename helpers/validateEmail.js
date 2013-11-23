/*
	validateEmail.js
	Validates the email address

	Revision history
	Hemanth Kona, 2013.11.12: created
*/

var validator = require('email-validator');

module.exports = function(email) {
	return validator.validate(email);
};