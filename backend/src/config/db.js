const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const connStr = process.env.MONGODB_URI;
    console.log(`Connecting to MongoDB at ${connStr}...`);
    const conn = await mongoose.connect(connStr);
    console.log(`MongoDB Connected`);
    return conn;
  } catch (error) {
    console.error(`MongoDB Connection Error`);
    process.exit(1);
  }
};

module.exports = connectDB;
