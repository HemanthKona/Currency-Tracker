/*
	createdDate.js
	Return the current date and time

	Revision history
	Hemanth Kona, 2013.11.12: created
*/

module.exports = function(schema) {
	schema.add({
		created: {type: Date, default: Date.now}
	});
};