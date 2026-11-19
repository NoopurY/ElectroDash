import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import { comparePassword, hashPassword } from "@/lib/auth";
import { requireAuth, serverError } from "@/lib/apiAuth";

export async function POST(request) {
  const { user, response } = requireAuth(request);
  if (response) return response;

  try {
    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Current and new password are required" },
        { status: 400 }
      );
    }
    if (typeof newPassword !== "string" || newPassword.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const dbUser = await User.findById(user.id);
    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const ok = await comparePassword(currentPassword, dbUser.password);
    if (!ok) {
      return NextResponse.json(
        { error: "Current password is incorrect", field: "currentPassword" },
        { status: 400 }
      );
    }

    dbUser.password = await hashPassword(newPassword);
    await dbUser.save();

    return NextResponse.json({ message: "Password changed successfully" }, { status: 200 });
  } catch (error) {
    return serverError("Change password error:", error);
  }
}
