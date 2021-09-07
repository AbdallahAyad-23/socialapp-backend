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
        console.log(existedLike);
        if (existedLike) {
          const error = new Error("You already liked this post");
          error.statusCode = 400;
          return next(error);
        }
        const like = new Like({
          postId,
          userId: req.userId,
        });
        like.save().then((like) => {
          post.likesCount = post.likesCount + 1;
          post.save().then((newPost) => {
            return res.json(newPost);
          })
          
        });
      });
    })
    .catch((err) => next(err));
};

exports.unlike = (req, res, next) => {
  const postId = req.params.postId;
  const likeId = req.params.likeId;
  Post.findById(mongoose.Types.ObjectId(postId))
    .then((post) => {
      if (!post) {
        const error = new Error("This post doesn't exist");
        error.statusCode = 400;
        return next(error);
      }
      Like.findById(mongoose.Types.ObjectId(likeId)).then((like) => {
        if (!like) {
          const error = new Error("You didn't like this post");
          error.statusCode = 400;
          return next(error);
        }
        if (like.userId.toString() !== req.userId.toString()) {
          const error = new Error("You can't unlike this post");
          error.statusCode = 403;
          return next(error);
        }
        Like.findByIdAndDelete(mongoose.Types.ObjectId(likeId)).then((like) => {
          post.likesCount = post.likesCount - 1
          post.save().then(newPost => {
            return res.json(newPost);
          })
         
        });
      });
    })

    .catch((err) => next(err));
};
