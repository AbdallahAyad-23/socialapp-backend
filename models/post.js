const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const postSchema = new Schema(
  {
    content: String,
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    likesCount:{type:Number,default:0},
    commentsCount:{type:Number,default:0}
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", postSchema);
