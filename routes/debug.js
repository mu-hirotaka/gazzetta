var express = require('express');
var router = express.Router();
var model = require('../models.js');

var Player = model.Player;

router.get('/', function(req, res) {
  res.render('debug/index', {});
});

router.get('/players', function(req, res) {
  Player.find({}, function(err, players) {
    res.render('debug/players', { players: players, gid: 1 });
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
  res.redirect('/debug/players');
});

router.post('/delete_player', function(req, res) {
  Player.findOne({id:parseInt(req.body.id)}, function(err, player){
    player.remove();
  });
  res.redirect('/debug/players');
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

module.exports = router;
