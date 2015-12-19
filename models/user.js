

var mongoose = require('mongoose');
var Schema=mongoose.Schema;

//Schema made linent - for changes during run time by admin
var User = new Schema({},{strict: false});

module.exports=mongoose.model('User',User);
