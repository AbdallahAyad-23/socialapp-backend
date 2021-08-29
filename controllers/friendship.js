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
      if (
        ricipientUser.friends.filter(
          (friend) => friend.recipient.toString() === requester.toString()
        ).length !== 0
      ) {
        const error = new Error("This user already sent you a request");
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
        const [reqFriendship, recFriendship, reqUser] = values;
        reqUser.friends.push(reqFriendship._id);
        ricipientUser.friends.push(recFriendship._id);
        Promise.all([reqUser.save(), ricipientUser.save()]).then(() => {
          res.json({ message: "Success" });
        });
      });
    });
};

exports.accept = (req, res, next) => {
  const requester = req.params.friendId;
  const recipient = req.userId;
  User.findById(recipient)
    .populate("friends")
    .then((recipientUser) => {
      if (
        recipientUser.friends.filter(
          (friend) =>
            friend.requester.toString() === requester && friend.status == 2
        ).length === 0
      ) {
        const error = new Error("Please send a request to this user");
        error.statusCode = 401;
        return next(error);
      }
      Friendship.find({
        requester: mongoose.Types.ObjectId(requester),
        recipient: mongoose.Types.ObjectId(recipient),
      }).then((requests) => {
        console.log(requests);
        const [request1, request2] = requests;
        request1.status = 3;
        request2.status = 3;
        Promise.all([request1.save(), request2.save()]).then(() => {
          return res.json({ message: "Success" });
        });
      });
    });
};

// reject request

// reject a request / unsend a request
exports.reject = (req, res, next) => {
  let requester = req.params.friendId;
  let recipient = req.userId;
  if (req.query.unsend) {
    requester = req.userId;
    recipient = req.params.friendId;
  }
  Friendship.find({
    requester: mongoose.Types.ObjectId(requester),
    recipient: mongoose.Types.ObjectId(recipient),
  })
    .or([{ status: 1 }, { status: 2 }])
    .then((requests) => {
      if (requests.length === 0 && req.query.unsend) {
        const error = new Error(
          "You didn't send a friend request to this user"
        );
        error.statusCode = 401;
        return next(error);
      } else if (requests.length === 0 && !req.query.unsend) {
        const error = new Error("This user didn't send you a friend request");
        error.statusCode = 401;
        return next(error);
      }
      Friendship.deleteMany({
        requester: mongoose.Types.ObjectId(requester),
        recipient: mongoose.Types.ObjectId(recipient),
      }).then(() => {
        const [reqFriendReq, recFriendReq] = requests;
        const reqFriendReqId = reqFriendReq._id;
        const recFriendReqId = recFriendReq._id;
        Promise.all([
          User.findById(mongoose.Types.ObjectId(requester)),
          User.findById(mongoose.Types.ObjectId(recipient)),
        ]).then((users) => {
          const [reqUser, recUser] = users;
          const reqUserFriendlist = reqUser.friends.filter(
            (friend) => friend.toString() !== reqFriendReqId.toString()
          );
          reqUser.friends = reqUserFriendlist;
          const recUserFriendlist = recUser.friends.filter(
            (friend) => friend.toString() !== recFriendReqId.toString()
          );
          recUser.friends = recUserFriendlist;
          Promise.all([reqUser.save(), recUser.save()]).then(() => {
            return res.json({ message: "Success" });
          });
        });
      });
    });
};

// you can't remove a friend
// make a solo remove route
