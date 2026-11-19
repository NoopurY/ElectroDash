import { NextResponse } from "next/server";
import { getAuthUser } from "./auth";

// Returns { user } when the request has a valid token (and one of the allowed
// roles, if given), otherwise { response } with a 401/403 to return directly.
export function requireAuth(request, roles) {
  const user = getAuthUser(request);
  if (!user) {
    return { response: NextResponse.json({ error: "Not logged in" }, { status: 401 }) };
  }
  if (roles && !roles.includes(user.role)) {
    return { response: NextResponse.json({ error: "Not allowed" }, { status: 403 }) };
  }
  return { user };
}

export function forbidden() {
  return NextResponse.json({ error: "Not allowed" }, { status: 403 });
}

// Log the real error on the server, but don't send its details to the browser.
export function serverError(label, error) {
  console.error(label, error);
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}

// Who may look at an order: the customer who placed it, the vendor it belongs
// to, or the delivery partner it is assigned to.
export function canViewOrder(user, order) {
  if (user.role === "user") return order.userId === user.id;
  if (user.role === "admin") return order.vendorId === user.id;
  if (user.role === "delivery") return order.deliveryPartnerId === user.id;
  return false;
}
