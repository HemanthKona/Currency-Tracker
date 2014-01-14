/*
	user.js
	User schema is defined in this file

	Revision history
	Hemanth Kona, 2013.11.12: created
	Hemanth Kona, 2013.11.20: currenctCountry and homeCountry fields are added to the schema
	Hemanth Kona, 2013.11.30: groups field added
*/

var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;
var createdDate = require('../plugins/createdDate');
var validEmail = require('../helpers/validateEmail');

// User schema definition
var schema = mongoose.Schema({
	_id: { type: String, lowercase: true, trim: true, validate: validEmail },
	name: { first: String, last: String },
	salt: { type: String, required: true },
	hash: { type: String, required: true },
	currentCountry: { type: String, default: 'CAD'} ,
	homeCountry: { type: String, default: 'INR' },
	groups: [{
		name: String,
		groupId: {type: ObjectId, ref: 'Group'},
		groupNumber: {type: Number, ref: 'Group'}
	}]
});

// add created date property to the schema
schema.plugin(createdDate);

//Virtual property: Property that do not go to the database
schema.virtual('fullname').get(function () {
	return this.name.first + ' ' + this.name.last;
});

//exporting user schema
module.exports = mongoose.model('User', schema);