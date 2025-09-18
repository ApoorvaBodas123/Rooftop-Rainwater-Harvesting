const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config/config');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Create user
    user = await User.create({
      name,
      email,
      password
    });

    sendTokenResponse(user, 200, res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt for:', email); // Debug log

    // Validate email & password
    if (!email || !password) {
      console.log('Missing email or password'); // Debug log
      return res.status(400).json({ success: false, message: 'Please provide an email and password' });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      console.log('No user found with email:', email); // Debug log
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check if password matches
    console.log('Checking password for user:', user.email); // Debug log
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      console.log('Invalid password for user:', user.email); // Debug log
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    console.log('Login successful for user:', user.email); // Debug log
    sendTokenResponse(user, 200, res);
  } catch (err) {
    console.error('Login error:', err); // Enhanced error logging
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Log user out / clear cookie
// @route   GET /api/auth/logout
// @access  Private
exports.logout = (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  res.status(200).json({ success: true, data: {} });
};

// Helper function to send token response
const sendTokenResponse = (user, statusCode, res) => {
  try {
    // Create token
    const token = user.getSignedJwtToken();

    // Set cookie options
    const cookieOptions = {
      expires: new Date(
        Date.now() + (process.env.NODE_ENV === 'development' ? 7 : 30) * 24 * 60 * 60 * 1000 // 7 days in dev, 30 in prod
      ),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    };

    // Remove password from output
    user.password = undefined;

    res.status(statusCode).cookie('token', token, cookieOptions).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Error in sendTokenResponse:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating authentication token'
    });
  }
};
