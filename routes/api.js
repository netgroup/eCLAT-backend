var express = require("express");
var authRouter = require("./auth");
var packageRouter = require("./package");

var app = express();

app.use("/auth/", authRouter);
app.use("/package/", packageRouter);

module.exports = app;
