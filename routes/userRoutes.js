// routes/userRoutes.js - User API Routes
const express = require('express');
const { registerUser, loginUser, getAllUsers, getUserById } = require('../controllers/userController');

const router = express.Router();

// POST /api/users/register - Register new user
router.post('/register', registerUser);

// POST /api/users/login - Login user
router.post('/login', loginUser);

// GET /api/users - Get all users
router.get('/', getAllUsers);

// GET /api/users/:id - Get user by ID
router.get('/:id', getUserById);

module.exports = router;