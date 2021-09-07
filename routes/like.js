const express = require("express");
const router = express.Router();
const isAuth = require("../middlewares/is-auth");
const likeController = require("../controllers/like");

router.post("/posts/:postId/likes", isAuth, likeController.like);

router.delete("/posts/:postId/likes", isAuth, likeController.unlike);

module.exports = router;
