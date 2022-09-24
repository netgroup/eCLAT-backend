const User = require("../models/UserModel");
const Package = require("../models/PackageModel");
var mongoose = require("mongoose");
const apiResponse = require("../helpers/apiResponse");
const auth = require("../middlewares/jwt");

/**
 * User List.
 *
 * @returns {Object}
 */
exports.userList = [
  function (req, res) {
    try {
      User.find({})
        .select("-password")
        .then((users) => {
          if (users.length > 0) {
            return apiResponse.successResponseWithData(
              res,
              "Operation success",
              users
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
 * User Detail.
 *
 * @param {string}      username
 * @returns {Object}
 */
exports.userDetail = [
  function (req, res) {
    try {
      User.findOne({ username: req.params.username })
        .select("-password")
        .then((user) => {
          if (user !== null) {
            return apiResponse.successResponseWithData(
              res,
              "Operation success",
              user
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
 * User Packages.
 *
 * @param {string}      username
 * @returns {Object}
 */
exports.userPackages = [
  function (req, res) {
    try {
      Package.find({ author: req.params.username }).then((packages) => {
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
