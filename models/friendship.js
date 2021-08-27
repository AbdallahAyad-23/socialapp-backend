const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const friendshipSchema = new Schema({
  requester: { type: Schema.Types.ObjectId, required: true, ref: "User" },
  recipient: { type: Schema.Types.ObjectId, required: true, ref: "User" },
  status: {
    type: Number,
    enum: [0, 1, 2, 3],
  },
});

module.exports = mongoose.model("Friendship", friendshipSchema);
