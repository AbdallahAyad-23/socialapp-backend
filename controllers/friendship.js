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
        const error = new Error("Error");
        error.statusCode = 401;
        return next(error);
      }
      Friendship.find({
        requester: mongoose.Types.ObjectId(requester),
        recipient: mongoose.Types.ObjectId(recipient),
      }).then((requests) => {
        const [request1, request2] = requests;
        request1.status = 3;
        request2.status = 3;
        Promise.all([request1.save(), request2.save()]).then(() => {
          return res.json({ message: "Success" });
        });
      });
    });
};

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
        const reqFriendReq = requests.find((req) => req.status == 1);
        const recFriendReq = requests.find((req) => req.status == 2);
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

exports.unfriend = (req, res, next) => {
  const requester = req.userId;
  const recipient = req.params.friendId;
  Friendship.find({})
    .or([
      {
        requester: mongoose.Types.ObjectId(requester),
        recipient: mongoose.Types.ObjectId(recipient),
        status: 3,
      },
      {
        requester: mongoose.Types.ObjectId(recipient),
        recipient: mongoose.Types.ObjectId(requester),
        status: 3,
      },
    ])
    .then((requests) => {
      if (requests.length === 0) {
        const error = new Error("You aren't friends");
        error.statusCode = 401;
        return next(error);
      }
      const [req1, req2] = requests;
      const req1Id = req1._id;
      const req2Id = req2._id;
      Promise.all([User.findById(requester), User.findById(recipient)]).then(
        (users) => {
          const [user1, user2] = users;
          const user1Friends = user1.friends.filter(
            (friend) =>
              friend.toString() !== req1Id.toString() &&
              friend.toString() !== req2Id.toString()
          );
          user1.friends = user1Friends;
          const user2Friends = user2.friends.filter(
            (friend) =>
              friend.toString() !== req1Id.toString() &&
              friend.toString() !== req2Id.toString()
          );
          user2.friends = user2Friends;
          Promise.all([
            user1.save(),
            user2.save(),
            Friendship.findByIdAndRemove(mongoose.Types.ObjectId(req1Id)),
            Friendship.findByIdAndRemove(mongoose.Types.ObjectId(req2Id)),
          ]).then(() => {
            return res.json({ message: "success" });
          });
        }
      );
    });
};
