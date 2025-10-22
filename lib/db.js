import mongoose from "mongoose";

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectToDatabase() {
  if (cached.conn) return cached.conn;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not set in environment variables");
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      dbName: process.env.MONGODB_DB || "dtproject",
    };

    cached.promise = mongoose.connect(uri, opts).then((mongoose) => mongoose);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
