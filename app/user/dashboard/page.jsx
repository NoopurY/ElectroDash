"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Package,
  ShoppingCart,
  Heart,
  MapPin,
  CreditCard,
  User,
  Bell,
  TrendingUp,
  Clock,
  CheckCircle,
  Truck,
  Star,
  Settings,
  LogOut,
  Home,
  ChevronRight,
} from "lucide-react";

export default function UserDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [orderHistory, setOrderHistory] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    activeOrders: 0,
    totalSpent: 0,
    savedItems: 0,
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      router.push("/login");
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== "user") {
      router.push("/login");
      return;
    }

    setUser(parsedUser);
    loadDashboardData();
  }, [router]);

  const loadDashboardData = () => {
    // Load order history from localStorage
    const savedOrders = JSON.parse(
      localStorage.getItem("orderHistory") || "[]"
    );
    setOrderHistory(savedOrders);

    // Load favorites
    const favs = JSON.parse(localStorage.getItem("favorites") || "[]");
    setFavorites(favs);

    // Calculate stats
    const activeOrders = savedOrders.filter(
      (order) => order.status !== "Delivered" && order.status !== "Cancelled"
    ).length;

    const totalSpent = savedOrders.reduce(
      (sum, order) => sum + (order.total || 0),
      0
    );

    setStats({
      totalOrders: savedOrders.length,
      activeOrders: activeOrders,
      totalSpent: totalSpent,
      savedItems: favs.length,
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const getOrderStatus = (order) => {
    // Return the order's status, default to "Processing" for new orders
    const status = order.status || "Processing";

    // Map old statuses to new flow labels for display
    const statusLabels = {
      Processing: "Confirmed",
      Packed: "Preparing",
      Shipped: "On the Way",
      "Out for Delivery": "On the Way",
      Delivered: "Delivered",
    };

    return statusLabels[status] || status;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Confirmed":
        return "#32CD32";
      case "Preparing":
        return "#FFA500";
      case "On the Way":
        return "#40E0D0";
      case "Delivered":
        return "#5A8DEE";
      case "Cancelled":
        return "#DC143C";
      // Legacy status colors
      case "Processing":
        return "#32CD32";
      case "Packed":
        return "#FFA500";
      case "Shipped":
        return "#40E0D0";
      case "Out for Delivery":
        return "#40E0D0";
      default:
        return "#5A8DEE";
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-4 border-[#5A8DEE] border-t-transparent rounded-full animate-spin"></div>
          <div className="text-xl text-[#5A8DEE] font-semibold">
            Loading Dashboard...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-linear-to-r from-[#5A8DEE] to-[#40E0D0] shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Image
                src="/ElectroDash.png"
                alt="ElectroDash"
                width={40}
                height={40}
                className="rounded-lg"
              />
              <div>
                <h1 className="text-2xl font-bold text-white">ElectroDash</h1>
                <p className="text-white/80 text-sm">Your Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push("/user")}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition"
              >
                <Home size={18} />
                <span className="hidden sm:inline">Home</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Welcome back, {user.name || "Customer"}! 👋
          </h2>
          <p className="text-gray-600">
            Here is what is happening with your orders and account
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Package className="text-blue-600" size={24} />
              </div>
              <span className="text-2xl">📦</span>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">
              Total Orders
            </h3>
            <p className="text-3xl font-bold text-gray-800">
              {stats.totalOrders}
            </p>
            <p className="text-xs text-green-600 mt-2">All time orders</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Truck className="text-orange-600" size={24} />
              </div>
              <span className="text-2xl">🚚</span>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">
              Active Orders
            </h3>
            <p className="text-3xl font-bold text-gray-800">
              {stats.activeOrders}
            </p>
            <p className="text-xs text-orange-600 mt-2">In transit</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-pink-100 rounded-lg">
                <Heart className="text-pink-600" size={24} />
              </div>
              <span className="text-2xl">❤️</span>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">
              Favorites
            </h3>
            <p className="text-3xl font-bold text-gray-800">
              {stats.savedItems}
            </p>
            <p className="text-xs text-pink-600 mt-2">Saved items</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Settings size={20} className="text-[#5A8DEE]" />
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => router.push("/user")}
              className="flex flex-col items-center gap-2 p-4 bg-gray-50 hover:bg-[#5A8DEE] hover:text-white rounded-lg transition group"
            >
              <ShoppingCart
                size={24}
                className="text-[#5A8DEE] group-hover:text-white"
              />
              <span className="text-sm font-medium">Shop Now</span>
            </button>
            <button
              onClick={() => router.push("/user/cart")}
              className="flex flex-col items-center gap-2 p-4 bg-gray-50 hover:bg-[#5A8DEE] hover:text-white rounded-lg transition group"
            >
              <Package
                size={24}
                className="text-[#5A8DEE] group-hover:text-white"
              />
              <span className="text-sm font-medium">View Cart</span>
            </button>
            <button
              onClick={() => router.push("/user/profile")}
              className="flex flex-col items-center gap-2 p-4 bg-gray-50 hover:bg-[#5A8DEE] hover:text-white rounded-lg transition group"
            >
              <User
                size={24}
                className="text-[#5A8DEE] group-hover:text-white"
              />
              <span className="text-sm font-medium">Profile</span>
            </button>
            <button className="flex flex-col items-center gap-2 p-4 bg-gray-50 hover:bg-[#5A8DEE] hover:text-white rounded-lg transition group">
              <MapPin
                size={24}
                className="text-[#5A8DEE] group-hover:text-white"
              />
              <span className="text-sm font-medium">Addresses</span>
            </button>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Account Info & Active Orders */}
          <div className="space-y-6">
            {/* Account Info */}
            <div className="bg-linear-to-br from-[#5A8DEE] to-[#40E0D0] rounded-xl shadow-md p-6 text-white">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <User size={18} />
                Account Info
              </h3>
              <div className="space-y-2">
                <p className="text-sm opacity-90">
                  👤 {user.name || "Customer"}
                </p>
                <p className="text-sm opacity-90">📧 {user.email || "N/A"}</p>
                <p className="text-sm opacity-90">
                  🎂 Member since {new Date().toLocaleDateString()}
                </p>
              </div>
              <button
                className="mt-4 w-full bg-white/20 hover:bg-white/30 py-2 rounded-lg text-sm font-medium transition"
                onClick={() => router.push("/user/profile")}
              >
                Edit Profile
              </button>
            </div>

            {/* Active Orders */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Truck size={18} className="text-[#5A8DEE]" />
                Active Orders
              </h3>
              {stats.activeOrders === 0 ? (
                <div className="text-center py-6">
                  <Truck size={32} className="text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No active orders</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {orderHistory
                    .filter(
                      (order) =>
                        order.status !== "Delivered" &&
                        order.status !== "Cancelled"
                    )
                    .map((order, index) => {
                      const status = getOrderStatus(order);
                      return (
                        <div
                          key={index}
                          className="border border-gray-200 rounded-lg p-3"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <p className="font-semibold text-sm text-gray-800">
                              Order #{order.orderId}
                            </p>
                            <span
                              className="px-2 py-1 rounded-full text-xs font-medium text-white"
                              style={{
                                backgroundColor: getStatusColor(status),
                              }}
                            >
                              {status}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mb-1">
                            {order.items?.length || 0} items • ₹
                            {order.total || 0}
                          </p>
                          <button
                            onClick={() =>
                              router.push(
                                `/user/track-order?orderId=${order.orderId}`
                              )
                            }
                            className="text-[#5A8DEE] hover:underline text-xs font-medium flex items-center gap-1"
                          >
                            Track Order
                            <ChevronRight size={14} />
                          </button>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>

            {/* Favorites Preview */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Heart size={18} className="text-[#5A8DEE]" />
                Favorites
              </h3>
              {favorites.length > 0 ? (
                <div className="space-y-3">
                  {favorites.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                    >
                      <div className="w-12 h-12 bg-white border border-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            width={48}
                            height={48}
                            className="object-cover"
                          />
                        ) : (
                          <Package size={20} className="text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {item.name}
                        </p>
                        <p className="text-xs text-gray-500">{item.shopName}</p>
                        <p className="text-xs font-semibold text-[#5A8DEE]">
                          ₹{item.price}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          const updatedFavs = favorites.filter(
                            (_, i) => i !== index
                          );
                          setFavorites(updatedFavs);
                          localStorage.setItem(
                            "favorites",
                            JSON.stringify(updatedFavs)
                          );
                          loadDashboardData();
                        }}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Heart size={16} fill="currentColor" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Heart size={32} className="text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 mb-3">No favorites yet</p>
                  <p className="text-xs text-gray-400">
                    Add items to favorites from shop pages
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Order History */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Clock size={20} className="text-[#5A8DEE]" />
                  Order History
                </h3>
                <button className="text-[#5A8DEE] hover:underline text-sm font-medium">
                  View All
                </button>
              </div>

              {orderHistory.length === 0 ? (
                <div className="text-center py-12">
                  <Package size={48} className="text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No orders yet</p>
                  <button
                    onClick={() => router.push("/user")}
                    className="px-6 py-2 bg-linear-to-r from-[#5A8DEE] to-[#40E0D0] text-white rounded-lg hover:shadow-lg transition"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {orderHistory.map((order, index) => {
                    const status = getOrderStatus(order);
                    return (
                      <div
                        key={index}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="font-semibold text-gray-800">
                              Order #{order.orderId || `ORD${index + 1}`}
                            </p>
                            <p className="text-sm text-gray-500">
                              {new Date(
                                order.date || Date.now()
                              ).toLocaleDateString()}
                            </p>
                          </div>
                          <span
                            className="px-3 py-1 rounded-full text-xs font-medium text-white"
                            style={{ backgroundColor: getStatusColor(status) }}
                          >
                            {status}
                          </span>
                        </div>
                        <div className="mb-3">
                          {order.items?.slice(0, 2).map((item, idx) => (
                            <p key={idx} className="text-sm text-gray-600">
                              • {item.name} x{item.quantity}
                            </p>
                          ))}
                          {order.items?.length > 2 && (
                            <p className="text-sm text-gray-500">
                              + {order.items.length - 2} more items
                            </p>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">
                              {order.items?.length || 0} items
                            </p>
                            <p className="font-bold text-gray-800">
                              ₹{order.total || 0}
                            </p>
                          </div>
                          <button
                            onClick={() =>
                              router.push(
                                `/user/track-order?orderId=${order.orderId}`
                              )
                            }
                            className="text-[#5A8DEE] hover:underline text-sm font-medium flex items-center gap-1"
                          >
                            Track Order
                            <ChevronRight size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
