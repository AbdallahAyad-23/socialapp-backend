const mongoose = require("mongoose");
const User = require("../models/user");

const { ref, storage, uploadBytes, filename } = require("../util/firebase");

exports.profile = (req, res, next) => {
  if (req.file.mimetype !== "image/jpeg" && req.file.mimetype !== "image/png") {
    return res.json({ error: "Wrong file type" });
  }
  const storageRef = ref(storage, filename(req.file));
  uploadBytes(storageRef, req.file.buffer, {
    contentType: req.file.mimetype,
  }).then((snapshot) => {
    User.findById(mongoose.Types.ObjectId(req.userId)).then((user) => {
      const imageUrl = snapshot.metadata.fullPath;
      user.imageUrl = imageUrl;
      user.save().then(() => {
        return res.json({ profileImage: imageUrl });
      });
    });
  });
};
