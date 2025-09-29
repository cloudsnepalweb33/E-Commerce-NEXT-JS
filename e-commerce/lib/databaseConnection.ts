import mongoose, { Mongoose } from "mongoose";

interface MongoCache {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

declare global {
  var mongoose: MongoCache | undefined;
}

const MONGODB_URI = process.env.MONGODB_URI as string;

let cached: MongoCache = global.mongoose || { conn: null, promise: null };
global.mongoose = cached;

export async function connectDB(): Promise<Mongoose> {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      dbName: "ecommerce",
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;