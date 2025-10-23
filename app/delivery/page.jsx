"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Package,
  MapPin,
  Clock,
  DollarSign,
  CheckCircle,
} from "lucide-react";
import dynamic from "next/dynamic";

// Dynamically import map component to avoid SSR issues
const MapComponent = dynamic(() => import("./MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-xl">
      <p className="text-gray-500">Loading Map...</p>
    </div>
  ),
});

export default function DeliveryPartnerPage() {
  const router = useRouter();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orders, setOrders] = useState([
    {
      id: "ORD001",
      customer: "Rajesh Kumar",
      items: "5x Resistors, 2x Transistors",
  pickup: "Gada Electronics, Shop 19, Lamington Road",
      dropoff: "VIT, Sangam Nagar, Wadala (Raj)",
      pickupCoords: [23.8103, 91.2925],
      dropoffCoords: [23.8203, 91.3025],
      amount: 450,
      status: "pending", // pending, accepted, picked, delivered
      distance: "3.2 km",
      estimatedTime: "15 mins",
    },
    {
      id: "ORD002",
      customer: "Priya Sharma",
      items: "1x Arduino Uno, 3x LEDs",
  pickup: "Raju Electronics, Shop 29, Lamington Road",
      dropoff: "Tech Park, Sector 5, Udaipur",
      pickupCoords: [23.815, 91.2975],
      dropoffCoords: [23.825, 91.3075],
      amount: 680,
      status: "pending",
      distance: "4.5 km",
      estimatedTime: "20 mins",
    },
    {
      id: "ORD003",
      customer: "Amit Patel",
      items: "2x Capacitors, 1x Breadboard",
  pickup: "Nagraj Electronics, Shop 12, Lamington Road",
      dropoff: "Engineering College, Udaipur",
      pickupCoords: [23.808, 91.29],
      dropoffCoords: [23.818, 91.3],
      amount: 320,
      status: "accepted",
      distance: "2.8 km",
      estimatedTime: "12 mins",
    },
  ]);

  const [stats, setStats] = useState({
    totalDeliveries: 45,
    todayDeliveries: 8,
    todayEarnings: 3240,
    activeOrders: 1,
  });

  useEffect(() => {
    // Check authentication and role
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (!token || !userData) {
      router.push("/login");
      return;
    }
    const user = JSON.parse(userData);
    if (user.role !== "delivery") {
      if (user.role === "admin") {
        router.push("/admin/dashboard");
      } else if (user.role === "user") {
        router.push("/user");
      } else {
        router.push("/login");
      }
      return;
    }
  }, [router]);

  // Profile icon click handler
  const handleProfileClick = () => {
    router.push("/delivery/dashboard");
  };

  const handleAcceptOrder = (orderId) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === orderId ? { ...order, status: "accepted" } : order
      )
    );
    setStats((prev) => ({ ...prev, activeOrders: prev.activeOrders + 1 }));
  };

  const handlePickupOrder = (orderId) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === orderId ? { ...order, status: "picked" } : order
      )
    );
  };

  const handleDeliverOrder = (orderId) => {
    const order = orders.find((o) => o.id === orderId);
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === orderId ? { ...order, status: "delivered" } : order
      )
    );
    setStats((prev) => ({
      ...prev,
      todayDeliveries: prev.todayDeliveries + 1,
      todayEarnings: prev.todayEarnings + order.amount,
      activeOrders: prev.activeOrders - 1,
      totalDeliveries: prev.totalDeliveries + 1,
    }));
  };

  const handleViewOnMap = (order) => {
    setSelectedOrder(order);
    // Scroll to map
    document
      .getElementById("map-section")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "accepted":
        return "bg-blue-100 text-blue-700";
      case "picked":
        return "bg-purple-100 text-purple-700";
      case "delivered":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "pending":
        return "New Order";
      case "accepted":
        return "Accepted";
      case "picked":
        return "Picked Up";
      case "delivered":
        return "Delivered";
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center font-sans pb-10">
      {/* ---------- HEADER ---------- */}
      <header className="w-full bg-[#5A8DEE] text-white px-5 py-4 rounded-b-3xl shadow-md">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-lg font-semibold flex items-center gap-2">
              <img src="/ElectroDash.png" alt="ElectroDash" className="w-6 h-6" />
              ElectroDash Delivery
            </h1>
            <p className="text-sm opacity-90">Delivery Partner Mode</p>
            <p className="text-xs opacity-80">Online • Ready for deliveries</p>
          </div>
          <div
            className="bg-white/20 p-2 rounded-full cursor-pointer"
            onClick={handleProfileClick}
          >
            <User size={22} />
          </div>
        </div>
      </header>

      {/* ---------- MAP SECTION ---------- */}
      <section id="map-section" className="w-full px-5 mt-6">
        <h2 className="text-lg font-semibold mb-3 text-gray-800">
          Live Tracking
        </h2>
        <div className="bg-white shadow-md rounded-2xl overflow-hidden h-[300px]">
          <MapComponent selectedOrder={selectedOrder} />
        </div>
      </section>

      {/* ---------- AVAILABLE ORDERS ---------- */}
      <section className="w-full px-5 mt-6">
        <h2 className="text-lg font-semibold mb-3 text-gray-800">
          Available Orders
        </h2>
        <div className="space-y-4">
          {orders
            .filter((order) => order.status === "pending")
            .map((order) => (
              <div
                key={order.id}
                className="bg-white shadow-md rounded-2xl p-4 hover:scale-[1.01] transition"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-semibold text-gray-800">{order.id}</p>
                    <p className="text-sm text-gray-600">{order.customer}</p>
                  </div>
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {getStatusText(order.status)}
                  </span>
                </div>

                <div className="space-y-2 mb-3">
                  <div className="flex items-start gap-2">
                    <Package size={16} className="text-gray-500 mt-0.5" />
                    <p className="text-xs text-gray-600">{order.items}</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin size={16} className="text-green-500 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-600 font-medium">
                        Pickup:
                      </p>
                      <p className="text-xs text-gray-600">{order.pickup}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin size={16} className="text-red-500 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-600 font-medium">
                        Drop-off:
                      </p>
                      <p className="text-xs text-gray-600">{order.dropoff}</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                  <div className="flex gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Distance</p>
                      <p className="text-sm font-semibold text-gray-800">
                        {order.distance}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Earn</p>
                      <p className="text-sm font-semibold text-green-600">
                        ₹{order.amount}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleAcceptOrder(order.id)}
                    className="bg-[#40E0D0] text-white text-sm font-semibold px-4 py-2 rounded-full hover:opacity-90 transition"
                  >
                    Accept
                  </button>
                </div>
              </div>
            ))}
        </div>
      </section>

      {/* ---------- ACTIVE DELIVERIES ---------- */}
      <section className="w-full px-5 mt-6">
        <h2 className="text-lg font-semibold mb-3 text-gray-800">
          Your Active Deliveries
        </h2>
        <div className="space-y-4">
          {orders
            .filter(
              (order) =>
                order.status === "accepted" || order.status === "picked"
            )
            .map((order) => (
              <div
                key={order.id}
                className="bg-white shadow-md rounded-2xl p-4 hover:scale-[1.01] transition"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-semibold text-gray-800">{order.id}</p>
                    <p className="text-sm text-gray-600">{order.customer}</p>
                  </div>
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {getStatusText(order.status)}
                  </span>
                </div>

                <div className="space-y-2 mb-3">
                  <div className="flex items-start gap-2">
                    <Package size={16} className="text-gray-500 mt-0.5" />
                    <p className="text-xs text-gray-600">{order.items}</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin size={16} className="text-green-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-600 font-medium">
                        Pickup:
                      </p>
                      <p className="text-xs text-gray-600">{order.pickup}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin size={16} className="text-red-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-600 font-medium">
                        Drop-off:
                      </p>
                      <p className="text-xs text-gray-600">{order.dropoff}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => handleViewOnMap(order)}
                    className="flex-1 bg-[#5A8DEE] text-white text-sm font-semibold px-4 py-2 rounded-full hover:opacity-90 transition"
                  >
                    View on Map
                  </button>
                  {order.status === "accepted" && (
                    <button
                      onClick={() => handlePickupOrder(order.id)}
                      className="flex-1 bg-[#40E0D0] text-white text-sm font-semibold px-4 py-2 rounded-full hover:opacity-90 transition"
                    >
                      Mark Picked Up
                    </button>
                  )}
                  {order.status === "picked" && (
                    <button
                      onClick={() => handleDeliverOrder(order.id)}
                      className="flex-1 bg-green-500 text-white text-sm font-semibold px-4 py-2 rounded-full hover:opacity-90 transition"
                    >
                      Mark Delivered
                    </button>
                  )}
                </div>
              </div>
            ))}

          {orders.filter(
            (order) => order.status === "accepted" || order.status === "picked"
          ).length === 0 && (
            <div className="bg-white shadow-md rounded-2xl p-6 text-center">
              <Package className="text-gray-300 mx-auto mb-2" size={40} />
              <p className="text-gray-500">No active deliveries</p>
            </div>
          )}
        </div>
      </section>

      {/* ---------- COMPLETED DELIVERIES ---------- */}
      <section className="w-full px-5 mt-6">
        <h2 className="text-lg font-semibold mb-3 text-gray-800">
          Recently Completed
        </h2>
        <div className="space-y-4">
          {orders
            .filter((order) => order.status === "delivered")
            .map((order) => (
              <div
                key={order.id}
                className="bg-white shadow-md rounded-2xl p-4 opacity-75"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-800">{order.id}</p>
                    <p className="text-sm text-gray-600">{order.customer}</p>
                    <p className="text-xs text-gray-500 mt-1">{order.items}</p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-xs font-semibold px-3 py-1 rounded-full ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {getStatusText(order.status)}
                    </span>
                    <p className="text-sm font-semibold text-green-600 mt-2">
                      +₹{order.amount}
                    </p>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </section>
    </div>
  );
}
