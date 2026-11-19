import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Order from "@/models/Order";
import { requireAuth, serverError } from "@/lib/apiAuth";

// The logged-in customer's own orders, newest first
export async function GET(request) {
  const { user, response } = requireAuth(request, ["user"]);
  if (response) return response;

  try {
    await connectToDatabase();
    const orders = await Order.find({ userId: user.id }).sort({ createdAt: -1 }).limit(50).lean();
    return NextResponse.json({ orders }, { status: 200 });
  } catch (error) {
    return serverError("Error fetching customer orders:", error);
  }
}
