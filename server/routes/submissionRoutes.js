const express = require('express');
const router = express.Router();
const {
  createSubmission,
  reviewSubmission,
  getSubmissionsForAssignment,
  getMySubmissions,
} = require('../controllers/submissionController');
const { requireAuth } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

// Protect all submission routes with authentication
router.use(requireAuth);

// Only students can submit assignments
router.post('/', requireRole('student'), createSubmission);
router.patch('/:submissionId/review', requireRole('admin'), reviewSubmission);

// Only authorized admins can view submissions for an assignment
router.get(
  '/assignment/:assignmentId',
  requireRole('admin'),
  getSubmissionsForAssignment
);

// Student can view their own submissions
router.get('/my', requireRole('student'), getMySubmissions);

module.exports = router;
