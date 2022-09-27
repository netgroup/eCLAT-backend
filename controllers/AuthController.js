const UserModel = require("../models/UserModel");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
//helper file to prepare responses.
const apiResponse = require("../helpers/apiResponse");
const jwt = require("jsonwebtoken");

const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;
const homepage = process.env.HOMEPAGE;

async function getAccessToken(code) {
  const res = await fetch(`https://github.com/login/oauth/access_token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id,
      client_secret,
      code,
    }),
  });

  const data = await res.text();
  const params = new URLSearchParams(data);
  return params.get("access_token");
}

async function getGithubUser(access_token) {
  const req = await fetch(`https://api.github.com/user`, {
    headers: {
      Authorization: `bearer ${access_token}`,
    },
  });
  const data = await req.json();
  return data;
}

exports.loginCallback = [
  async (req, res) => {
    try {
      const code = req.query.code;

      if (!code) {
        throw new Error("No code!");
      }

      const access_token = await getAccessToken(code);
      const githubData = await getGithubUser(access_token);

      //Check is user is registered in the site.
      const user = await UserModel.findOne({ username: githubData.login });

      //If user is not registered, save his username and email.
      if (!user) {
        var newUser = new UserModel({
          username: githubData.login,
          email: githubData.email,
        });

        newUser.save(function (err) {
          if (err) {
            console.log(err);
          }
        });

        //If he has registered and his email has changed, update it.
      } else if (user.email !== githubData.email) {
        user.email = githubData.email;
        user.save(function (err) {
          if (err) {
            console.log(err);
          }
        });
      }

      //Generated JWT token with Payload, Secret, Options.
      const token = jwt.sign(githubData, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_TIMEOUT_DURATION,
      });

      res.cookie("jwt", token);

      res.redirect(homepage);
    } catch (err) {
      return apiResponse.ErrorResponse(res, err);
    }
  },
];
