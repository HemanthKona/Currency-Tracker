/*
	transaction.js
	Transaction schema is defined in this file

	Revision history
	Hemanth Kona, 2013.11.12: created
	Hemanth Kona, 2013.11.30: groupId field added
*/

var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;
var createdDate = require('../plugins/createdDate');

// Transaction schema definition
var schema = mongoose.Schema({
	user: { type : String, ref: 'User' },
	place: { type: String },
	category: { type: String, trim: true },
	paymentType: { type: String, trim: true},
	amountForeign: { type : Number, trim: true, required: true, min: 0 },
	amountHome: { type : Number, trim: true },
	groupId: { type : Number, ref: 'Group', Default: 0 }
});

// add created date property to the schema
schema.plugin(createdDate);

//exporting transaction schema
module.exports = mongoose.model('Transaction', schema);