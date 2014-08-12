var express = require('express');
var router = express.Router();
var model = require('../models.js');

var Player = model.Player;

router.get('/', function(req, res) {
  res.render('debug/index', {});
});

router.get('/localstrage_clear', function(req, res) {
  res.render('debug/localstrage_clear', {});
});

module.exports = router;
