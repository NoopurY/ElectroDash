import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Order from "@/models/Order";

export async function POST(request, { params }) {
  try {
    await connectToDatabase();

    const { id } = params;

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Update order status to Rejected
    order.status = "Rejected";
    await order.save();

    return NextResponse.json(
      { message: "Order rejected", order },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error rejecting order:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
