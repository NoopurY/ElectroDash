import { NextResponse } from "next/server";
import { createUser, generateToken, isValidRole } from "@/lib/auth";
import { sendEvent } from "@/lib/sse";

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password, role, name, phone, shopName, shopAddress, vehicleType } = body;

    // Validation
    if (!email || !password || !role) {
      return NextResponse.json(
        { error: "Email, password, and role are required" },
        { status: 400 }
      );
    }

    if (!isValidRole(role)) {
      return NextResponse.json(
        { error: "Invalid role. Must be user, admin, or delivery" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Additional validation for admin role
    if (role === "admin" && !shopName) {
      return NextResponse.json(
        { error: "Shop name is required for vendors" },
        { status: 400 }
      );
    }

    // Additional validation for delivery role
    if (role === "delivery" && !vehicleType) {
      return NextResponse.json(
        { error: "Vehicle type is required for delivery partners" },
        { status: 400 }
      );
    }

    // Create user with additional fields
    const user = await createUser(email, password, role, { 
      name, 
      phone, 
      shopName, 
      shopAddress,
      vehicleType 
    });

    // Generate token
    const token = generateToken(user);

    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = user;

    // If an admin/vendor was created, broadcast the new shop to connected clients
    if (role === "admin" && shopName) {
      try {
        // Assign a random delivery time between 10 and 20 minutes for now
        const mins = Math.floor(Math.random() * (20 - 10 + 1)) + 10;
        sendEvent({ name: shopName, addr: shopAddress || "", time: `${mins} mins`, id: user.id });
      } catch (err) {
        // don't fail the signup if broadcasting fails
        console.error("Failed to broadcast new shop:", err);
      }
    }

    return NextResponse.json(
      {
        message: "User created successfully",
        user: userWithoutPassword,
        token,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error.message === "User already exists") {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
