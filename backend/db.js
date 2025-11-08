import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error("❌ MONGODB_URI environment variable is not set");
      process.exit(1);
    }
    
    // Connection options with timeout and retry settings
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000, // 30 seconds timeout
      socketTimeoutMS: 45000, // 45 seconds socket timeout
      connectTimeoutMS: 30000, // 30 seconds connection timeout
      maxPoolSize: 10, // Maintain up to 10 socket connections
      minPoolSize: 5, // Maintain at least 5 socket connections
      retryWrites: true,
      retryReads: true,
    };
    
    await mongoose.connect(mongoUri, options);
    console.log("✅ MongoDB connected successfully");
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error("❌ MongoDB connection error:", err.message);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn("⚠️ MongoDB disconnected. Attempting to reconnect...");
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log("✅ MongoDB reconnected successfully");
    });
    
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    console.error("Error details:", {
      name: error.name,
      code: error.code,
      reason: error.reason?.message || error.reason
    });
    
    // Don't exit immediately - allow the server to start and retry
    console.log("⚠️ Server will continue but database operations may fail");
    console.log("💡 Please check:");
    console.log("   1. MongoDB Atlas cluster is running");
    console.log("   2. Your IP address is whitelisted in MongoDB Atlas");
    console.log("   3. Connection string is correct");
    console.log("   4. Network connectivity is available");
  }
};

// Helper function to check if database is connected
export const isConnected = () => {
  return mongoose.connection.readyState === 1; // 1 = connected
};

// Helper function to wait for connection
export const waitForConnection = async (maxWait = 10000) => {
  if (isConnected()) {
    return true;
  }
  
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const checkConnection = () => {
      if (isConnected()) {
        resolve(true);
      } else if (Date.now() - startTime > maxWait) {
        reject(new Error("Database connection timeout"));
      } else {
        setTimeout(checkConnection, 100);
      }
    };
    
    checkConnection();
  });
};

export default connectDB;