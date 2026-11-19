import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import { requireAuth, serverError } from "@/lib/apiAuth";

export async function PUT(request) {
  const { user, response } = requireAuth(request, ["delivery"]);
  if (response) return response;

  try {
    await connectToDatabase();

    const { isAvailable } = await request.json();
    if (typeof isAvailable !== "boolean") {
      return NextResponse.json(
        { error: "isAvailable must be a boolean" },
        { status: 400 }
      );
    }

    const partner = await User.findOne({ _id: user.id, role: "delivery" });
    if (!partner) {
      return NextResponse.json(
        { error: "Delivery partner not found" },
        { status: 404 }
      );
    }

    partner.isAvailable = isAvailable;
    await partner.save();

    return NextResponse.json(
      { message: "Availability updated successfully", isAvailable: partner.isAvailable },
      { status: 200 }
    );
  } catch (error) {
    return serverError("Error updating availability:", error);
  }
}
