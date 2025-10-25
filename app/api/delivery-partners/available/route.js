import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";

export async function GET(request) {
  try {
    await connectToDatabase();

    // Fetch all delivery partners who are available
    const partners = await User.find({ 
      role: "delivery",
      isAvailable: true 
    }).select('name email phone vehicleType isAvailable');

    return NextResponse.json({ partners }, { status: 200 });
  } catch (error) {
    console.error("Error fetching delivery partners:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
