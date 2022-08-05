const Package = require("../models/PackageModel");
const { body, validationResult } = require("express-validator");
const apiResponse = require("../helpers/apiResponse");
const auth = require("../middlewares/jwt");
const UserModel = require("../models/UserModel");

/**
 * Package List.
 *
 * @returns {Object}
 */
exports.packageList = [
  function (req, res) {
    try {
      Package.find({}).then((packages) => {
        if (packages.length > 0) {
          return apiResponse.successResponseWithData(
            res,
            "Operation success",
            packages
          );
        } else {
          return apiResponse.successResponseWithData(
            res,
            "Operation success",
            []
          );
        }
      });
    } catch (err) {
      //throw error in json response with status 500.
      return apiResponse.ErrorResponse(res, err);
    }
  },
];

/**
 * Package Detail.
 *
 * @param {string}      name
 *
 * @returns {Object}
 */
exports.packageDetail = [
  function (req, res) {
    try {
      Package.findOne({ name: req.params.name }).then((package) => {
        if (package !== null) {
          return apiResponse.successResponseWithData(
            res,
            "Operation success",
            package
          );
        } else {
          return apiResponse.successResponseWithData(
            res,
            "Operation success",
            {}
          );
        }
      });
    } catch (err) {
      //throw error in json response with status 500.
      return apiResponse.ErrorResponse(res, err);
    }
  },
];

/**
 * Package Upload.
 *
 * @param {string}      name
 * @param {string}      url
 * @param {string}      version
 * @param {string}      author
 * @param {string}      description
 *
 *
 * @returns {Object}
 */
exports.packageStore = [
  auth,
  body("name", "Name must not be empty")
    .notEmpty()
    .trim()
    .escape()
    .custom((value, { req }) => {
      return Package.findOne({ name: value }).then((package) => {
        if (package) {
          return Promise.reject("Package already exist with this name.");
        }
      });
    }),
  body("url", "Url must not be empty.").isLength({ min: 3 }).trim().escape(),
  body("version", "Version must not be empty.").notEmpty().trim().escape(),
  body("description", "Description must not be empty.")
    .notEmpty()
    .trim()
    .escape(),

  (req, res) => {
    try {
      const errors = validationResult(req);

      var package = new Package({
        name: req.body.name,
        url: req.body.url,
        version: req.body.version,
        author: req.auth,
        description: req.body.description,
      });

      if (!errors.isEmpty()) {
        return apiResponse.validationErrorWithData(
          res,
          "Validation Error.",
          errors.array()
        );
      } else {
        //Save package.
        package.save(function (err) {
          if (err) {
            return apiResponse.ErrorResponse(res, err);
          }
          return apiResponse.successResponseWithData(
            res,
            "Package added with success.",
            package
          );
        });
      }
    } catch (err) {
      //throw error in json response with status 500.
      return apiResponse.ErrorResponse(res, err);
    }
  },
];

/**
 * Package update.
 *
 * @param {string}      url
 * @param {string}      version
 * @param {string}      description
 *
 * @returns {Object}
 */
exports.packageUpdate = [
  auth,
  body("url", "Url must not be empty.").isLength({ min: 3 }).trim().escape(),
  body("version", "Version must not be empty.").notEmpty().trim().escape(),
  body("description", "Description must not be empty.")
    .notEmpty()
    .trim()
    .escape(),

  (req, res) => {
    try {
      const errors = validationResult(req);

      var updatedPackage = {
        //possiamo cambiare il nome del pacchetto?
        url: req.body.url,
        version: req.body.version,
        description: req.body.description,
      };

      if (!errors.isEmpty()) {
        return apiResponse.validationErrorWithData(
          res,
          "Validation Error.",
          errors.array()
        );
      } else {
        Package.findOne(
          { name: req.params.name },
          function (err, foundPackage) {
            if (foundPackage === null) {
              return apiResponse.notFoundResponse(
                res,
                "Package with this name does not exist"
              );
            } else {
              // Check authorized user
              if (foundPackage.author !== req.auth._id) {
                return apiResponse.unauthorizedResponse(
                  res,
                  "You are not authorized to do this operation."
                );
              } else {
                // update Package.
                Package.findOneAndUpdate(
                  { name: req.params.name },
                  updatedPackage,
                  function (err) {
                    if (err) {
                      return apiResponse.ErrorResponse(res, err);
                    } else {
                      return apiResponse.successResponseWithData(
                        res,
                        "Package updated with success.",
                        updatedPackage
                      );
                    }
                  }
                );
              }
            }
          }
        );
      }
    } catch (err) {
      //throw error in json response with status 500.
      return apiResponse.ErrorResponse(res, err);
    }
  },
];

/**
 * Package Delete.
 *
 * @param {string}      name
 *
 * @returns {Object}
 */
exports.packageDelete = [
  auth,
  function (req, res) {
    try {
      Package.findOne({ name: req.params.name }, function (err, foundPackage) {
        if (foundPackage === null) {
          return apiResponse.notFoundResponse(
            res,
            "Packages with this name does not exist"
          );
        } else {
          //Check authorized user
          if (foundPackage.author !== req.auth._id) {
            return apiResponse.unauthorizedResponse(
              res,
              "You are not authorized to do this operation."
            );
          } else {
            //delete Package.
            Package.deleteOne({ name: req.params.name }, function (err) {
              if (err) {
                return apiResponse.ErrorResponse(res, err);
              } else {
                return apiResponse.successResponse(
                  res,
                  "Package deleted with success."
                );
              }
            });
          }
        }
      });
    } catch (err) {
      //throw error in json response with status 500.
      return apiResponse.ErrorResponse(res, err);
    }
  },
];
