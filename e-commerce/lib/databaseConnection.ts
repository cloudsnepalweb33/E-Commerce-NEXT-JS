import mongoose, { Mongoose } from "mongoose";

interface MongoCache {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

declare global {
  var mongoose: MongoCache | undefined;
}

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error("❌ Please define the MONGODB_URI environment variable inside .env.local");
}

let cached: MongoCache = global.mongoose || { conn: null, promise: null };
global.mongoose = cached;

export async function connectDB(): Promise<Mongoose> {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    console.log("📡 Connecting MongoDB...");
    cached.promise = mongoose.connect(MONGODB_URI, {
      dbName: "e-commerce",
    });
  }

  try {
    cached.conn = await cached.promise;
    console.log("✅ MongoDB connected successfully");
  } catch (e) {
    cached.promise = null;
    console.error("❌ MongoDB connection failed", e);
    throw e;
  }

  return cached.conn;
}

export default connectDB;
