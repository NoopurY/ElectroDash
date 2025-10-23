"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [shouldRenderLanding, setShouldRenderLanding] = useState(false);

  // On first load of "/", if a logged-in user exists in localStorage,
  // immediately redirect them to their role-specific area.
  useEffect(() => {
    try {
      const token =
        typeof window !== "undefined" && localStorage.getItem("token");
      const raw = typeof window !== "undefined" && localStorage.getItem("user");
      const user = raw ? JSON.parse(raw) : null;

      const roleToPath = {
        admin: "/admin",
        delivery: "/delivery",
        user: "/user",
      };

      if (token && user?.role && roleToPath[user.role]) {
        router.replace(roleToPath[user.role]);
        return; // Do not render landing while redirecting
      }
    } catch (e) {
      // If parsing fails, fall back to showing landing
    }
    setShouldRenderLanding(true);
  }, [router]);

  if (!shouldRenderLanding) return null;

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center"
      style={{ backgroundColor: "#EAF2FF" }}
    >
      <div className="text-center max-w-2xl px-4">
        <h1
          className="text-6xl font-extrabold mb-4 bg-clip-text text-transparent"
          style={{
            backgroundImage:
              "linear-gradient(90deg, #012A6B 0%, #023E8A 30%, #2B6CEA 65%, #7FB1FF 100%)",
            backgroundSize: "200% auto",
            backgroundPosition: "center",
            textShadow: "0 6px 18px rgba(2,62,138,0.18)",
          }}
        >
          ElectroDash
        </h1>
        <p className="text-xl mb-8" style={{ color: "#6B6B6B" }}>
          Get your components before your souldering iron cools!
        </p>

        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            href="/login"
            className="px-8 py-3 rounded-lg font-medium text-white hover:opacity-90 transition-opacity"
            style={{ backgroundColor: "#023E8A" }}
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="px-8 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
            style={{
              backgroundColor: "#FFFFFF",
              color: "#5A8DEE",
              border: "2px solid #5A8DEE",
            }}
          >
            Sign Up
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            className="p-6 rounded-lg"
            style={{
              backgroundColor: "#FFFFFF",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
            }}
          >
            <h3 className="font-bold text-lg mb-2" style={{ color: "#212121" }}>
              For Customers
            </h3>
            <p style={{ color: "#6B6B6B" }}>Order components with ease</p>
          </div>
          <div
            className="p-6 rounded-lg"
            style={{
              backgroundColor: "#FFFFFF",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
            }}
          >
            <h3 className="font-bold text-lg mb-2" style={{ color: "#212121" }}>
              For Delivery Partners
            </h3>
            <p style={{ color: "#6B6B6B" }}>Earn by delivering components</p>
          </div>
          <div
            className="p-6 rounded-lg"
            style={{
              backgroundColor: "#FFFFFF",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
            }}
          >
            <h3 className="font-bold text-lg mb-2" style={{ color: "#212121" }}>
              For Admins
            </h3>
            <p style={{ color: "#6B6B6B" }}>Manage the entire platform</p>
          </div>
        </div>
      </div>
    </div>
  );
}
