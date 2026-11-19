import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db";
import Order from "@/models/Order";
import User from "@/models/User";
import { requireAuth, forbidden, serverError } from "@/lib/apiAuth";

export async function POST(request, { params }) {
  const { user, response } = requireAuth(request, ["admin"]);
  if (response) return response;

  try {
    await connectToDatabase();
    const { id } = await params;
    const { deliveryPartnerId } = await request.json();

    if (!deliveryPartnerId || !mongoose.isValidObjectId(deliveryPartnerId)) {
      return NextResponse.json(
        { error: "Delivery partner ID is required" },
        { status: 400 }
      );
    }

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    if (order.vendorId !== user.id) return forbidden();

    // Make sure the partner really exists, and take the name from the database
    const partner = await User.findOne({ _id: deliveryPartnerId, role: "delivery" });
    if (!partner) {
      return NextResponse.json(
        { error: "Delivery partner not found" },
        { status: 404 }
      );
    }

    order.deliveryPartnerId = String(partner._id);
    order.deliveryPartnerName = partner.name || partner.email;
    order.status = "Assigned";
    await order.save();

    return NextResponse.json(
      { message: "Delivery partner assigned successfully", order },
      { status: 200 }
    );
  } catch (error) {
    return serverError("Error assigning delivery partner:", error);
  }
}
