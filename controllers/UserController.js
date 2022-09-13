const User = require("../models/UserModel");
var mongoose = require("mongoose");
const { body, validationResult } = require("express-validator");
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
 * @param {string}      _id
 *
 * @returns {Object}
 */
exports.userDetail = [
  function (req, res) {
    try {
      User.findOne({ _id: mongoose.Types.ObjectId(req.params.id) })
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
