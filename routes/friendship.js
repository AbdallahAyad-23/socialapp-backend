const express = require("express");
const router = express.Router();
const isAuth = require("../middlewares/is-auth");
const friendshipController = require("../controllers/friendship");

router.post("/friends/:friendId", isAuth, friendshipController.add);
router.patch("/friends/:friendId", isAuth, friendshipController.accept);

module.exports = router;
