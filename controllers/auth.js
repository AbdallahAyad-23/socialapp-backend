const passport = require("passport");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const { validatePassword, genPassword } = require("../util/password");

exports.signup = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed.");
    error.statusCode = 422;
    error.data = errors.array();
    return next(error);
  }
  const { firstname, lastname, username, password } = req.body;
  const { hash, salt } = genPassword(password);
  const user = new User({
    firstname,
    lastname,
    username,
    password,
    hash,
    salt,
  });
  User.findOne({ username })
    .then((existeduser) => {
      if (existeduser) {
        const error = new Error("This username is taken");
        error.statusCode = 422;
        return next(error);
      }
      user.save().then((newUser) => {
        return res.status(201).json({ message: "Signed up successfully" });
      });
    })

    .catch((err) => next(err));
};

exports.login = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed");
    error.statusCode = 422;
    error.data = errors.array();
    return next(error);
  }
  User.findOne({ username: req.body.username })
    .then((user) => {
      if (!user) {
        const error = new Error("A user with this email could not be found.");
        error.statusCode = 401;
        return next(error);
      }
      const isValid = validatePassword(req.body.password, user.hash, user.salt);
      if (isValid) {
        jwt.sign(
          { userId: user._id },
          process.env.SECRET,
          {
            expiresIn: "1h",
          },
          (err, token) => {
            return res.json({ token });
          }
        );
      } else {
        const error = new Error("password is incorrect");
        error.statusCode = 401;
        return next(error);
      }
    })
    .catch((err) => next(err));
};
