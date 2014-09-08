var express = require('express');
var router = express.Router();
var url = require('url');
var us = require('underscore')._;
var config = require('../config');
var model = require('../models.js');
var redis = require('redis'),
    client = redis.createClient();

var Player = model.Player;

router.get('/', function(req, res) {
  var uri = '';
  if (process.env.NODE_ENV === 'production') {
    uri = config.production.uri;
  } else {
    uri = 'http://' + config.dev.host + ':' + config.dev.port + '/';
  }
  res.render('debug/index', { title: '俺ガゼッタ', uri: uri });
});

router.get('/players', function(req, res) {
  var url_parts = url.parse(req.url, true);
  var groupId = url_parts.query['gid'];
  var params = {}
  if (groupId) {
    params['group'] = groupId;
  }
  Player.find(params, function(err, players) {
    players = us.sortBy(players, function (player) {
      return player.id;
    });
    res.render('debug/players', { players: players });
  });
});

router.post('/player', function(req, res) {
  Player.findOne({id:parseInt(req.body.id), group: parseInt(req.body.gid)}, function(err, player){
    res.render('debug/player', { player: player });
  });
});

router.post('/update_player', function(req, res) {
  Player.findOne({id:parseInt(req.body.id), group: parseInt(req.body.gid)}, function(err, player){
    player.fullName = req.body.fullName;
    player.shortName = req.body.shortName;
    player.valid = parseInt(req.body.valid) ? true : false;
    player.save();
  });
  res.redirect('/skdebug/players');
});

router.post('/delete_player', function(req, res) {
  Player.findOne({id:parseInt(req.body.id), group: parseInt(req.body.gid)}, function(err, player){
    player.remove();
  });
  res.redirect('/skdebug/players');
});

router.get('/localstrage_clear', function(req, res) {
  res.render('debug/localstrage_clear', {});
});

router.get('/create_player', function(req, res) {
  res.render('debug/create_player', {});
});

router.post('/create_player_done', function(req, res) {
  var id = parseInt(req.body.id);
  var group = parseInt(req.body.group);
  var fullName = req.body.fullName;
  var shortName = req.body.shortName;
  var valid = req.body.valid == 1 ? true : false;
  var player = new Player({ id: id, group: group, fullName: fullName, shortName: shortName, valid: valid });
  player.save(function(err) {
    console.log(err);
  });
  res.redirect('/');
});

router.post('/player_comment', function(req, res) {
    var commentKey = "comment:" + req.body.gid + ':' + req.body.id;
    client.lrange(commentKey, 0, 10000, function(err, comments) {
      res.render('debug/select_comments', { comments: comments });
    });
});

router.get('/select_all_summaries', function(req, res) {
  var url_parts = url.parse(req.url, true);
  var groupId = url_parts.query['gid'] || 2;
  client.lrange("summary:" + groupId, 0, 10000 ,function(err, summaries) {
    res.render('debug/select_all_summaries', { summaries: summaries });
  });
});

module.exports = router;
