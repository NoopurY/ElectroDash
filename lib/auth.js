import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-key";

// In-memory user storage (replace with database in production)
export const users = [];

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
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

// Verify JWT token
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// Find user by email
export function findUserByEmail(email) {
  return users.find((user) => user.email === email);
}

// Create new user
export async function createUser(email, password, role, additionalData = {}) {
  const existingUser = findUserByEmail(email);
  if (existingUser) {
    throw new Error("User already exists");
  }

  const hashedPassword = await hashPassword(password);
  const newUser = {
    id: Date.now().toString(),
    email,
    password: hashedPassword,
    role, // 'user', 'admin', 'delivery'
    createdAt: new Date().toISOString(),
    ...additionalData,
  };

  users.push(newUser);
  return newUser;
}

// Validate role
export function isValidRole(role) {
  return ["user", "admin", "delivery"].includes(role);
}
