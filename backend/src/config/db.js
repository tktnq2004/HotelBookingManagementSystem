import mongoose from "mongoose";

const connectDB = async (connectionString) => {
  try {
    await mongoose.connect(connectionString);

    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB error:", error);
    process.exit(1);
  }
};

export default connectDB;