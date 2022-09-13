var express = require("express");
var authRouter = require("./auth");
var packageRouter = require("./package");
var userRouter = require("./user");

var app = express();

app.use("/auth/", authRouter);
app.use("/packages/", packageRouter);
app.use("/users/", userRouter);

module.exports = app;
