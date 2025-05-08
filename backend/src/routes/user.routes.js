const express = require('express');
const userController = require('../controllers/user.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

const router = express.Router();

// Get all users (admin only)
router.get('/', verifyToken, isAdmin, userController.getAllUsers);

// Get user by ID
router.get('/:id', verifyToken, userController.getUserById);

// Update user
router.put('/:id', verifyToken, userController.updateUser);

// Delete user (admin only)
router.delete('/:id', verifyToken, isAdmin, userController.deleteUser);

module.exports = router;
