const Package = require("../models/PackageModel");
const { body, validationResult } = require("express-validator");
var mongoose = require("mongoose");
const apiResponse = require("../helpers/apiResponse");
const auth = require("../middlewares/jwt");
const { compare } = require("compare-versions"); //Per controllare il numero di versione nuovo
require("dotenv").config();

const Agenda = require("agenda");
var MONGODB_URL = process.env.MONGODB_URL;
const agenda = new Agenda({
  db: {
    address: MONGODB_URL,
    collection: "agendaJobs",
  },
});

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
            null
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
 * @param {string}      author
 * @param {string}      git_url
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
  body("git_url", "Url must not be empty.").isLength({ min: 19 }).trim(),
  body("tag", "Tag must not be empty.").notEmpty().trim(),
  body("description", "Description must not be empty.")
    .notEmpty()
    .trim()
    .escape(),

  async (req, res) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return apiResponse.validationErrorWithData(
          res,
          "Validation Error.",
          errors.array()
        );
      } else {
        var package = new Package({
          name: req.body.name.toLowerCase(),
          author: req.user.login,
          git_url: req.body.git_url,
          tag: req.body.tag,
          description: req.body.description,
        });

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
 * Add package version .
 *
 * @param {string}      commit
 * @param {string}      version
 * @param {string}      status
 * @param {string}      note
 *
 * @returns {Object}
 */

exports.packageVersionAdd = [
  auth,
  body("commit", "Commit must be 40 characters long.")
    .isLength({ min: 40, max: 40 })
    .trim(),
  body("version", "Version number form is not valid")
    .notEmpty()
    .trim()
    .escape()
    .matches(/^\d+(?:\.\d+){2}$/),
  body("note").trim().escape(),

  async (req, res) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return apiResponse.validationErrorWithData(
          res,
          "Validation Error.",
          errors.array()
        );
      } else {
        var release = {
          commit: req.body.commit,
          version: req.body.version,
          status: "queue",
          note: req.body.note,
        };

        //Check if package name is correct
        const package = await Package.findOne({ name: req.params.name });
        if (!package) {
          return apiResponse.ErrorResponse(res, "Package does not exist.");
        }

        //If there already exists one or more releases
        if (package.releases.length > 0) {
          var oldVersion = package.releases.pop().version;
          //If the recent old version number is >= than the new one, error
          if (compare(oldVersion, req.body.version, ">=")) {
            return apiResponse.ErrorResponse(
              res,
              "Version number should be higher then older versions numbers."
            );
          }
        }

        //Add the new release.
        Package.findOneAndUpdate(
          { name: req.params.name },
          { $addToSet: { releases: release } },
          { new: true },
          async function (err, doc) {
            if (err) {
              return apiResponse.ErrorResponse(res, err);
            }

            release.packageId = doc._id;
            release.packageUrl = doc.git_url;

            const job = agenda.create("verify package", release);
            await job.save();

            return apiResponse.successResponseWithData(
              res,
              "Package version added with success.",
              release
            );
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
 * Package update.
 *
 * @param {string}      name
 * @param {string}      description
 *
 * @returns {Object}
 */
exports.packageUpdate = [
  auth,
  body("name", "Name must not be empty.").notEmpty().trim().escape(),
  body("git_url")
    .notEmpty()
    .withMessage("Url must not be empty.")
    .isLength({ min: 19 })
    .trim(),
  body("tag").notEmpty().withMessage("Tag must not be empty.").trim(),
  body("description")
    .notEmpty()
    .withMessage("Description must not be empty.")
    .trim()
    .escape(),

  (req, res) => {
    try {
      const errors = validationResult(req);

      var updatedPackage = {
        name: req.body.name.toLowerCase(),
        git_url: req.body.git_url,
        tag: req.body.tag,
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
              if (foundPackage.author !== req.user.login) {
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
                      //for example if there already exists a package with the new name
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
          if (foundPackage.author !== req.user.login) {
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

/**
 * Version delete.
 *
 * @param {string}      name
 * @param {string}      version_id
 *
 * @returns {Object}
 */
exports.versionDelete = [
  auth,
  body("id")
    .isLength({ min: 24, max: 24 })
    .withMessage("Version ID should not be empty.")
    .trim()
    .escape(),
  (req, res) => {
    try {
      console.log(req.body.id);
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return apiResponse.validationErrorWithData(
          res,
          "Validation Error.",
          errors.array()
        );
      }
      Package.findOne({ name: req.params.name }, function (err, foundPackage) {
        if (foundPackage === null) {
          return apiResponse.notFoundResponse(
            res,
            "Package with this name does not exist"
          );
        } else {
          // Check authorized user
          if (foundPackage.author !== req.user.login) {
            return apiResponse.unauthorizedResponse(
              res,
              "You are not authorized to do this operation."
            );
          } else {
            foundPackage.releases = foundPackage.releases.filter((release) => {
              if (!release._id.equals(req.body.id)) {
                return release;
              }
            });

            // Delete version.
            Package.findOneAndUpdate(
              { name: req.params.name },
              foundPackage,
              function (err) {
                if (err) {
                  //for example if there already exists a package with the new name
                  return apiResponse.ErrorResponse(res, err);
                } else {
                  return apiResponse.successResponseWithData(
                    res,
                    "Version deleted with success."
                  );
                }
              }
            );
          }
        }
      });
    } catch (err) {
      //throw error in json response with status 500.
      return apiResponse.ErrorResponse(res, err);
    }
  },
];
