"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Truck,
  MapPin,
  Package,
  CheckCircle,
  Clock,
  Phone,
  Store,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

export default function DeliveryDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAvailable, setIsAvailable] = useState(true);
  const [stats, setStats] = useState({
    pending: 0,
    completed: 0,
    earnings: 0,
  });

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      router.push("/login");
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== "delivery") {
      alert("Access denied. Delivery partners only.");
      router.push("/login");
      return;
    }

    setUser(parsedUser);
    setIsAvailable(parsedUser.isAvailable !== false);
    fetchOrders(parsedUser._id || parsedUser.id);

    // Auto-refresh orders every 15 seconds
    const refreshInterval = setInterval(() => {
      fetchOrders(parsedUser._id || parsedUser.id);
    }, 15000);

    return () => clearInterval(refreshInterval);
  }, [router]);

  const fetchOrders = async (deliveryPartnerId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `/api/orders/delivery-partner?partnerId=${deliveryPartnerId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);

        // Calculate stats
        const pending = data.orders.filter((o) =>
          ["Assigned", "Picked Up", "On the Way"].includes(o.status)
        ).length;
        const completed = data.orders.filter(
          (o) => o.status === "Delivered"
        ).length;
        const earnings = data.orders
          .filter((o) => o.status === "Delivered")
          .reduce((sum, o) => sum + o.totalAmount * 0.1, 0); // 10% commission

        setStats({ pending, completed, earnings });
      } else {
        console.error("Failed to fetch orders");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAvailability = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/delivery-partners/availability", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          isAvailable: !isAvailable,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setIsAvailable(data.isAvailable);

        // Update localStorage
        const userData = JSON.parse(localStorage.getItem("user"));
        userData.isAvailable = data.isAvailable;
        localStorage.setItem("user", JSON.stringify(userData));
      } else {
        alert("Failed to update availability");
      }
    } catch (error) {
      console.error("Error updating availability:", error);
      alert("Error updating availability");
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        // Refresh orders
        fetchOrders(user._id || user.id);
        alert(`Order marked as ${newStatus}`);
      } else {
        alert("Failed to update order status");
      }
    } catch (error) {
      console.error("Error updating order:", error);
      alert("Error updating order status");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-cyan-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5A8DEE] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-cyan-50 pb-20">
      {/* Header */}
      <header className="bg-linear-to-r from-[#5A8DEE] to-[#40E0D0] text-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Truck size={32} />
              <div>
                <h1 className="text-2xl font-bold">Delivery Dashboard</h1>
                <p className="text-sm text-white/80">{user?.name}</p>
              </div>
            </div>

            {/* Availability Toggle */}
            <button
              onClick={toggleAvailability}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition ${
                isAvailable
                  ? "bg-green-500 hover:bg-green-600"
                  : "bg-gray-500 hover:bg-gray-600"
              }`}
            >
              {isAvailable ? (
                <>
                  <ToggleRight size={24} />
                  Available
                </>
              ) : (
                <>
                  <ToggleLeft size={24} />
                  Offline
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Active Deliveries</p>
                <p className="text-3xl font-bold text-[#5A8DEE]">
                  {stats.pending}
                </p>
              </div>
              <Package className="text-[#5A8DEE]" size={40} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Completed Today</p>
                <p className="text-3xl font-bold text-green-600">
                  {stats.completed}
                </p>
              </div>
              <CheckCircle className="text-green-600" size={40} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Earnings</p>
                <p className="text-3xl font-bold text-[#40E0D0]">
                  ₹{stats.earnings.toFixed(2)}
                </p>
              </div>
              <Truck className="text-[#40E0D0]" size={40} />
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Package size={24} className="text-[#5A8DEE]" />
            Your Deliveries
          </h2>

          {orders.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <Package size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 text-lg">
                No deliveries assigned yet
              </p>
              <p className="text-gray-500 text-sm mt-2">
                {isAvailable
                  ? "Wait for vendors to assign you deliveries"
                  : "Turn on availability to receive deliveries"}
              </p>
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">
                      Order #{order.orderId}
                    </h3>
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <Store size={14} />
                      {order.shopName}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      order.status === "Delivered"
                        ? "bg-green-100 text-green-700"
                        : order.status === "On the Way"
                        ? "bg-blue-100 text-blue-700"
                        : order.status === "Picked Up"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>

                {/* Order Items */}
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                    <Package size={14} />
                    Items to Deliver ({order.items?.length || 0})
                  </p>
                  <div className="space-y-1">
                    {order.items?.slice(0, 3).map((item, idx) => (
                      <p key={idx} className="text-sm text-gray-600">
                        • {item.quantity}x {item.name}
                      </p>
                    ))}
                    {order.items?.length > 3 && (
                      <p className="text-sm text-gray-500 italic">
                        +{order.items.length - 3} more items
                      </p>
                    )}
                  </div>
                </div>

                {/* Delivery Address */}
                <div className="space-y-3 mb-4 p-4 bg-blue-50 border-l-4 border-[#5A8DEE] rounded">
                  <p className="text-sm font-semibold text-[#5A8DEE] flex items-center gap-1">
                    <MapPin size={16} />
                    Delivery Address
                  </p>
                  <div className="space-y-1">
                    <p className="font-semibold text-gray-800">
                      {order.userName}
                    </p>
                    <p className="text-sm text-gray-700">
                      {order.deliveryAddress.street}
                    </p>
                    <p className="text-sm text-gray-700">
                      {order.deliveryAddress.city},{" "}
                      {order.deliveryAddress.state} -{" "}
                      {order.deliveryAddress.zipCode}
                    </p>
                    {order.deliveryAddress.phone && (
                      <a
                        href={`tel:${order.deliveryAddress.phone}`}
                        className="flex items-center gap-2 text-[#5A8DEE] hover:text-[#40E0D0] text-sm font-medium mt-2"
                      >
                        <Phone size={14} />
                        {order.deliveryAddress.phone}
                      </a>
                    )}
                  </div>
                </div>

                {/* Customer Notes */}
                {order.customerNotes && (
                  <div className="mb-4 p-3 bg-yellow-50 rounded-lg">
                    <p className="text-sm font-semibold text-gray-700 mb-1">
                      Customer Notes:
                    </p>
                    <p className="text-sm text-gray-600 italic">
                      “{order.customerNotes}”
                    </p>
                  </div>
                )}

                {/* Order Amount & Earning */}
                <div className="grid grid-cols-2 gap-4 py-3 border-t border-gray-200">
                  <div>
                    <span className="text-gray-600 text-sm">Order Amount:</span>
                    <p className="text-xl font-bold text-[#5A8DEE]">
                      ₹{order.totalAmount.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600 text-sm">Your Earning:</span>
                    <p className="text-xl font-bold text-green-600">
                      ₹{(order.totalAmount * 0.1).toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 mt-4">
                  {/* Navigation Button */}
                  {order.status !== "Delivered" && (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        `${order.deliveryAddress.street}, ${order.deliveryAddress.city}, ${order.deliveryAddress.state} ${order.deliveryAddress.zipCode}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                    >
                      <MapPin size={18} />
                      Navigate to Customer
                    </a>
                  )}

                  {/* Status Update Buttons */}
                  <div className="flex gap-3">
                    {order.status === "Assigned" && (
                      <button
                        onClick={() =>
                          updateOrderStatus(order._id, "Picked Up")
                        }
                        className="flex-1 px-4 py-2 bg-linear-to-r from-[#5A8DEE] to-[#40E0D0] text-white rounded-lg font-semibold hover:shadow-lg transition"
                      >
                        Mark as Picked Up
                      </button>
                    )}
                    {order.status === "Picked Up" && (
                      <button
                        onClick={() =>
                          updateOrderStatus(order._id, "On the Way")
                        }
                        className="flex-1 px-4 py-2 bg-linear-to-r from-[#5A8DEE] to-[#40E0D0] text-white rounded-lg font-semibold hover:shadow-lg transition"
                      >
                        Mark as On the Way
                      </button>
                    )}
                    {order.status === "On the Way" && (
                      <button
                        onClick={() =>
                          updateOrderStatus(order._id, "Delivered")
                        }
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
                      >
                        Mark as Delivered
                      </button>
                    )}
                    {order.status === "Delivered" && (
                      <div className="flex-1 text-center py-2 text-green-600 font-semibold">
                        ✓ Completed
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
