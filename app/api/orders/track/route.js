import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Order from "@/models/Order";
import { requireAuth, forbidden, serverError, canViewOrder } from "@/lib/apiAuth";

export async function GET(request) {
  const { user, response } = requireAuth(request);
  if (response) return response;

  try {
    await connectToDatabase();

    const orderId = new URL(request.url).searchParams.get("orderId");
    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    // Find order by orderId (not MongoDB _id)
    const order = await Order.findOne({ orderId: String(orderId) });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    if (!canViewOrder(user, order)) return forbidden();

    return NextResponse.json({ order }, { status: 200 });
  } catch (error) {
    return serverError("Error fetching order:", error);
  }
}
