const express = require('express');
const router = express.Router();
const {
  adminRegister,
  adminLogin,
  studentRegister,
  studentLogin,
  getMe,
} = require('../controllers/authController');
const { requireAuth } = require('../middleware/authMiddleware');

// Admin authentication endpoints
router.post('/admin/register', adminRegister);
router.post('/admin/login', adminLogin);

// Student authentication endpoints
router.post('/student/register', studentRegister);
router.post('/student/login', studentLogin);

// Current user profile verification
router.get('/me', requireAuth, getMe);

module.exports = router;
