var express = require('express');
var router = express.Router();
var url = require('url');
var us = require('underscore')._;
var config = require('../config');
var model = require('../models.js');
var redis = require('redis'),
    client = redis.createClient();

var Player = model.Player;
var Group = model.Group;
var Event = model.Event;
var Maintenance = model.Maintenance;

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
    res.redirect('/skdebug/create_player');
  });
});

router.post('/player_comment', function(req, res) {
    var commentKey = "comment:" + req.body.gid + ':' + req.body.id;
    client.lrange(commentKey, 0, 10000, function(err, comments) {
      res.render('debug/select_comments', { comments: comments });
    });
});

router.get('/select_all_summaries', function(req, res) {
  var url_parts = url.parse(req.url, true);
  var groupId = url_parts.query['gid'] || 3;
  client.lrange("summary:" + groupId, 0, 10000 ,function(err, summaries) {
    res.render('debug/select_all_summaries', { summaries: summaries });
  });
});


router.get('/redis_form', function(req, res) {
  client.multi().keys("*", function (err, replies) {
    client.mget(replies);
  }).exec(function (err, replies) {
    res.render('debug/redis_form', { keys: replies[0] });
  });
});

router.post('/redis_get', function(req, res) {
  var key = req.body.key;
  client.get(key, function(err, val) {
    res.render('debug/redis_get', { key: key, value: val});
  });
});

router.post('/redis_delete', function(req, res) {
  var key = req.body.key;
  client.del(key, function(err, val) {
    res.redirect('/skdebug/redis_form');
  });
});

router.post('/redis_list_get', function(req, res) {
  var key = req.body.key;
  client.lrange(key, 0, 1000, function(err, values) {
    res.render('debug/redis_list_get', { key: key, values: values});
  });
});

router.post('/redis_list_length', function(req, res) {
  var key = req.body.key;
  client.llen(key, function(err, value) {
    res.render('debug/redis_list_length', { key: key, length: value});
  });
});

router.post('/redis_list_delete', function(req, res) {
  var key = req.body.key;
  client.lpop(key, function(err, val) {
    res.redirect('/skdebug/redis_form');
  });
});

router.get('/create_group', function(req, res) {
  res.render('debug/create_group', {});
});

router.post('/create_group_done', function(req, res) {
  var id = parseInt(req.body.id);
  var currentValidId = parseInt(req.body.currentValidId);
  var content = req.body.content;
  var group = new Group({ id: id, currentValidId: currentValidId, content: content });
  group.save(function(err) {
    res.redirect('/skdebug');
  });
});

router.get('/groups', function(req, res) {
  Group.find({}, function(err, groups) {
    res.render('debug/groups', { groups: groups });
  });
});

router.post('/group', function(req, res) {
  Group.findOne({id:parseInt(req.body.id)}, function(err, group){
    res.render('debug/group', { group: group });
  });
});

router.post('/update_group', function(req, res) {
  Group.findOne({id:parseInt(req.body.id)}, function(err, group){
    group.currentValidId = parseInt(req.body.currentValidId);
    group.content = req.body.content;
    group.save();
    res.redirect('/skdebug/groups');
  });
});

router.post('/delete_group', function(req, res) {
  Group.findOne({id:parseInt(req.body.id)}, function(err, group){
    group.remove();
    res.redirect('/skdebug/groups');
  });
});

router.get('/create_event', function(req, res) {
  res.render('debug/create_event', {});
});

router.post('/create_event_done', function(req, res) {
  var id = parseInt(req.body.id);
  var content = req.body.content;
  var valid = req.body.valid == 1 ? true : false;
  var event = new Event({ id: id, content: content, valid: valid });
  event.save(function(err) {
    res.redirect('/skdebug');
  });
});

router.get('/events', function(req, res) {
  Event.find({}, function(err, events) {
    res.render('debug/events', { events: events });
  });
});

router.post('/event', function(req, res) {
  Event.findOne({id:parseInt(req.body.id)}, function(err, event){
    res.render('debug/event', { event: event });
  });
});

router.post('/update_event', function(req, res) {
  Event.findOne({id:parseInt(req.body.id)}, function(err, event){
    event.valid = parseInt(req.body.valid) ? true : false;
    event.content = req.body.content;
    event.save();
    res.redirect('/skdebug/events');
  });
});

router.post('/delete_event', function(req, res) {
  Event.findOne({id:parseInt(req.body.id)}, function(err, event){
    event.remove();
    res.redirect('/skdebug/events');
  });
});

router.get('/create_maintenance', function(req, res) {
  res.render('debug/create_maintenance', {});
});

router.post('/create_maintenance_done', function(req, res) {
  var id = parseInt(req.body.id);
  var valid = req.body.valid == 1 ? true : false;
  var maintenance = new Maintenance({ id: id, valid: valid });
  maintenance.save(function(err) {
    res.redirect('/skdebug');
  });
});

router.get('/maintenances', function(req, res) {
  Maintenance.find({}, function(err, maintenances) {
    res.render('debug/maintenances', { maintenances: maintenances });
  });
});

router.post('/maintenance', function(req, res) {
  Maintenance.findOne({id:parseInt(req.body.id)}, function(err, maintenance){
    res.render('debug/maintenance', { maintenance: maintenance });
  });
});

router.post('/update_maintenance', function(req, res) {
  Maintenance.findOne({id:parseInt(req.body.id)}, function(err, maintenance){
    maintenance.valid = parseInt(req.body.valid) ? true : false;
    maintenance.save();
    res.redirect('/skdebug/maintenances');
  });
});

router.post('/delete_maintenance', function(req, res) {
  Maintenance.findOne({id:parseInt(req.body.id)}, function(err, maintenance){
    maintenance.remove();
    res.redirect('/skdebug/maintenances');
  });
});

module.exports = router;
