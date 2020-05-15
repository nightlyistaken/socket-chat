const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const bodyParser = require("body-parser");
var app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
var session = require("express-session");

mongoose.connect("mongodb://localhost:27017/dhairy", { useNewUrlParser: true });
var sharedsession = require("express-socket.io-session");

const User = mongoose.model("User", {
  username: String,
  password: String,
});
app.set("trust proxy", 1); // trust first proxy
var sess = session({
  secret: "keyboard cat",
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 60000 },
});
app.use(sess);

app.use(bodyParser());
io.use(
  sharedsession(sess, {
    autoSave: true,
  })
);

app.get("/", function (req, res, next) {
  if (req.session.user) res.sendFile(path.join(__dirname, "index.html"));
  else res.redirect("/login");
});

app.get("/login", function (req, res, next) {
  res.sendFile(path.join(__dirname, "login.html"));
});

app.get("/chat", function (req, res, next) {
  if (req.session.user) res.sendFile(path.join(__dirname, "chat.html"));
  else res.redirect("/login");
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

io.on("connection", (socket) => {
  io.sockets.emit(
    "msg",
    "New user connected: " + socket.handshake.session.user
  );
  socket.on("msg", (data) => {
    console.log(data);
    io.sockets.emit("msg", socket.handshake.session.user + " : " + data);
  });
});

server.listen(3000, function () {
  console.log("Listening on port 3000");
});
