const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');

// POST /api/submissions (Student only)
const createSubmission = async (req, res) => {
  try {
    const { assignmentId, submissionLink, response } = req.body;

    // 1. Validate Assignment ID
    if (!assignmentId) {
      return res.status(400).json({
        success: false,
        message: 'Assignment ID is required.',
      });
    }

    // 2. Validate that at least ONE field is provided (link or text response)
    const trimmedLink = submissionLink ? submissionLink.trim() : '';
    const trimmedResponse = response ? response.trim() : '';

    if (!trimmedLink && !trimmedResponse) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least a submission link or a text response.',
      });
    }

    // 3. Find Assignment
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found.',
      });
    }

    // 4. One submission per assignment per student check
    const existingSubmission = await Submission.findOne({
      assignmentId: assignment._id,
      studentId: req.user._id,
    });

    if (existingSubmission) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted this assignment. Multiple submissions are not permitted.',
      });
    }

    // 5. CRITICAL BUSINESS LOGIC: Server-side Timeliness Calculation
    // Use server-generated submission timestamp (never client browser time)
    const serverSubmittedAt = new Date();
    const assignmentDeadline = new Date(assignment.deadline);

    // Rule: submittedAt <= deadline => "On Time", submittedAt > deadline => "Late"
    // Edge case: Exactly at deadline is "On Time" (<= comparison)
    const isDeadlineMet = serverSubmittedAt.getTime() <= assignmentDeadline.getTime();
    const calculatedStatus = isDeadlineMet ? 'On Time' : 'Late';

    // 6. Create Submission in Database
    const submission = await Submission.create({
      assignmentId: assignment._id,
      studentId: req.user._id,
      submissionLink: trimmedLink,
      response: trimmedResponse,
      submittedAt: serverSubmittedAt,
      status: calculatedStatus,
    });

    return res.status(201).json({
      success: true,
      message: `Assignment submitted successfully! Status: ${calculatedStatus}`,
      submission,
    });
  } catch (error) {
    // Handle compound unique index duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted this assignment. Multiple submissions are not permitted.',
      });
    }

    console.error('Error in createSubmission:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit assignment due to server error.',
    });
  }
};

// GET /api/submissions/assignment/:assignmentId (Admin only)
const getSubmissionsForAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found.',
      });
    }

    // Verify requesting admin is the creator of this assignment
    if (assignment.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access forbidden: You are not authorized to view submissions for another instructor\'s assignment.',
      });
    }

    const submissions = await Submission.find({ assignmentId })
      .populate('studentId', 'name email')
      .sort({ submittedAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      assignment: {
        id: assignment._id,
        title: assignment.title,
        description: assignment.description,
        deadline: assignment.deadline,
      },
      submissions,
    });
  } catch (error) {
    console.error('Error in getSubmissionsForAssignment:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve submissions for this assignment.',
    });
  }
};

// GET /api/submissions/my (Student only)
const getMySubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ studentId: req.user._id })
      .populate('assignmentId', 'title description deadline')
      .sort({ submittedAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      submissions,
    });
  } catch (error) {
    console.error('Error in getMySubmissions:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve your submissions.',
    });
  }
};

module.exports = {
  createSubmission,
  getSubmissionsForAssignment,
  getMySubmissions,
};
