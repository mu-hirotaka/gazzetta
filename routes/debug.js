var express = require('express');
var router = express.Router();
var model = require('../models.js');

var Player = model.Player;

router.get('/', function(req, res) {
  res.render('debug', {});
});

module.exports = router;
