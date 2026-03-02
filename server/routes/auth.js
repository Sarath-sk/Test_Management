const router = require('express').Router();
const { protect } = require('../middleware/auth');
const {registerUser, loginUser, getMe, getProfile} = require("../controllers/userControl");

// POST /api/auth/register
router.post('/register', registerUser);

// POST /api/auth/login
router.post('/login', loginUser);

// GET /api/auth/me
router.get('/me', protect, getMe);

// PUT /api/auth/profile
router.put('/profile', protect, getProfile);


module.exports = router;
