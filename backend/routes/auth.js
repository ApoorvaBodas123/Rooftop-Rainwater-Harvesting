const express = require('express');
const { protect } = require('../middleware/auth');
const { 
  register, 
  login, 
  getMe, 
  logout 
} = require('../controllers/authController');

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', protect, getMe);
router.get('/logout', protect, logout);

module.exports = router;
