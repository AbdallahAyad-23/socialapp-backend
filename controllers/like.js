const Like = require("../models/like");
const Post = require("../models/post");
const mongoose = require("mongoose");

exports.like = (req, res, next) => {
  const postId = req.params.postId;
  Post.findById(mongoose.Types.ObjectId(postId))
    .then((post) => {
      if (!post) {
        const error = new Error("This post doesn't exist");
        error.statusCode = 400;
        return next(error);
      }
      Like.findOne({ postId, userId: req.userId }).then((existedLike) => {
        if (existedLike) {
          const error = new Error("You already liked this post!");
          error.statusCode = 400;
          return next(error);
        }
        const like = new Like({
          postId,
          userId: req.userId,
        });
        like.save().then((likeDoc) => {
          post.save().then(() => {
            return res.json(likeDoc);
          });
        });
      });
    })
    .catch((err) => next(err));
};

exports.unlike = (req, res, next) => {
  const postId = req.params.postId;
  Post.findById(mongoose.Types.ObjectId(postId))
    .then((post) => {
      if (!post) {
        const error = new Error("This post doesn't exist");
        error.statusCode = 400;
        return next(error);
      }
      Like.findOne({
        postId: mongoose.Types.ObjectId(postId),
        userId: mongoose.Types.ObjectId(req.userId),
      }).then((existedLike) => {
        if (!existedLike) {
          const error = new Error("You didn't like this post");
          error.statusCode = 400;
          return next(error);
        }
        Like.findOneAndDelete({ postId, userId: req.userId }).then(
          (likeDoc) => {
            post.save().then(() => {
              return res.json(likeDoc);
            });
          }
        );
      });
    })

    .catch((err) => next(err));
};
