import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Order from "@/models/Order";
import { requireAuth, forbidden, serverError, canViewOrder } from "@/lib/apiAuth";

export async function GET(request, { params }) {
  const { user, response } = requireAuth(request);
  if (response) return response;

  try {
    await connectToDatabase();
    const { id } = await params;

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    if (!canViewOrder(user, order)) return forbidden();

    return NextResponse.json({ order }, { status: 200 });
  } catch (error) {
    return serverError("Error fetching order:", error);
  }
}
