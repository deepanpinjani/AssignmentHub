const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  assignmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
    required: [true, 'Assignment ID is required'],
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student ID is required'],
  },
  submissionLink: {
    type: String,
    trim: true,
    default: '',
  },
  response: {
    type: String,
    trim: true,
    default: '',
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    required: [true, 'Submission status is required'],
    enum: {
      values: ['On Time', 'Late'],
      message: 'Status must be either "On Time" or "Late"',
    },
  },
  reviewStatus: {
    type: String,
    enum: ['Pending', 'Needs Changes', 'Accepted'],
    default: 'Pending',
  },
  feedback: {
    type: String,
    trim: true,
    default: '',
  },
  marks: {
    type: Number,
    min: 0,
    max: 100,
    default: null,
  },
  reviewedAt: {
    type: Date,
    default: null,
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  history: [{
    submissionLink: { type: String, trim: true, default: '' },
    response: { type: String, trim: true, default: '' },
    submittedAt: { type: Date, required: true },
    status: { type: String, enum: ['On Time', 'Late'], required: true },
    reviewStatus: { type: String, enum: ['Pending', 'Needs Changes', 'Accepted'], default: 'Pending' },
    feedback: { type: String, trim: true, default: '' },
    marks: { type: Number, min: 0, max: 100, default: null },
    reviewedAt: { type: Date, default: null },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  }],
});

// Enforce one submission per assignment per student
submissionSchema.index({ assignmentId: 1, studentId: 1 }, { unique: true });

const Submission = mongoose.model('Submission', submissionSchema);

module.exports = Submission;
