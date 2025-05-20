import mongoose from "mongoose";

const connectDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGO_URL;

    if (!mongoUri) {
      throw new Error("MONGO_URL is not defined in environment variables");
    }

    await mongoose.connect(mongoUri); // ✅ Clean, modern connection

    console.log("✅ MongoDB Connected");
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("❌ MongoDB connection error:", err.message);
    } else {
      console.error("❌ Unknown error connecting to MongoDB");
    }
    process.exit(1);
  }
};

export default connectDB;
