const express = require("express");
const isAuth = require("../middlewares/is-auth");
const postController = require("../controllers/post");
const { body } = require("express-validator");
const router = express.Router();

// TODO: get all posts

// create post
router.post(
  "/posts",
  isAuth,
  body("content").notEmpty(),
  postController.createPost
);
router.get("/posts/:postId", isAuth, postController.getPost);
// delete post with comments
router.delete("/posts/:postId", isAuth, postController.deletePost);
// edit post
router.put("/posts/:postId", isAuth, postController.editPost);
module.exports = router;
