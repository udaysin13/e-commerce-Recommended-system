const express = require("express");
const { createView } = require("../controllers/viewController");

const router = express.Router();

router.post("/", createView);

module.exports = router;
