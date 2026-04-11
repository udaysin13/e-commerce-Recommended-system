const express = require("express");
const { authUser, login, signup } = require("../controllers/authController");

const router = express.Router();

router.post("/", authUser);
router.post("/login", login);
router.post("/signup", signup);

module.exports = router;
