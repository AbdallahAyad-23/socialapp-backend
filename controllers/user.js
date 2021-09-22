const User = require("../models/user");
const Post = require("../models/post");
const Friendship = require("../models/friendship");
const mongoose = require("mongoose");

exports.getAuthenticatedUser = (req, res, next) => {
  User.findById(
    mongoose.Types.ObjectId(req.userId),
    "username firstname lastname friends imageUrl"
  )
    // .populate("friends")
    .then((user) => {
      // console.log(friends);
      // User.populate(user, {
      //   path: friends.join(" "),
      //   select: "username imageUrl",
      // }).then((fullUser) => {
      //   return res.json(fullUser);
      // });
      return res.json(user);
    })
    .catch((err) => next(err));
};

exports.getUserFriendRequests = (req, res, next) => {
  Friendship.find({})
    .or([
      {
        requester: mongoose.Types.ObjectId(req.userId),
        status: 1,
      },
      {
        recipient: mongoose.Types.ObjectId(req.userId),
        status: 2,
      },
      {
        requester: mongoose.Types.ObjectId(req.userId),
        status: 3,
      },
      {
        recipient: mongoose.Types.ObjectId(req.userId),
        status: 3,
      },
    ])
    .then((friends) => {
      // let paths = friends.map((friend) => {
      //   return friend.requester.toString() === req.userId.toString()
      //     ? "recipient"
      //     : "requester";
      // });
      Friendship.populate(friends, {
        path: "recipient requester",
        select: "username imageUrl",
      }).then((fullRequests) => {
        return res.json(fullRequests);
      });
    });
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
    .select("username _id imageUrl")
    .then((users) => {
      return res.json({ users });
    })
    .catch((err) => next(err));
};
