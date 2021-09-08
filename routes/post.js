const express = require("express");
const isAuth = require("../middlewares/is-auth");
const postController = require("../controllers/post");
const { body } = require("express-validator");
const router = express.Router();

// TODO: get all posts
router.get("/posts", isAuth, postController.getAllPosts);
// create post
router.post(
  "/posts",
  isAuth,
  body("content").notEmpty(),
  postController.createPost
);
router.get("/posts/:postId/comments", isAuth, postController.getPostComments);
router.get("/posts/:postId/likes", isAuth, postController.getPostLikes);
// delete post with comments
router.delete("/posts/:postId", isAuth, postController.deletePost);
// edit post
router.put("/posts/:postId", isAuth, postController.editPost);
module.exports = router;
