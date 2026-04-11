/**
 * User Routes
 * All user-related endpoints
 */

const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { validateUserRegistration, validatePagination } = require("../middleware/validators");

/**
 * POST /users/register
 * Register new user
 */
router.post("/register", validateUserRegistration, userController.register);

/**
 * GET /users/:userId
 * Get user profile
 */
router.get("/:userId", userController.getProfile);

/**
 * PUT /users/:userId
 * Update user profile
 */
router.put("/:userId", userController.updateProfile);

/**
 * GET /users/:userId/orders
 * Get user's order history
 */
router.get("/:userId/orders", validatePagination, userController.getUserOrders);

/**
 * GET /users/:userId/history
 * Get user's view history
 */
router.get("/:userId/history", validatePagination, userController.getUserHistory);

/**
 * DELETE /users/:userId
 * Delete user account
 */
router.delete("/:userId", userController.deleteAccount);

module.exports = router;
