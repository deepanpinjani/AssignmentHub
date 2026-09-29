const express = require('express');
const router = express.Router();
const {
  createAssignment,
  getAssignments,
  getAssignmentById,
} = require('../controllers/assignmentController');
const { requireAuth } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

// Protect all assignment routes with authentication
router.use(requireAuth);

// Only admins can create assignments
router.post('/', requireRole('admin'), createAssignment);

// Authenticated users (admin sees their assignments; student sees all with submission status)
router.get('/', getAssignments);

// Get single assignment by ID
router.get('/:id', getAssignmentById);

module.exports = router;
