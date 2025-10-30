"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  Calendar,
  Store,
  Box,
  User as UserIcon,
} from "lucide-react";

export default function TrackOrderPage() {
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showStatusUpdate, setShowStatusUpdate] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute for countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  // Fetch order from database
  const fetchOrderFromDatabase = async (orderId, userId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `/api/orders/track?orderId=${orderId}&userId=${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setOrder(data.order);
      } else {
        console.error("Failed to fetch order from database");
        // Fallback to localStorage
        const orderHistory = JSON.parse(
          localStorage.getItem("orderHistory") || "[]"
        );
        const foundOrder = orderHistory.find((o) => o.orderId === orderId);
        if (foundOrder) {
          setOrder(foundOrder);
        }
      }
    } catch (error) {
      console.error("Error fetching order:", error);
      // Fallback to localStorage
      const orderHistory = JSON.parse(
        localStorage.getItem("orderHistory") || "[]"
      );
      const foundOrder = orderHistory.find((o) => o.orderId === orderId);
      if (foundOrder) {
        setOrder(foundOrder);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (!token || !userData) {
      router.push("/login");
      return;
    }

    // Get order ID from URL params (read from window.location to avoid using next/navigation hook during build)
    const url = new URL(window.location.href);
    const orderId = url.searchParams.get("orderId");
    if (!orderId) {
      router.push("/user/dashboard");
      return;
    }

    const user = JSON.parse(userData);

    // Initial fetch
    fetchOrderFromDatabase(orderId, user.id);

    // Auto-refresh every 10 seconds to get real-time updates
    const refreshInterval = setInterval(() => {
      fetchOrderFromDatabase(orderId, user.id);
    }, 10000); // Refresh every 10 seconds

    return () => clearInterval(refreshInterval);
  }, [router]);

  // Get status steps for progress tracker (Fast Delivery Flow)
  const getOrderSteps = () => {
    const allSteps = [
      {
        status: "Pending",
        label: "Order Placed",
        icon: CheckCircle,
        color: "#32CD32",
      },
      {
        status: "Accepted",
        label: "Accepted",
        icon: CheckCircle,
        color: "#32CD32",
      },
      { status: "Preparing", label: "Preparing", icon: Box, color: "#FFA500" },
      { status: "Ready", label: "Ready", icon: Package, color: "#40E0D0" },
      {
        status: "Picked Up",
        label: "Picked Up",
        icon: Truck,
        color: "#40E0D0",
      },
      {
        status: "On the Way",
        label: "On the Way",
        icon: Truck,
        color: "#40E0D0",
      },
      {
        status: "Delivered",
        label: "Delivered",
        icon: CheckCircle,
        color: "#5A8DEE",
      },
    ];

    // Find current status index
    const currentStatusIndex = allSteps.findIndex(
      (step) => step.status === order?.status
    );

    // For display, show simplified steps
    const displaySteps = [
      {
        status: "Pending",
        label: "Order Placed",
        icon: CheckCircle,
        color: "#32CD32",
      },
      { status: "Preparing", label: "Preparing", icon: Box, color: "#FFA500" },
      {
        status: "On the Way",
        label: "On the Way",
        icon: Truck,
        color: "#40E0D0",
      },
      {
        status: "Delivered",
        label: "Delivered",
        icon: Package,
        color: "#5A8DEE",
      },
    ];

    // Map current status to display step
    let displayIndex = 0;
    if (order?.status === "Pending") displayIndex = 0;
    else if (["Accepted", "Preparing"].includes(order?.status))
      displayIndex = 1;
    else if (
      ["Ready", "Assigned", "Picked Up", "On the Way"].includes(order?.status)
    )
      displayIndex = 2;
    else if (order?.status === "Delivered") displayIndex = 3;

    return displaySteps.map((step, index) => ({
      ...step,
      completed: index <= displayIndex,
      active: index === displayIndex,
    }));
  };

  // Get estimated delivery time (FAST delivery - minutes!)
  const getEstimatedDelivery = () => {
    if (!order) return "";

    const orderDate = order.placedAt
      ? new Date(order.placedAt)
      : new Date(order.createdAt || order.date);
    const now = new Date();

    const status = order.status;

    if (status === "Delivered") {
      return "Delivered ✓";
    } else if (["On the Way", "Picked Up"].includes(status)) {
      // 5-10 minutes when on the way
      const deliveryTime = new Date(orderDate.getTime() + 5 * 60 * 1000);
      const minutesLeft = Math.max(
        0,
        Math.ceil((deliveryTime.getTime() - now.getTime()) / (1000 * 60))
      );
      return minutesLeft > 0
        ? `${minutesLeft}-${minutesLeft + 5} minutes`
        : "Arriving any moment!";
    } else if (["Preparing", "Ready", "Assigned"].includes(status)) {
      // 10-15 minutes when preparing
      return "10-15 minutes";
    } else if (["Pending", "Accepted"].includes(status)) {
      // 20-30 minutes when confirmed
      return "20-30 minutes";
    } else {
      return "20-30 minutes";
    }
  };

  // Group items by shop
  const groupByShop = () => {
    if (!order?.items) return {};

    return order.items.reduce((acc, item) => {
      const shopName =
        item.shop || item.shopName || order.shopName || "Unknown Shop";
      if (!acc[shopName]) {
        acc[shopName] = [];
      }
      acc[shopName].push(item);
      return acc;
    }, {});
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-4 border-[#5A8DEE] border-t-transparent rounded-full animate-spin"></div>
          <div className="text-xl text-[#5A8DEE] font-semibold">
            Loading order details...
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  const steps = getOrderSteps();
  const groupedItems = groupByShop();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-linear-to-r from-[#5A8DEE] to-[#40E0D0] shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/user/dashboard")}
              className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition"
            >
              <ArrowLeft className="text-white" size={24} />
            </button>
            <div className="flex items-center gap-3">
              <Image
                src="/ElectroDash.png"
                alt="ElectroDash"
                width={40}
                height={40}
                className="rounded-lg"
              />
              <div>
                <h1 className="text-2xl font-bold text-white">Track Order</h1>
                <p className="text-white/80 text-sm">Order #{order.orderId}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Order Status Banner */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Order Status</h2>
              <p className="text-gray-600">
                Placed{" "}
                {(() => {
                  // Prefer placedAt, then createdAt, then date
                  const dt = order.placedAt || order.createdAt || order.date;
                  const d = dt ? new Date(dt) : null;
                  if (!d || isNaN(d.getTime())) return "Invalid date";
                  return ` ${d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })} • ${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
                })()}
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600 flex items-center gap-1">
                ⚡ Expected Delivery
              </div>
              <div className="text-lg font-bold text-[#5A8DEE]">
                {getEstimatedDelivery()}
              </div>
              {order.status !== "Delivered" && (
                <div className="text-xs text-green-600 mt-1 font-medium">
                  Lightning Fast! 🚀
                </div>
              )}
            </div>
          </div>

          {/* Progress Tracker */}
          <div className="mt-8">
            <div className="relative">
              {/* Progress Line */}
              <div className="absolute top-6 left-0 right-0 h-1 bg-gray-200 z-0">
                <div
                  className="h-full bg-linear-to-r from-[#5A8DEE] to-[#40E0D0] transition-all duration-500"
                  style={{
                    width: `${
                      ((steps.filter((s) => s.completed).length - 1) /
                        (steps.length - 1)) *
                      100
                    }%`,
                  }}
                ></div>
              </div>

              {/* Status Steps */}
              <div className="relative z-10 flex justify-between">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <div
                      key={index}
                      className="flex flex-col items-center"
                      style={{ flex: 1 }}
                    >
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                          step.completed
                            ? "bg-linear-to-br from-[#5A8DEE] to-[#40E0D0] shadow-lg scale-110"
                            : "bg-gray-200"
                        }`}
                      >
                        <Icon
                          size={24}
                          className={
                            step.completed ? "text-white" : "text-gray-400"
                          }
                        />
                      </div>
                      <div className="mt-3 text-center">
                        <p
                          className={`text-sm font-semibold ${
                            step.active
                              ? "text-[#5A8DEE]"
                              : step.completed
                              ? "text-gray-700"
                              : "text-gray-400"
                          }`}
                        >
                          {step.label}
                        </p>
                        {step.active && (
                          <p className="text-xs text-[#40E0D0] mt-1 font-medium animate-pulse">
                            Current Status
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Order Items */}
          <div className="lg:col-span-2 space-y-6">
            {/* Items by Shop */}
            {Object.entries(groupedItems).map(([shopName, items]) => (
              <div key={shopName} className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Store className="text-[#5A8DEE]" size={20} />
                  <h3 className="text-lg font-bold text-gray-800">
                    {shopName}
                  </h3>
                  <span className="text-sm text-gray-500">
                    ({items.length} items)
                  </span>
                </div>

                <div className="space-y-4">
                  {items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="w-20 h-20 bg-white border border-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            width={80}
                            height={80}
                            className="object-contain"
                          />
                        ) : (
                          <Package size={32} className="text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800">
                          {item.name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          Quantity: {item.quantity}
                        </p>
                        <p className="text-sm font-semibold text-[#5A8DEE]">
                          ₹{item.price} each
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-800">
                          ₹{item.price * item.quantity}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Order Summary */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Order Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span>₹{order.subtotal || 0}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Delivery Fee</span>
                  <span>₹{order.deliveryFee || 0}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>
                      Discount {order.couponCode && `(${order.couponCode})`}
                    </span>
                    <span>-₹{order.discount}</span>
                  </div>
                )}
                <div className="border-t pt-3 flex justify-between text-xl font-bold text-gray-800">
                  <span>Total</span>
                  <span>₹{order.total}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Delivery & Payment Info */}
          <div className="space-y-6">
            {/* Delivery Address */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <MapPin size={20} className="text-[#5A8DEE]" />
                Delivery Address
              </h3>
              {order.address ? (
                <div className="space-y-2 text-sm text-gray-700">
                  <p className="font-semibold text-gray-800">
                    {order.address.name}
                  </p>
                  <p>{order.address.addressLine1}</p>
                  {order.address.addressLine2 && (
                    <p>{order.address.addressLine2}</p>
                  )}
                  <p>
                    {order.address.city}, {order.address.pincode}
                  </p>
                  <p className="flex items-center gap-2 mt-3 text-[#5A8DEE]">
                    <Phone size={16} />
                    {order.address.phone}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No address available</p>
              )}
            </div>

            {/* Payment Info */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-[#5A8DEE]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
                Payment Method
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="font-semibold text-gray-800 capitalize">
                  {order.paymentMethod || "Not specified"}
                </p>
                <p className="text-sm text-green-600 mt-2">
                  ✓ Payment Confirmed
                </p>
              </div>
            </div>

            {/* Order Info */}
            <div className="bg-linear-to-br from-[#5A8DEE] to-[#40E0D0] rounded-xl shadow-md p-6 text-white">
              <h3 className="text-lg font-bold mb-4">Order Information</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <Package size={16} />
                  <span>Order ID: {order.orderId}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={16} />
                  <span>
                    Placed: {new Date(order.date).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Box size={16} />
                  <span>{order.items?.length || 0} items</span>
                </div>
              </div>
            </div>

            {/* Help Section */}
            <div className="bg-white rounded-xl shadow-md p-6 border-2 border-blue-100">
              <h3 className="text-lg font-bold text-gray-800 mb-3">
                Need Help?
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Have questions about your order? We are here to help!
              </p>
              <button className="w-full bg-linear-to-r from-[#5A8DEE] to-[#40E0D0] text-white py-2 rounded-lg font-semibold hover:shadow-lg transition">
                Contact Support
              </button>
            </div>

            {/* Update Status (Demo/Testing) */}
            <div className="bg-white rounded-xl shadow-md p-6 border-2 border-amber-100">
              <h3 className="text-lg font-bold text-gray-800 mb-3">
                Update Status (Demo)
              </h3>
              <p className="text-xs text-gray-500 mb-4">
                For testing purposes only
              </p>
              {!showStatusUpdate ? (
                <button
                  onClick={() => setShowStatusUpdate(true)}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white py-2 rounded-lg font-semibold transition"
                >
                  Change Status
                </button>
              ) : (
                <div className="space-y-2">
                  <button
                    onClick={() => updateOrderStatus("Processing")}
                    className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg text-sm transition"
                  >
                    ✓ Order Confirmed
                  </button>
                  <button
                    onClick={() => updateOrderStatus("Packed")}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg text-sm transition"
                  >
                    📦 Preparing
                  </button>
                  <button
                    onClick={() => updateOrderStatus("Shipped")}
                    className="w-full bg-cyan-500 hover:bg-cyan-600 text-white py-2 rounded-lg text-sm transition"
                  >
                    🚚 On the Way
                  </button>
                  <button
                    onClick={() => updateOrderStatus("Delivered")}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm transition"
                  >
                    ✨ Delivered
                  </button>
                  <button
                    onClick={() => setShowStatusUpdate(false)}
                    className="w-full bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 rounded-lg text-sm transition"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
