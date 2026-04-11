/**
 * User Controller
 * Handles user-related HTTP requests
 */

const userService = require("../services/userService");
const asyncHandler = require("../middleware/asyncHandler");

/**
 * Register new user
 * POST /auth/register
 */
const register = asyncHandler(async (req, res) => {
  const user = await userService.createUser(req.body);
  res.status(201).json({
    message: "User registered successfully",
    user,
  });
});

/**
 * Get user profile
 * GET /auth/profile
 */
const getProfile = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const user = await userService.getUserById(Number(userId));

  const { password, ...userWithoutPassword } = user;
  res.json({
    user: userWithoutPassword,
  });
});

/**
 * Update user profile
 * PUT /auth/profile
 */
const updateProfile = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const user = await userService.updateUserProfile(Number(userId), req.body);

  const { password, ...userWithoutPassword } = user;
  res.json({
    message: "Profile updated successfully",
    user: userWithoutPassword,
  });
});

/**
 * Get user's orders
 * GET /auth/:userId/orders
 */
const getUserOrders = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const result = await userService.getUserOrders(Number(userId), req.pagination);
  res.json(result);
});

/**
 * Get user's view history
 * GET /auth/:userId/history
 */
const getUserHistory = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const result = await userService.getUserViewHistory(Number(userId), req.pagination);
  res.json(result);
});

/**
 * Delete user account
 * DELETE /auth/:userId
 */
const deleteAccount = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const result = await userService.deleteUser(Number(userId));
  res.json(result);
});

module.exports = {
  register,
  getProfile,
  updateProfile,
  getUserOrders,
  getUserHistory,
  deleteAccount,
};
