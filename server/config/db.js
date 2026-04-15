const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const connectDB = async () => {
  try {
    // Try standard local connection first
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 2000 // fail fast if not running
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(`Local MongoDB not found (${error.message}). Starting embedded memory server...`);
    try {
      const mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      await mongoose.connect(mongoUri);
      console.log(`Embedded MongoDB Memory Server Connected at ${mongoUri}`);
    } catch (memError) {
      console.error(`Failed to start embedded MongoDB: ${memError.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
