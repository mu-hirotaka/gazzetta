var express = require('express');
var router = express.Router();
var config = require('../config');

/* GET home page. */
router.get('/', function(req, res) {
  var uri = '';
  if (process.env.NODE_ENV === 'production') {
    uri = 'http://' + config.production.host + ':' + config.production.port + '/';
  } else {
    uri = 'http://' + config.dev.host + ':' + config.dev.port + '/';
  }
  res.render('index', { title: '国民総ガゼッタ(仮)', uri: uri });
});

module.exports = router;
