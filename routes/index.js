var express = require('express');
var router = express.Router();
var url = require('url');
var config = require('../config');
var model = require('../models.js');
var redis = require('redis'),
    client = redis.createClient();

var title = '俺ガゼッタ';

/* GET home page. */
router.get('/', function(req, res) {
  var uri = '';
  if (process.env.NODE_ENV === 'production') {
    uri = config.production.uri;
    res.render('index', { title: title, uri: uri, env: 'production'});
  } else {
    uri = 'http://' + config.dev.host + ':' + config.dev.port + '/';
    res.render('index', { title: title, uri: uri, env: 'development'});
  }
});


var Player = model.Player;

router.get('/player_comments', function(req, res) {
  var url_parts = url.parse(req.url, true);
  var groupId = url_parts.query['gid'];
  var id = url_parts.query['id'];
  var key = "comment:" + groupId + ':' + id;

  Player.findOne({ id: id, group: groupId }, function(err, player){
    if (player) {
      client.lrange(key, 0, 100, function(err, values) {
        res.render('index/player_comments', { title: title, player: player, comments: values });
      });
    } else {
      res.redirect('/');
    }
  });
});

router.get('/summaries', function(req, res) {
  var url_parts = url.parse(req.url, true);
  var groupId = url_parts.query['gid'];
  var key = "summary:" + groupId;

  client.lrange(key, 0, 100, function(err, values) {
    res.render('index/summaries', { title: title, summaries: values });
  });
});

router.get('/records', function(req, res) {
  res.render('index/records', { title: title });
});

router.get('/record/:id', function(req, res) {
  res.render('index/record/' + req.params.id, { title: title });
});

module.exports = router;
