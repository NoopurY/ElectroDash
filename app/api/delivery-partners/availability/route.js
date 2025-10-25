import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import { verifyToken } from "@/lib/auth";

export async function PUT(request) {
  try {
    await connectToDatabase();

    // Get token from header
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { error: "Authorization header required" },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { isAvailable } = body;

    if (typeof isAvailable !== 'boolean') {
      return NextResponse.json(
        { error: "isAvailable must be a boolean" },
        { status: 400 }
      );
    }

    // Update user availability
    const user = await User.findOne({ email: decoded.email, role: "delivery" });
    
    if (!user) {
      return NextResponse.json(
        { error: "Delivery partner not found" },
        { status: 404 }
      );
    }

    user.isAvailable = isAvailable;
    await user.save();

    return NextResponse.json(
      { 
        message: "Availability updated successfully",
        isAvailable: user.isAvailable 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating availability:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
