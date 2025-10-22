import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin", "delivery"], required: true },
    name: { type: String },
    phone: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
