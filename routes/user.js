var express = require("express");
const UserController = require("../controllers/UserController");

var router = express.Router();

router.get("/", UserController.userList);
router.get("/:username", UserController.userDetail);
router.get("/:username/packages", UserController.userPackages);

module.exports = router;
