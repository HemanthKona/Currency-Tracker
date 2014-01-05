/*
    cleanString.js
    Validates the string recieved from input text field
    
    Revision history
	Hemanth Kona, 2013.11.12: created
*/


module.exports = function validString(s) {
	if('string' != typeof s){
		s = '';
	}
	return s.trim();
};