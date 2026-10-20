import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config(); // <-- add this

// Treat request values in query filters as plain values, never as operators
// like $ne or $gt. Queries that need a real operator use mongoose.trusted().
mongoose.set("sanitizeFilter", true);

export const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error("❌ MONGO_URI is not defined in .env");
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI as string);
    console.log("✅ MongoDB Connected Successfully");
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err);
    process.exit(1);
  }
};
