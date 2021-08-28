const Friendship = require("../models/friendship");
const User = require("../models/user");
const mongoose = require("mongoose");

exports.add = (req, res, next) => {
  const requester = req.userId;
  const recipient = req.params.friendId;
  if (recipient.toString() === requester.toString()) {
    const error = new Error("Error");
    error.statusCode = 401;
    return next(error);
  }
  User.findById(mongoose.Types.ObjectId(recipient))
    .populate("friends")
    .then((ricipientUser) => {
      if (!ricipientUser) {
        const error = new Error("This user doesn't exist");
        error.statusCode = 401;
        return next(error);
      }
      if (
        ricipientUser.friends.filter(
          (friend) => friend.requester.toString() === requester.toString()
        ).length !== 0
      ) {
        const error = new Error("You already sent a request");
        error.statusCode = 401;
        return next(error);
      }
      const requestFriendship = new Friendship({
        requester,
        recipient,
        status: 1,
      });
      const pendingFriendship = new Friendship({
        requester,
        recipient,
        status: 2,
      });
      Promise.all([
        requestFriendship.save(),
        pendingFriendship.save(),
        User.findById(requester),
      ]).then((values) => {
        const [reqFriendship, recFriendship, req] = values;
        req.friends.push(reqFriendship._id);
        ricipientUser.friends.push(recFriendship._id);
        Promise.all([req.save(), ricipientUser.save()]).then(() => {
          res.json({ message: "Success" });
        });
      });
    });
};

exports.accept = (req, res, next) => {};
