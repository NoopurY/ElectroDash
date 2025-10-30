import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";

export async function GET() {
  try {
    await connectToDatabase();
    // Only include admins that have a non-empty shopName to avoid "Unknown Shop" entries
    const admins = await User.find({ role: "admin", shopName: { $exists: true, $ne: "" } }).lean();

    // Deduplicate by shopName (in case multiple admin records share the same name)
    const seen = new Set();
    const shops = [];

    for (const a of admins) {
      const name = (a.shopName || "").trim();
      if (!name) continue;
      if (seen.has(name)) continue;
      seen.add(name);
      // Assign random ETA between 10 and 20 minutes for display purposes
      const mins = Math.floor(Math.random() * (20 - 10 + 1)) + 10;
      shops.push({
        name,
        addr: a.shopAddress || "",
        time: `${mins} mins`,
        id: String(a._id),
      });
    }

    return NextResponse.json({ shops });
  } catch (error) {
    return NextResponse.json({ error: "Could not load shops" }, { status: 500 });
  }
}
