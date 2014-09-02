var express = require('express');
var router = express.Router();
var config = require('../config');

/* GET home page. */
router.get('/', function(req, res) {
  var uri = '';
  if (process.env.NODE_ENV === 'production') {
    uri = config.production.uri;
    res.render('index', { title: '俺ガゼッタ', uri: uri, env: 'production'});
  } else {
    uri = 'http://' + config.dev.host + ':' + config.dev.port + '/';
    res.render('index', { title: '俺ガゼッタ', uri: uri, env: 'development'});
  }
});

module.exports = router;
