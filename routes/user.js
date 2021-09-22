const express = require("express");
const userController = require("../controllers/user");
const isAuth = require("../middlewares/is-auth");
const router = express.Router();

// get authenticated user
router.get("/user", isAuth, userController.getAuthenticatedUser);

router.get("/user/friends", isAuth, userController.getUserFriendRequests);
// get a specific user
router.get("/users/:userId", isAuth, userController.getUser);

// get all users
router.get("/users", isAuth, userController.getAllUsers);

module.exports = router;
