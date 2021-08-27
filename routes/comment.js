const express = require("express");
const isAuth = require("../middlewares/is-auth");
const commentController = require("../controllers/comment");
const { body } = require("express-validator");
const router = express.Router();

// create comment
router.post(
  "/posts/:postId/comments",
  isAuth,
  body("content").notEmpty(),
  commentController.createComment
);
// delete comment
router.delete(
  "/posts/:postId/comments/:commentId",
  isAuth,
  commentController.deleteComment
);
// edit comment
router.put(
  "/posts/:postId/comments/:commentId",
  isAuth,
  commentController.editComment
);
module.exports = router;
