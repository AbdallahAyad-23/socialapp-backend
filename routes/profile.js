const express = require("express");
const path = require("path");
const router = express.Router();
const multer = require("multer");
const profileController = require("../controllers/profile");
const isAuth = require("../middlewares/is-auth");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/images");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage });

router.post(
  "/profile",
  isAuth,
  upload.single("profile"),
  profileController.profile
);

module.exports = router;
