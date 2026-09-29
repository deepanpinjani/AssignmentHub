const jwt = require('jsonwebtoken');
const User = require('../models/User');

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
});

const generateToken = (user) => {
  const secret = process.env.JWT_SECRET;

  if (!secret || secret.includes('<') || secret.includes('>') || secret.trim() === '') {
    throw new Error('JWT_SECRET is missing or invalid. Set it in the backend environment before starting the server.');
  }

  return jwt.sign({ id: user._id, role: user.role }, secret, { expiresIn: '7d' });
};

const registerUser = async (req, res, role, roleLabel) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Name is required.' });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Email is required.' });
    }

    if (!password) {
      return res.status(400).json({ success: false, message: 'Password is required.' });
    }

    if (!confirmPassword) {
      return res.status(400).json({ success: false, message: 'Please confirm your password.' });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role,
    });

    return res.status(201).json({
      success: true,
      message: `${roleLabel} registered successfully. Please log in.`,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error(`Error in ${roleLabel} registration:`, error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Server error during registration. Please try again.',
    });
  }
};

const loginUser = async (req, res, expectedRole, roleLabel) => {
  try {
    const { email, password } = req.body;

    if (!email || !email.trim() || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    if (user.role !== expectedRole) {
      return res.status(401).json({
        success: false,
        message: `This account is not registered as a ${roleLabel}.`,
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: `${roleLabel} login successful`,
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error(`Error in ${roleLabel} login:`, error);
    return res.status(500).json({
      success: false,
      message: 'Server error during login. Please try again.',
    });
  }
};

// POST /api/auth/admin/register
const adminRegister = (req, res) => registerUser(req, res, 'admin', 'Admin');

// POST /api/auth/admin/login
const adminLogin = (req, res) => loginUser(req, res, 'admin', 'admin');

// POST /api/auth/student/register
const studentRegister = (req, res) => registerUser(req, res, 'student', 'Student');

// POST /api/auth/student/login
const studentLogin = (req, res) => loginUser(req, res, 'student', 'student');

// GET /api/auth/me
const getMe = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      user: sanitizeUser(req.user),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving user profile.',
    });
  }
};

module.exports = {
  adminRegister,
  adminLogin,
  studentRegister,
  studentLogin,
  getMe,
};
