import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Order from "@/models/Order";
import User from "@/models/User";

export async function POST(request) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const {
      orderId,
      userId,
      userEmail,
      userName,
      items,
      totalAmount,
      deliveryAddress,
      paymentMethod,
      customerNotes,
    } = body;

    // Validation
    if (!orderId || !userId || !items || !totalAmount || !deliveryAddress) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get shop name from first item (assuming all items are from same shop)
    const shopName = items[0]?.shopName || items[0]?.shop;
    if (!shopName) {
      return NextResponse.json(
        { error: "Shop name is required" },
        { status: 400 }
      );
    }

    // Map items to match Order schema
    const orderItems = items.map(item => ({
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image,
      shop: item.shopName || item.shop
    }));

    // Find vendor by shop name (case-insensitive, trimmed) to avoid mismatches
    const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const normalizedShop = (shopName || "").trim();
    let vendor = null;
    if (normalizedShop) {
      const regex = new RegExp(`^${escapeRegExp(normalizedShop)}$`, "i");
      vendor = await User.findOne({ shopName: regex, role: "admin" });
    }
    
    // Create order
    const order = await Order.create({
      orderId,
      userId,
      userEmail,
      userName,
      vendorId: vendor?._id,
      shopName,
      items: orderItems,
      totalAmount,
      deliveryAddress,
      paymentMethod,
      customerNotes,
      status: "Pending",
      placedAt: new Date(),
    });

    return NextResponse.json(
      {
        message: "Order created successfully",
        order,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
