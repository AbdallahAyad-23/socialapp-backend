const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const likeSchema = new Schema({
  postId: { type: Schema.Types.ObjectId, ref: "Post" },
  userId: { type: Schema.Types.ObjectId, ref: "User" },
});

module.exports = mongoose.model("Like", likeSchema);
