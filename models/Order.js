import mongoose from "mongoose";

const OrderItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  image: { type: String },
  shop: { type: String, required: true },
});

const OrderSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    userEmail: { type: String, required: true },
    userName: { type: String },
    
    // Vendor info
    vendorId: { type: String, index: true },
    shopName: { type: String, required: true, index: true },
    
    // Order details
    items: [OrderItemSchema],
    totalAmount: { type: Number, required: true },
    
    // Status tracking
    status: { 
      type: String, 
      enum: ["Pending", "Accepted", "Rejected", "Preparing", "Ready", "Assigned", "Picked Up", "On the Way", "Delivered", "Cancelled"],
      default: "Pending",
      index: true
    },
    
    // Delivery info
    deliveryPartnerId: { type: String, index: true },
    deliveryPartnerName: { type: String },
    deliveryAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
      phone: { type: String },
    },
    
    // Payment info
    paymentMethod: { type: String, required: true },
    paymentStatus: { 
      type: String, 
      enum: ["Pending", "Paid", "Refunded"],
      default: "Pending"
    },
    
    // Timestamps for tracking
    placedAt: { type: Date, default: Date.now },
    acceptedAt: { type: Date },
    preparingAt: { type: Date },
    readyAt: { type: Date },
    pickedUpAt: { type: Date },
    deliveredAt: { type: Date },
    
    // Notes
    customerNotes: { type: String },
    vendorNotes: { type: String },
  },
  { timestamps: true }
);

// Index for efficient queries
OrderSchema.index({ status: 1, vendorId: 1 });
OrderSchema.index({ status: 1, deliveryPartnerId: 1 });
OrderSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
