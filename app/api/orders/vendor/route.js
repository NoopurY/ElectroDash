import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Order from "@/models/Order";

export async function GET(request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get("vendorId");

    if (!vendorId) {
      return NextResponse.json(
        { error: "Vendor ID is required" },
        { status: 400 }
      );
    }

    // Fetch orders for this vendor
    const orders = await Order.find({ vendorId })
      .sort({ createdAt: -1 })
      .limit(100);

    return NextResponse.json({ orders }, { status: 200 });
  } catch (error) {
    console.error("Error fetching vendor orders:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
