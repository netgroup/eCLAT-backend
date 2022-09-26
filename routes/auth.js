var express = require("express");
const AuthController = require("../controllers/AuthController");

var router = express.Router();

router.get("/login/github", AuthController.loginCallback);

module.exports = router;
