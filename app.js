// errors should be better
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");

const authRouter = require("./routes/auth");
const postRouter = require("./routes/post");
const commentRouter = require("./routes/comment");
const likeRouter = require("./routes/like");
const friendshipRouter = require("./routes/friendship");
const profileRouter = require("./routes/profile");
const userRouter = require("./routes/user");

const app = express();
const mongoDB = process.env.DB;

mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
require("./util/passport");

app.use(authRouter);
app.use(postRouter);
app.use(commentRouter);
app.use(likeRouter);
app.use(friendshipRouter);
app.use(profileRouter);
app.use(userRouter);

app.use((error, req, res, next) => {
  const status = error.statusCode || 500;
  res.status(status).json({ error: error.message, data: error.data });
});

app.listen(3000);
