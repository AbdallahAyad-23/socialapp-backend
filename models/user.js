const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  firstname: String,
  lastname: String,
  username: String,
  hash: String,
  salt: String,
  imageUrl: {
    type: String,
    default: "default.png",
  },
  googleId: String,
  friends: [{ type: Schema.Types.ObjectId, ref: "Friendship" }],
});

module.exports = mongoose.model("User", userSchema);
