const express = require("express");

const router = express.Router();
const multer = require("multer");
const profileController = require("../controllers/profile");
const isAuth = require("../middlewares/is-auth");

const upload = multer(multer.memoryStorage());

router.post(
  "/profile",
  isAuth,
  upload.single("profile"),
  profileController.profile
);

module.exports = router;
