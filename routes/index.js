/*
  index.js
  exports all routes
  
  Revision history
  Hemanth Kona, 2013.11.12: created
*/

var errors = require('./errors');
var login = require('./login');
var transaction = require('./transaction');
var user = require('./user');
var group = require('./group');

module.exports = function(app) {

  //get home page
  app.get('/', function(req, res, next) {
    res.render('index.jade');
  });

  // login, signup
  login(app);

  // transactions
  transaction(app);

  //user
  user(app);

  //group
  group(app);
};