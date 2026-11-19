import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Order from "@/models/Order";
import User from "@/models/User";
import { requireAuth, serverError } from "@/lib/apiAuth";

export async function POST(request) {
  const { user, response } = requireAuth(request, ["user"]);
  if (response) return response;

  try {
    await connectToDatabase();

    const body = await request.json();
    const {
      orderId,
      userName,
      items,
      totalAmount,
      deliveryAddress,
      paymentMethod,
      customerNotes,
    } = body;

    // Validation
    if (!orderId || !Array.isArray(items) || items.length === 0 || !totalAmount || !deliveryAddress) {
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
    // Saving the same order twice (e.g. refreshing the success page) is fine
    const existing = await Order.findOne({ orderId: String(orderId) });
    if (existing) {
      if (existing.userId !== user.id) {
        return NextResponse.json({ error: "Order ID already in use" }, { status: 409 });
      }
      return NextResponse.json({ message: "Order already saved", order: existing }, { status: 200 });
    }

    // The customer always comes from the login token, not from the request body
    const order = await Order.create({
      orderId: String(orderId),
      userId: user.id,
      userEmail: user.email,
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
    return serverError("Error creating order:", error);
  }
}
