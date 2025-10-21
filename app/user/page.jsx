"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, User, Upload, FileText, Bot } from "lucide-react";

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    // Check authentication and role
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (!token || !userData) {
      router.push("/login");
      return;
    }
    const user = JSON.parse(userData);
    if (user.role !== "user") {
      // Only allow users with role 'user'
      if (user.role === "admin") {
        router.push("/admin/dashboard");
      } else if (user.role === "delivery") {
        router.push("/delivery/dashboard");
      } else {
        router.push("/login");
      }
      return;
    }
  }, [router]);

  // Profile icon click handler
  const handleProfileClick = () => {
    router.push("/user/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center font-sans pb-10">
      {/* ---------- HEADER ---------- */}
      <header className="w-full bg-[#5A8DEE] text-white px-5 py-4 rounded-b-3xl shadow-md">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-lg font-semibold flex items-center gap-2">
              ⚡ Bolt
            </h1>
            <p className="text-sm opacity-90">23 minutes</p>
            <p className="text-xs opacity-80">
              HOME – VIT, Sangam Nagar, Wadala (Raj)
            </p>
          </div>
          <div
            className="bg-white/20 p-2 rounded-full cursor-pointer"
            onClick={handleProfileClick}
          >
            <User size={22} />
          </div>
        </div>

        {/* ---------- SEARCH BAR ---------- */}
        <div className="mt-4">
          <div className="flex items-center bg-white text-gray-700 rounded-xl px-4 py-2 shadow-md">
            <Search size={18} className="text-gray-500" />
            <input
              type="text"
              placeholder='Search "resistor"'
              className="w-full ml-3 outline-none text-sm bg-transparent"
            />
          </div>
        </div>
      </header>

      {/* ---------- UPLOAD OPTIONS ---------- */}
      <div className="flex justify-center gap-4 mt-6">
        <button className="bg-white shadow-md p-4 rounded-2xl flex flex-col items-center w-24 hover:scale-105 transition">
          <Upload className="text-[#5A8DEE]" size={24} />
          <span className="text-xs mt-2 font-medium text-gray-700 text-center">
            Upload Photos
          </span>
        </button>

        <button className="bg-white shadow-md p-4 rounded-2xl flex flex-col items-center w-24 hover:scale-105 transition">
          <FileText className="text-[#5A8DEE]" size={24} />
          <span className="text-xs mt-2 font-medium text-gray-700 text-center">
            Upload List
          </span>
        </button>

        <button
          className="bg-white shadow-md p-4 rounded-2xl flex flex-col items-center w-24 hover:scale-105 transition"
          onClick={() => router.push("/ai-chatbot")}
        >
          <Bot className="text-[#5A8DEE]" size={24} />
          <span className="text-xs mt-2 font-medium text-gray-700 text-center">
            AI Chatbot
          </span>
        </button>
      </div>

      {/* ---------- TOP CATEGORIES ---------- */}
      <section className="w-full px-5 mt-8">
        <h2 className="text-lg font-semibold mb-3 text-gray-800">
          Top Categories
        </h2>
        <div className="flex justify-start gap-4 overflow-x-auto">
          <div className="bg-[#D9F3F0] rounded-2xl shadow-md px-4 py-3 min-w-[100px] flex flex-col items-center">
            <img
              src="https://cdn-icons-png.flaticon.com/512/2927/2927948.png"
              alt="Resistor"
              className="w-10 h-10"
            />
            <span className="text-sm font-medium mt-2">Resistors</span>
          </div>
          <div className="bg-[#D9F3F0] rounded-2xl shadow-md px-4 py-3 min-w-[100px] flex flex-col items-center">
            <img
              src="https://cdn-icons-png.flaticon.com/512/2991/2991109.png"
              alt="Transistor"
              className="w-10 h-10"
            />
            <span className="text-sm font-medium mt-2">Transistors</span>
          </div>
          <div className="bg-[#D9F3F0] rounded-2xl shadow-md px-4 py-3 min-w-[100px] flex flex-col items-center">
            <img
              src="https://cdn-icons-png.flaticon.com/512/2521/2521673.png"
              alt="Boards"
              className="w-10 h-10"
            />
            <span className="text-sm font-medium mt-2">Boards</span>
          </div>
        </div>
      </section>

      {/* ---------- NEARBY SHOPS ---------- */}
      <section className="w-full px-5 mt-8">
        <h2 className="text-lg font-semibold mb-3 text-gray-800">
          Nearby Shops
        </h2>
        <div className="space-y-4">
          {[
            {
              name: "Gada Electronics",
              time: "23 mins",
              addr: "Shop no. 19, Lamantan Road",
            },
            {
              name: "Raju Electronics",
              time: "23 mins",
              addr: "Shop no. 29, Lamantan Road",
            },
            {
              name: "Nagraj Electronics",
              time: "28 mins",
              addr: "Shop no. 12, Lamantan Road",
            },
          ].map((shop, i) => (
            <div
              key={i}
              className="bg-white shadow-md rounded-2xl p-4 flex justify-between items-center hover:scale-[1.01] transition"
            >
              <div>
                <p className="font-semibold text-gray-800">{shop.name}</p>
                <p className="text-xs text-gray-500">{shop.addr}</p>
              </div>
              <span className="bg-[#40E0D0] text-white text-xs font-semibold px-3 py-1 rounded-full">
                {shop.time}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
