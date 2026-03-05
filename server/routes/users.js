const router = require('express').Router();
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const {getAllUsers, updateUser, deleteUser} = require("../controllers/userControl");

// GET /api/users - Admin only
router.get('/', protect, authorize('admin'), getAllUsers);

// PUT /api/users/:id - Admin only
router.put('/:id', protect, authorize('admin'), updateUser);

// DELETE /api/users/:id - Admin only
router.delete('/:id', protect, authorize('admin'), deleteUser);

module.exports = router;
