var mongoose = require('mongoose');

var db = mongoose.connect('mongodb://localhost/gazzetta');

var Player = new mongoose.Schema({
  id:        { type: Number },
  group:     { type: Number },
  name:      { type: String },
  imagePath: { type: String }
});

exports.Player = db.model('player', Player);
