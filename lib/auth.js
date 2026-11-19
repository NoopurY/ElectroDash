import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "./db";
import User from "@/models/User";

// Read the secret lazily so `next build` works without it, but refuse to run
// in production with a guessable default.
function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET is not set in environment variables");
  }
  return "dev-only-insecure-secret";
}

// Hash password
export async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

// Compare password
export async function comparePassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}

// Generate JWT token
export function generateToken(user) {
  const id = user?.id || (user?._id ? String(user._id) : undefined);
  return jwt.sign(
    {
      id,
      email: user.email,
      role: user.role,
    },
    getJwtSecret(),
    { expiresIn: "7d" }
  );
}

// Verify JWT token
export function verifyToken(token) {
  try {
    return jwt.verify(token, getJwtSecret());
  } catch (error) {
    return null;
  }
}

// Find user by email
export async function findUserByEmail(email) {
  await connectToDatabase();
  const doc = await User.findOne({ email }).lean();
  if (!doc) return null;
  return { ...doc, id: String(doc._id) };
}

// Create new user
export async function createUser(email, password, role, additionalData = {}) {
  await connectToDatabase();

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error("User already exists");
  }

  const hashedPassword = await hashPassword(password);
  const doc = await User.create({
    email,
    password: hashedPassword,
    role, // 'user', 'admin', 'delivery'
    ...additionalData,
  });

  const user = doc.toObject();
  // Normalize id field to match previous usage
  user.id = user._id.toString();
  return user;
}

// Validate role
export function isValidRole(role) {
  return ["user", "admin", "delivery"].includes(role);
}

// Read and verify the Bearer token on a request.
// Returns the decoded payload ({ id, email, role }) or null.
export function getAuthUser(request) {
  const header = request.headers.get("authorization") || "";
  if (!header.startsWith("Bearer ")) return null;
  const decoded = verifyToken(header.slice(7));
  if (!decoded || !decoded.id || !decoded.role) return null;
  return decoded;
}
