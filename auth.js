var Db = require('mongodb').Db;
var Server = require('mongodb').Server;
var MongoStore = require( 'connect-mongodb');
var server_config;
var db;
var sessionStore;
var user;


var initialize = module.exports = function(init_obj) {
  server_config = new Server(init_obj.mongo_info.domain, init_obj.mongo_info.port, init_obj.mongo_info.params);
  db = new Db(init_obj.mongo_info.dbname, server_config, {});
  sessionStore = this.sessionStore = new MongoStore({db: db});
  user = init_obj.user_model;
}


initialize.prototype = {
  isLogined: function(req, res, logined, notlogined) {
    sessionStore.get(req.session.id, function(err, sess) {
      if(sess && sess.userid) {
        logined(req, res);
      } else {
        notlogined(req, res);
      }
    });
  },
  deleteSession: function(req, res, next) {
    sessionStore.destroy(req.session.id, function(err) {
      req.session.destroy();
      next();
    });
  },
  checkUser: function(req, res, next) {
    user.findOne({id: req.body.id}, function(err, docs) {
      if(docs !== null && docs.passwd === req.body.pw) {
        req.session.userid = req.body.id;
        next();
      } else {
        res.redirect('/login');
      }
    });
  },
  addUser: function(req, res, next) {
    user.findOne({id: req.body.id}, function(err, docs) {
      if(docs !== null) {
        res.redirect('/signup');
      } else if(req.body.pw !== req.body.pw2) {
        res.redirect('/signup');
      } else {
        new user({id: req.body.id, name: req.body.name, passwd: req.body.pw}).save(function(err) {
        });
        req.session.userid = req.body.id;
        next();
      }
    });
  }
}
