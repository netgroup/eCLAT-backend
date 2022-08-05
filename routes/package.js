var express = require("express");
const PackageController = require("../controllers/PackageController");

var router = express.Router();

router.get("/", PackageController.packageList);
router.get("/:name", PackageController.packageDetail);
router.post("/", PackageController.packageStore);
router.patch("/:name", PackageController.packageUpdate);
router.delete("/:name", PackageController.packageDelete);

module.exports = router;
