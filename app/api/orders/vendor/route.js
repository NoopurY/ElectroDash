import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Order from "@/models/Order";
import { requireAuth, serverError } from "@/lib/apiAuth";

export async function GET(request) {
  const { user, response } = requireAuth(request, ["admin"]);
  if (response) return response;

  try {
    await connectToDatabase();

    // Always use the logged-in vendor's id, never one from the URL
    const orders = await Order.find({ vendorId: user.id })
      .sort({ createdAt: -1 })
      .limit(100);

    return NextResponse.json({ orders }, { status: 200 });
  } catch (error) {
    return serverError("Error fetching vendor orders:", error);
  }
}
