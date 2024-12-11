import mongoose from "mongoose";

const connectDb = async (databaseUrl: string) => {
  try {
    await mongoose.connect(databaseUrl);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
};

export default connectDb;