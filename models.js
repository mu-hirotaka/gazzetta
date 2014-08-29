var mongoose = require('mongoose');

var db = mongoose.connect('mongodb://localhost/gazzetta');

var Player = new mongoose.Schema({
  id:        { type: Number  },
  group:     { type: Number  },
  fullName:  { type: String  },
  shortName: { type: String  },
  valid:     { type: Boolean }
});
exports.Player = db.model('player', Player);

//var Rating = new mongoose.Schema({
//  id:    { type: Number },
//  group: { type: Number },
//  num:   { type: Number, default: 0 },
//  sum:   { type: Number, default: 0 }
//});
//exports.Rating = db.model('rating', Rating);

//var Opinion = new mongoose.Schema({
//  id:        { type: Number },
//  group:     { type: Number },
//  opinion:   { type: String },
//  createdAt: { type: Number }
//});
//exports.Opinion = db.model('opinion', Opinion);

//var Summary = new mongoose.Schema({
//  group:     { type: Number },
//  comment:   { type: String },
//  createdAt: { type: Number }
//});
//exports.Summary = db.model('summary', Summary);

//var Mom = new mongoose.Schema({
//  id:    { type: Number },
//  group: { type: Number },
//  num:   { type: Number },
//});
//exports.Mom = db.model('mom', Mom);
