var express = require("express");
const UserController = require("../controllers/UserController");

var router = express.Router();

router.get("/", UserController.userList);
router.get("/:id", UserController.userDetail);

module.exports = router;
