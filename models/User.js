import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin", "delivery"], required: true },
    name: { type: String },
    phone: { type: String },
    // Vendor/Admin specific fields
    shopName: { type: String },
    shopAddress: { type: String },
    deliveryRadius: { type: Number, default: 5 }, // in km
    // Delivery partner specific fields
    vehicleType: { type: String },
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
