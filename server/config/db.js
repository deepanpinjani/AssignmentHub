const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');
const { MongoMemoryServer } = require('mongodb-memory-server');

const envCandidates = [
  path.resolve(__dirname, '../.env'),
  path.resolve(__dirname, '..', '..', '.env'),
  path.resolve(__dirname, '.env'),
];

for (const envFile of envCandidates) {
  dotenv.config({ path: envFile });
}

const sanitizeMongoUri = (rawUri) => {
  if (!rawUri) return rawUri;

  if (rawUri.includes('<') || rawUri.includes('>')) {
    return rawUri.replace(/<|>/g, '');
  }

  return rawUri;
};

const connectDB = async () => {
  try {
    const mongoUri = sanitizeMongoUri(process.env.MONGO_URI);

    if (!mongoUri || mongoUri.trim() === '') {
      throw new Error('MONGO_URI is missing. Add the Atlas connection string to the backend .env file before starting the API.');
    }

    const conn = await mongoose.connect(mongoUri, {
      dbName: 'assignmentHub',
      serverSelectionTimeoutMS: 15000,
    });

    console.log(`MongoDB connected successfully to database: "${conn.connection.name}" on host: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);

    try {
      console.log('Falling back to embedded MongoDB Memory Server for local development.');
      const memoryServer = await MongoMemoryServer.create();
      const fallbackUri = memoryServer.getUri();
      const conn = await mongoose.connect(fallbackUri, {
        dbName: 'assignmentHub',
      });
      console.log(`MongoDB fallback connected successfully to database: "${conn.connection.name}" on host: ${conn.connection.host}`);
      return conn;
    } catch (fallbackError) {
      console.error('Fallback MongoDB connection failed:', fallbackError.message);
      throw error;
    }
  }
};

module.exports = connectDB;
