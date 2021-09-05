const User = require("../models/user");
const Post = require("../models/post");
const mongoose = require("mongoose");

exports.getAuthenticatedUser = (req, res, next) => {
  User.findById(
    mongoose.Types.ObjectId(req.userId),
    "username firstname lastname friends imageUrl"
  )
    .populate("friends")
    .then((user) => {
      return res.json(user);
    })
    .catch((err) => next(err));
};

exports.getUser = (req, res, next) => {
  const userId = req.params.userId;
  User.findById(
    mongoose.Types.ObjectId(userId),
    "username firstname lastname friends imageUrl"
  )
    .then((user) => {
      Post.find({ userId }).then((posts) => {
        let fullUserData = { user, posts };
        return res.json(fullUserData);
      });
    })
    .catch((err) => next(err));
};

exports.getAllUsers = (req, res, next) => {
  User.find({ _id: { $ne: req.userId } })
    .select("username _id")
    .then((users) => {
      return res.json({ users });
    })
    .catch((err) => next(err));
};
