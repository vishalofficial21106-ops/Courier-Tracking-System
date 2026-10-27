const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Helper to generate signed JWT token
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'college_courier_tracking_secret_key_2026',
    {
      expiresIn: process.env.JWT_EXPIRE || '30d',
    }
  );
};

// @desc    Register a new customer account
// @route   POST /api/auth/register
// @access  Public
// @security NEVER trust role or ID from client payload. Public registration is strictly 'customer'.
const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone, address, adminSecretKey } = req.body;

    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Name is required.',
      });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Email address is required.',
      });
    }

    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address format.',
      });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    // Check existing email
    const existingUser = await User.findOne({ email: email.trim().toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    // SECURITY: Public registration is strictly assigned 'customer' role.
    // If and only if the server environment has an ADMIN_REGISTRATION_KEY configured
    // and the request provides the exact matching key, role can be 'admin'.
    // Otherwise, client-supplied role values are completely ignored.
    let assignedRole = 'customer';
    if (
      process.env.ADMIN_REGISTRATION_KEY &&
      adminSecretKey &&
      adminSecretKey === process.env.ADMIN_REGISTRATION_KEY
    ) {
      assignedRole = 'admin';
    }

    const user = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      role: assignedRole,
      phone: phone ? String(phone).trim() : '',
      address: address || {},
    });

    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('[Auth Register Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error during registration.',
    });
  }
};

// @desc    Authenticate user & return JWT token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    // Explicitly query for password because select: false is on the schema
    const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials.',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials.',
      });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: 'Authentication successful.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('[Auth Login Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error during authentication.',
    });
  }
};

// @desc    Get profile for currently authenticated user
// @route   GET /api/auth/profile
// @access  Private (protect)
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found.',
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('[Auth Profile Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch user profile.',
    });
  }
};

// @desc    Update current user profile (name, phone, address, password)
// @route   PUT /api/auth/profile
// @access  Private (protect)
// @security Role cannot be altered via updateProfile
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    if (req.body.name) user.name = req.body.name.trim();
    if (req.body.phone !== undefined) user.phone = String(req.body.phone).trim();
    if (req.body.address && typeof req.body.address === 'object') {
      user.address = { ...user.address, ...req.body.address };
    }
    if (req.body.password && req.body.password.length >= 6) {
      user.password = req.body.password;
    }

    // Role is NOT modified here - preserves security
    const updatedUser = await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        phone: updatedUser.phone,
        address: updatedUser.address,
        updatedAt: updatedUser.updatedAt,
      },
    });
  } catch (error) {
    console.error('[Auth Update Profile Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update user profile.',
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
};
