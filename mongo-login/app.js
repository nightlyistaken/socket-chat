const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const bodyParser = require("body-parser");
var session = require("express-session");

mongoose.connect("mongodb://localhost:27017/dhairy", { useNewUrlParser: true });

const User = mongoose.model("User", {
  username: String,
  password: String,
});

var app = express();
app.set("trust proxy", 1); // trust first proxy
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 },
  })
);
app.use(bodyParser());

app.get("/", function (req, res, next) {
  console.log(req.session);
  if (req.session.user) res.sendFile(path.join(__dirname, "index.html"));
  else res.redirect("/login");
});

app.get("/login", function (req, res, next) {
  res.sendFile(path.join(__dirname, "login.html"));
});

app.get("/logout", function (req, res, next) {
  req.session.destroy(() => {
    res.redirect("/");
  });
});

app.post("/login", function (req, res, next) {
  // req.body --> username, password
  const newUser = new User({
    username: req.body.username,
    password: req.body.password,
  });
  newUser.save().then(function () {
    req.session.user = req.body.username;
    res.redirect("/");
  });
});

app.get("/users", function (req, res, next) {
  User.findOne({ username: req.query.search }).exec((error, data) => {
    res.send(data);
  });
});

app.listen(3000, function () {
  console.log("Listening on port 3000");
});
