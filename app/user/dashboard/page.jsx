"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function UserDashboard() {
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
    if (parsedUser.role !== "user") {
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
          <h1 className="text-2xl font-bold text-white">
            Components in Minutes
          </h1>
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
            Welcome, {user.name || "Customer"}!
          </h2>
          <p style={{ color: "#6B6B6B" }}>Here's your dashboard overview</p>
        </div>

        {/* Back to Home Button */}
        <div className="mb-8">
          <button
            onClick={() => router.push("/user")}
            className="px-4 py-2 rounded font-medium text-white shadow-md hover:opacity-90"
            style={{ backgroundColor: "#5A8DEE" }}
          >
            Back to Home
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
              Active Orders
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
              Saved Components
            </h3>
            <p className="text-3xl font-bold" style={{ color: "#212121" }}>
              0
            </p>
          </div>
        </div>

        {/* Recent Activity */}
        <div
          className="p-6 rounded-lg shadow-md"
          style={{ backgroundColor: "#FFFFFF" }}
        >
          <h3 className="text-xl font-bold mb-4" style={{ color: "#212121" }}>
            Recent Activity
          </h3>
          <p style={{ color: "#6B6B6B" }}>No recent activity yet</p>
        </div>
      </main>
    </div>
  );
}
