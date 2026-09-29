const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Assignment title is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Assignment description is required'],
    trim: true,
  },
  deadline: {
    type: Date,
    required: [true, 'Submission deadline is required'],
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Admin creator reference is required'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Assignment = mongoose.model('Assignment', assignmentSchema);

module.exports = Assignment;
