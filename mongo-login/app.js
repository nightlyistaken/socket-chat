const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const bodyParser = require("body-parser");

mongoose.connect('mongodb://localhost:27017/dhairy', { useNewUrlParser: true })

const User = mongoose.model('User', {
 username: String,
 password: String
});

var app = express();

app.use(bodyParser());

app.get('/', function(req, res, next) {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/login', function(req, res, next) {
  // req.body --> username, password
  const newUser = new User({ username: req.body.username, password: req.body.password });
  newUser.save().then(function() {
    res.send('Yey! User saved :)')
  });
});

app.get('/users', function(req, res, next) {
  User.findOne({ username: req.query.search }).exec((error, data) => {
    res.send(data);
  })
});

app.listen(3000, function() {
  console.log('Listening on port 3000')
});
