import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Order from "@/models/Order";

export async function POST(request, { params }) {
  try {
    await connectToDatabase();

    const { id } = params;
    const body = await request.json();
    const { deliveryPartnerId, deliveryPartnerName } = body;

    if (!deliveryPartnerId) {
      return NextResponse.json(
        { error: "Delivery partner ID is required" },
        { status: 400 }
      );
    }

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Update order with delivery partner info
    order.deliveryPartnerId = deliveryPartnerId;
    order.deliveryPartnerName = deliveryPartnerName;
    order.status = "Assigned";
    
    await order.save();

    return NextResponse.json(
      { message: "Delivery partner assigned successfully", order },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error assigning delivery partner:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
