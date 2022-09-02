var express = require("express");
const PackageController = require("../controllers/PackageController");

var router = express.Router();

router.get("/", PackageController.packageList);
router.get("/:name", PackageController.packageDetail);
router.post("/", PackageController.packageStore);
router.post("/:name/version", PackageController.packageVersionAdd);
router.patch("/:name", PackageController.packageUpdate);
router.delete("/:name", PackageController.packageDelete);

module.exports = router;
