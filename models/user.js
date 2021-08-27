const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  firstname: String,
  lastname: String,
  username: String,
  hash: String,
  salt: String,
  imageUrl: String,
  googleId: String,
  friends: [{ type: Schema.Types.ObjectId, ref: "Friendship" }],
});

module.exports = mongoose.model("User", userSchema);
