import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Order from "@/models/Order";

export async function PUT(request, { params }) {
  try {
    await connectToDatabase();

    const { id } = params;
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      );
    }

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Update order status and relevant timestamps
    order.status = status;
    
    if (status === "Preparing") {
      order.preparingAt = new Date();
    } else if (status === "Ready") {
      order.readyAt = new Date();
    } else if (status === "Picked Up") {
      order.pickedUpAt = new Date();
    } else if (status === "Delivered") {
      order.deliveredAt = new Date();
    }

    await order.save();

    return NextResponse.json(
      { message: "Order status updated", order },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating order status:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
