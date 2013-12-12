/*
	group.js
	Group schema is defined in this file

	Revision history
	Hemanth Kona, 2013.11.12: created
	Hemanth Kona, 2013.11.30: schema modified, added memebers field
	Hemanth Kona, 2013.12.11: admin field is added to schema
*/

var mongoose = require('mongoose');
var createdDate = require('../plugins/createdDate');

// Transaction schema definition
var schema = mongoose.Schema({
	groupNumber: { type: Number, required: true},
	name: { type: String, trim: true },
	admin: { type: String, ref: 'User' },
	numberOfMembers: { type: Number, Default: 1 },
	members: { type: Array(10), ref : 'User' }
});

// add created date property to the schema
schema.plugin(createdDate);

//exporting transaction schema
module.exports = mongoose.model('Group', schema);