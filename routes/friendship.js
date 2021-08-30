const express = require("express");
const router = express.Router();
const isAuth = require("../middlewares/is-auth");
const friendshipController = require("../controllers/friendship");

router.post("/friends/:friendId", isAuth, friendshipController.add);
router.patch("/friends/:friendId", isAuth, friendshipController.accept);
router.delete(
  "/friends/:friendId/unfriend",
  isAuth,
  friendshipController.unfriend
);
router.delete("/friends/:friendId", isAuth, friendshipController.reject);

module.exports = router;
