import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Order from "@/models/Order";
import { requireAuth, forbidden, serverError } from "@/lib/apiAuth";

export async function POST(request, { params }) {
  const { user, response } = requireAuth(request, ["admin"]);
  if (response) return response;

  try {
    await connectToDatabase();
    const { id } = await params;

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    if (order.vendorId !== user.id) return forbidden();

    order.status = "Accepted";
    order.acceptedAt = new Date();
    await order.save();

    return NextResponse.json(
      { message: "Order accepted successfully", order },
      { status: 200 }
    );
  } catch (error) {
    return serverError("Error accepting order:", error);
  }
}
