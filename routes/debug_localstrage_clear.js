var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
  res.render('debug_localstrage_clear', {});
});

module.exports = router;
