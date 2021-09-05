const Comment = require("../models/comment");
const Post = require("../models/post");
const { validationResult } = require("express-validator");
const mongoose = require("mongoose");

exports.createComment = (req, res, next) => {
  const postId = req.params.postId;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed.");
    error.statusCode = 422;
    error.data = errors.array();
    return next(error);
  }
  Post.findById(mongoose.Types.ObjectId(postId))
    .then((post) => {
      if (!post) {
        const error = new Error("This post doesn't exist");
        error.statusCode = 400;
        return next(error);
      }
      const { content } = req.body;
      const comment = new Comment({
        content,
        userId: req.userId,
        postId: req.params.postId,
      });
      comment.save().then((comment) => {
        return res.json(comment);
      });
    })

    .catch((err) => next(err));
};

exports.deleteComment = (req, res, next) => {
  const postId = req.params.postId;
  const commentId = req.params.commentId;
  Comment.findById(mongoose.Types.ObjectId(commentId))
    .then((comment) => {
      if (!comment) {
        const error = new Error("This comment doesn't exist");
        error.statusCode = 400;
        return next(error);
      }
      if (comment.userId.toString() !== req.userId.toString()) {
        const error = new Error("You can't remove this comment");
        error.statusCode = 403;
        return next(error);
      }
      Comment.findByIdAndDelete(mongoose.Types.ObjectId(commentId)).then(
        (comment) => {
          return res.json(comment);
        }
      );
    })
    .catch((err) => next(err));
};

exports.editComment = (req, res, next) => {
  const commentId = req.params.commentId;
  const content = req.body.content;
  Comment.findById(mongoose.Types.ObjectId(commentId))
    .then((comment) => {
      if (!comment) {
        const error = new Error("This comment doesn't exist");
        error.statusCode = 400;
        return next(error);
      }
      if (comment.userId.toString() !== req.userId.toString()) {
        const error = new Error("You can't edit this comment");
        error.statusCode = 403;
        return next(error);
      }
      comment.content = content;
      comment.save().then((comment) => {
        return res.json(comment);
      });
    })
    .catch((err) => next(err));
};
