"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      router.push("/login");
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== "admin") {
      router.push("/login");
      return;
    }

    setUser(parsedUser);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  if (!user) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#EAF2FF" }}
      >
        <div className="text-xl" style={{ color: "#5A8DEE" }}>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#EAF2FF" }}>
      {/* Header */}
      <header className="shadow-md" style={{ backgroundColor: "#5A8DEE" }}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded font-medium text-white hover:opacity-90"
            style={{ backgroundColor: "#40E0D0" }}
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2" style={{ color: "#212121" }}>
            Welcome, {user.name || "Admin"}!
          </h2>
          <p style={{ color: "#6B6B6B" }}>Manage your platform from here</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div
            className="p-6 rounded-lg shadow-md"
            style={{ backgroundColor: "#FFFFFF" }}
          >
            <h3
              className="text-lg font-semibold mb-2"
              style={{ color: "#5A8DEE" }}
            >
              Total Users
            </h3>
            <p className="text-3xl font-bold" style={{ color: "#212121" }}>
              0
            </p>
          </div>
          <div
            className="p-6 rounded-lg shadow-md"
            style={{ backgroundColor: "#FFFFFF" }}
          >
            <h3
              className="text-lg font-semibold mb-2"
              style={{ color: "#5A8DEE" }}
            >
              Total Orders
            </h3>
            <p className="text-3xl font-bold" style={{ color: "#212121" }}>
              0
            </p>
          </div>
          <div
            className="p-6 rounded-lg shadow-md"
            style={{ backgroundColor: "#FFFFFF" }}
          >
            <h3
              className="text-lg font-semibold mb-2"
              style={{ color: "#5A8DEE" }}
            >
              Delivery Partners
            </h3>
            <p className="text-3xl font-bold" style={{ color: "#212121" }}>
              0
            </p>
          </div>
          <div
            className="p-6 rounded-lg shadow-md"
            style={{ backgroundColor: "#FFFFFF" }}
          >
            <h3
              className="text-lg font-semibold mb-2"
              style={{ color: "#5A8DEE" }}
            >
              Components
            </h3>
            <p className="text-3xl font-bold" style={{ color: "#212121" }}>
              0
            </p>
          </div>
        </div>

        {/* Management Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div
            className="p-6 rounded-lg shadow-md"
            style={{ backgroundColor: "#FFFFFF" }}
          >
            <h3 className="text-xl font-bold mb-4" style={{ color: "#212121" }}>
              User Management
            </h3>
            <p style={{ color: "#6B6B6B" }}>View and manage all users</p>
          </div>
          <div
            className="p-6 rounded-lg shadow-md"
            style={{ backgroundColor: "#FFFFFF" }}
          >
            <h3 className="text-xl font-bold mb-4" style={{ color: "#212121" }}>
              Order Management
            </h3>
            <p style={{ color: "#6B6B6B" }}>Track and manage all orders</p>
          </div>
          <div
            className="p-6 rounded-lg shadow-md"
            style={{ backgroundColor: "#FFFFFF" }}
          >
            <h3 className="text-xl font-bold mb-4" style={{ color: "#212121" }}>
              Component Library
            </h3>
            <p style={{ color: "#6B6B6B" }}>Add and manage components</p>
          </div>
          <div
            className="p-6 rounded-lg shadow-md"
            style={{ backgroundColor: "#FFFFFF" }}
          >
            <h3 className="text-xl font-bold mb-4" style={{ color: "#212121" }}>
              Analytics
            </h3>
            <p style={{ color: "#6B6B6B" }}>View platform analytics</p>
          </div>
        </div>
      </main>
    </div>
  );
}
