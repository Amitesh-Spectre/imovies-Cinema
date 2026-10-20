const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/imovies';

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000,
    });
    isConnected = true;
    global.USE_IN_MEMORY_FALLBACK = false;
    console.log(`[MongoDB] Connected successfully to: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.warn(`[MongoDB] Notice: Could not connect to local MongoDB (${error.message}).`);
    console.log(`[MongoDB] Operating in Zero-Config High-Fidelity IN-MEMORY DATA STORE mode.`);
    console.log(`[MongoDB] (To connect to a live MongoDB instance, start mongod or set MONGODB_URI in server/.env)`);
    global.USE_IN_MEMORY_FALLBACK = true;
    return null;
  }
};

const disconnectDB = async () => {
  if (isConnected) {
    await mongoose.disconnect();
  }
};

module.exports = { connectDB, disconnectDB };
