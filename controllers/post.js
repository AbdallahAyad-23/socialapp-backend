const Post = require("../models/post");
const Comment = require("../models/comment");
const Like = require("../models/like");
const User = require("../models/user");
const { validationResult } = require("express-validator");
const mongoose = require("mongoose");

exports.getAllPosts = (req, res, next) => {
  const promises = [];
  User.findById(mongoose.Types.ObjectId(req.userId))
    .populate("friends")
    .then((user) => {
      let friends = user.friends
        .filter((friend) => friend.status == 3)
        .map((friend) => {
          return friend.requester.toString() === req.userId.toString()
            ? friend.recipient
            : friend.requester;
        });
      promises.push(Post.find({ userId: mongoose.Types.ObjectId(req.userId) }).populate("userId"));
      friends.forEach((friend) => {
        promises.push(Post.find({ userId: mongoose.Types.ObjectId(friend) }).populate("userId"));
      });
      Promise.all(promises).then((results) => {
        const posts = results.flat();
        return res.json({ posts });
      });
    })
    .catch((err) => next(err));
};

exports.createPost = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed.");
    error.statusCode = 422;
    error.data = errors.array();
    return next(error);
  }
  const { content } = req.body;
  const post = new Post({
    content,
    userId: req.userId,
  });
  post
    .save()
    .then((post) => {
      return res.json(post);
    })
    .catch((err) => next(err));
};

exports.getPost = (req, res, next) => {
  const id = req.params.postId;
  let fullPost = {};
  Post.findById(id)
    .populate("userId", "_id username")
    .then((post) => {
      if (!post) {
        const error = new Error("This post doesn't exist");
        error.statusCode = 400;
        return next(error);
      }
      fullPost = { ...post._doc };
      Comment.find({ postId: id }).then((comments) => {
        fullPost.comments = comments;
      });
      Like.countDocuments({ postId: id }).then((likesCount) => {
        fullPost.likesCount = likesCount;
        return res.json(fullPost);
      });
    })

    .catch((err) => next(err));
};

exports.deletePost = (req, res, next) => {
  const id = req.params.postId;
  Post.findById(mongoose.Types.ObjectId(id))
    .then((post) => {
      if (!post) {
        const error = new Error("This post doesn't exist");
        error.statusCode = 400;
        return next(error);
      }
      if (post.userId.toString() !== req.userId.toString()) {
        const error = new Error("You can't remove this post");
        error.statusCode = 403;
        return next(error);
      }
      Post.findByIdAndDelete(mongoose.Types.ObjectId(id)).then((post) => {
        Comment.deleteMany({ postId: id }).then(() => {});
        Like.deleteMany({ postId: id }).then(() => {
          return res.json(post);
        });
      });
    })
    .catch((err) => next(err));
};

exports.editPost = (req, res, next) => {
  const id = req.params.postId;
  const content = req.body.content;
  Post.findById(mongoose.Types.ObjectId(id))
    .then((post) => {
      if (!post) {
        const error = new Error("This post doesn't exist");
        error.statusCode = 400;
        return next(error);
      }
      if (post.userId.toString() !== req.userId.toString()) {
        const error = new Error("You can't edit this post");
        error.statusCode = 403;
        return next(error);
      }
      post.content = content;
      post.save().then((post) => {
        return res.json(post);
      });
    })
    .catch((err) => next(err));
};
