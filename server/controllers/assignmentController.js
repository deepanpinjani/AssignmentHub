const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');

// POST /api/assignments (Admin only)
const createAssignment = async (req, res) => {
  try {
    const { title, description, deadline } = req.body;

    // Validate Title
    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Assignment title is required and cannot be empty.',
      });
    }

    // Validate Description
    if (!description || !description.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Assignment description is required and cannot be empty.',
      });
    }

    // Validate Deadline
    if (!deadline) {
      return res.status(400).json({
        success: false,
        message: 'Submission deadline is required.',
      });
    }

    const deadlineDate = new Date(deadline);
    if (isNaN(deadlineDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'A valid submission deadline date and time must be provided.',
      });
    }

    const assignment = await Assignment.create({
      title: title.trim(),
      description: description.trim(),
      deadline: deadlineDate,
      createdBy: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: 'Assignment created successfully.',
      assignment,
    });
  } catch (error) {
    console.error('Error in createAssignment:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create assignment due to server error.',
    });
  }
};

// GET /api/assignments
// If Admin: returns assignments created by this admin, with submission count
// If Student: returns all assignments with this student's submission status attached
const getAssignments = async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      const assignments = await Assignment.find({ createdBy: req.user._id })
        .sort({ createdAt: -1 })
        .lean();

      // Attach submission count for each assignment
      const assignmentsWithCounts = await Promise.all(
        assignments.map(async (assignment) => {
          const submissionCount = await Submission.countDocuments({
            assignmentId: assignment._id,
          });
          return {
            ...assignment,
            submissionCount,
          };
        })
      );

      return res.status(200).json({
        success: true,
        assignments: assignmentsWithCounts,
      });
    } else {
      // Student role
      const assignments = await Assignment.find()
        .populate('createdBy', 'name email')
        .sort({ deadline: 1 })
        .lean();

      // Check submission status for current student
      const assignmentsWithSubmission = await Promise.all(
        assignments.map(async (assignment) => {
          const studentSubmission = await Submission.findOne({
            assignmentId: assignment._id,
            studentId: req.user._id,
          }).lean();

          return {
            ...assignment,
            isSubmitted: !!studentSubmission,
            mySubmission: studentSubmission || null,
          };
        })
      );

      return res.status(200).json({
        success: true,
        assignments: assignmentsWithSubmission,
      });
    }
  } catch (error) {
    console.error('Error in getAssignments:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve assignments.',
    });
  }
};

// GET /api/assignments/:id
const getAssignmentById = async (req, res) => {
  try {
    const { id } = req.params;

    const assignment = await Assignment.findById(id).populate('createdBy', 'name email');
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found.',
      });
    }

    return res.status(200).json({
      success: true,
      assignment,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching assignment details.',
    });
  }
};

module.exports = {
  createAssignment,
  getAssignments,
  getAssignmentById,
};
