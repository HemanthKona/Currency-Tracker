/*
	group.js
	Group schema is defined in this file

	Revision history
	Hemanth Kona, 2013.11.12: created
	Hemanth Kona, 2013.11.30: schema modified, added memebers field
*/

var mongoose = require('mongoose');
var createdDate = require('../plugins/createdDate');

// Transaction schema definition
var schema = mongoose.Schema({
	name: { type: String, trim: true },
	members: { type: Array(10), ref : 'User' }
});

// add created date property to the schema
schema.plugin(createdDate);

//exporting transaction schema
module.exports = mongoose.model('Group', schema);