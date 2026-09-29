const User = require('../models/User');
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');

const seedInitialData = async () => {
  try {
    const existingUsersCount = await User.countDocuments();
    if (existingUsersCount > 0) {
      console.log('Database already contains records. Skipping seed step.');
      return;
    }

    console.log('Seeding initial assessment demo data...');

    // 1. Create Default Admin / Professor
    const adminUser = await User.create({
      name: 'Prof. Alan Turing',
      email: 'prof.turing@assignmenthub.edu',
      password: 'AdminPass123!',
      role: 'admin',
    });

    // 2. Create Default Students
    const student1 = await User.create({
      name: 'Rahul Sharma',
      email: 'rahul.sharma@assignmenthub.edu',
      password: 'StudentPass123!',
      role: 'student',
    });

    const student2 = await User.create({
      name: 'Priya Patel',
      email: 'priya.patel@assignmenthub.edu',
      password: 'StudentPass123!',
      role: 'student',
    });

    // 3. Create Sample Assignments
    // A. Future Deadline (Active)
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    futureDate.setHours(23, 59, 0, 0);

    const activeAssignment = await Assignment.create({
      title: 'Web Development: Full-Stack React & Node System',
      description: 'Design and build a responsive full-stack web application implementing robust JWT authentication, MongoDB schemas, and clean RESTful API architecture.',
      deadline: futureDate,
      createdBy: adminUser._id,
    });

    // B. Past Deadline (Testing Late Submission Status)
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 2);
    pastDate.setHours(18, 0, 0, 0);

    const pastAssignment = await Assignment.create({
      title: 'Database Systems: SQL & NoSQL Normalization',
      description: 'Submit an analytical write-up discussing schema design, normalization tradeoffs, and query indexing strategies in modern document-oriented databases.',
      deadline: pastDate,
      createdBy: adminUser._id,
    });

    // 4. Create Sample Submission (Rahul Sharma on Active Assignment)
    const sampleSubmissionDate = new Date();
    sampleSubmissionDate.setHours(sampleSubmissionDate.getHours() - 4);

    await Submission.create({
      assignmentId: activeAssignment._id,
      studentId: student1._id,
      submissionLink: 'https://github.com/rahul-sharma/assignment-hub-project',
      response: 'Completed all required REST endpoints, role authentication middleware, and frontend views with clean light theme styling.',
      submittedAt: sampleSubmissionDate,
      status: 'On Time',
    });

    console.log('Seed completed successfully with default Admin, Students, and Assignments.');
  } catch (error) {
    console.error(`Error seeding initial data: ${error.message}`);
  }
};

module.exports = seedInitialData;
