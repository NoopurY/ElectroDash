import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import { requireAuth, serverError } from "@/lib/apiAuth";

export async function GET(request) {
  const { response } = requireAuth(request, ["admin"]);
  if (response) return response;

  try {
    await connectToDatabase();

    const partners = await User.find({ role: "delivery", isAvailable: true })
      .select("name email phone vehicleType isAvailable");

    return NextResponse.json({ partners }, { status: 200 });
  } catch (error) {
    return serverError("Error fetching delivery partners:", error);
  }
}
