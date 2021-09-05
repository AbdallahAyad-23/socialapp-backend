const express = require("express");
const authController = require("../controllers/auth");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const { body } = require("express-validator");

const router = express.Router();

router.post(
  "/signup",
  body("firstname").notEmpty(),
  body("lastname").notEmpty(),
  body("username").notEmpty(),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Must be at least 6 chars long"),
  authController.signup
);
router.post(
  "/login",
  body("username").notEmpty(),
  body("password").notEmpty(),
  authController.login
);
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile"] })
);

router.get(
  "/auth/google/redirect",
  passport.authenticate("google", { session: false }),
  (req, res, next) => {
    jwt.sign(
      { userId: req.user._id },
      process.env.SECRET,
      { expiresIn: "1h" },
      (err, token) => {
        console.log(token);
        res.redirect("/");
        return res.json({ token });
      }
    );
  }
);
module.exports = router;
