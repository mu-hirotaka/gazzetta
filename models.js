var mongoose = require('mongoose');

var db = mongoose.connect('mongodb://localhost/gazzetta');

var Player = new mongoose.Schema({
  id:        { type: Number },
  group:     { type: Number },
  name:      { type: String },
  imagePath: { type: String }
});

exports.Player = db.model('player', Player);

var Rating = new mongoose.Schema({
  id:  { type: Number },
  num: { type: Number, default: 0 },
  sum: { type: Number, default: 0 }
});

exports.Rating = db.model('rating', Rating);

var Opinion = new mongoose.Schema({
  id:        { type: Number },
  opinion:   { type: String },
  createdAt: { type: Number }
});

exports.Opinion = db.model('opinion', Opinion);
