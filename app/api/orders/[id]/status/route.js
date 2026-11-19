import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Order from "@/models/Order";
import { requireAuth, forbidden, serverError } from "@/lib/apiAuth";

// Which statuses each role is allowed to set
const ALLOWED_STATUS = {
  admin: ["Accepted", "Rejected", "Preparing", "Ready", "Cancelled"],
  delivery: ["Picked Up", "On the Way", "Delivered"],
};

export async function PUT(request, { params }) {
  const { user, response } = requireAuth(request, ["admin", "delivery"]);
  if (response) return response;

  try {
    await connectToDatabase();
    const { id } = await params;
    const { status } = await request.json();

    if (!status) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 });
    }
    if (!ALLOWED_STATUS[user.role].includes(status)) {
      return NextResponse.json(
        { error: `This account cannot set status "${status}"` },
        { status: 400 }
      );
    }

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    const owns =
      user.role === "admin"
        ? order.vendorId === user.id
        : order.deliveryPartnerId === user.id;
    if (!owns) return forbidden();

    order.status = status;
    if (status === "Preparing") order.preparingAt = new Date();
    else if (status === "Ready") order.readyAt = new Date();
    else if (status === "Picked Up") order.pickedUpAt = new Date();
    else if (status === "Delivered") order.deliveredAt = new Date();

    await order.save();

    return NextResponse.json({ message: "Order status updated", order }, { status: 200 });
  } catch (error) {
    return serverError("Error updating order status:", error);
  }
}
