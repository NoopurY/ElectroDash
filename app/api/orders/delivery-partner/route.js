import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Order from "@/models/Order";

export async function GET(request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const partnerId = searchParams.get("partnerId");

    if (!partnerId) {
      return NextResponse.json(
        { error: "Partner ID is required" },
        { status: 400 }
      );
    }

    // Fetch orders assigned to this delivery partner
    const orders = await Order.find({ deliveryPartnerId: partnerId })
      .sort({ createdAt: -1 })
      .limit(50);

    return NextResponse.json({ orders }, { status: 200 });
  } catch (error) {
    console.error("Error fetching delivery partner orders:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
