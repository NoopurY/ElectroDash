"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      // Store token in localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Redirect based on role
      if (data.user.role === "admin") {
        router.push("/admin/dashboard");
      } else if (data.user.role === "delivery") {
        router.push("/delivery/dashboard");
      } else {
        router.push("/user/dashboard");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: "#EAF2FF" }}
    >
      <div
        className="w-full max-w-md p-8 rounded-lg"
        style={{
          backgroundColor: "#FFFFFF",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.2)",
        }}
      >
        <h1
          className="text-3xl font-bold text-center mb-2"
          style={{ color: "#5A8DEE" }}
        >
          Welcome Back
        </h1>
        <p className="text-center mb-6" style={{ color: "#6B6B6B" }}>
          Login to your account
        </p>

        {error && (
          <div
            className="mb-4 p-3 rounded"
            style={{ backgroundColor: "#FFE5DD", color: "#FF6B35" }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block mb-2 font-medium"
              style={{ color: "#212121" }}
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded border outline-none focus:ring-2"
              style={{
                borderColor: "#DADADA",
                color: "#212121",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#5A8DEE")}
              onBlur={(e) => (e.target.style.borderColor = "#DADADA")}
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block mb-2 font-medium"
              style={{ color: "#212121" }}
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded border outline-none focus:ring-2"
              style={{
                borderColor: "#DADADA",
                color: "#212121",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#5A8DEE")}
              onBlur={(e) => (e.target.style.borderColor = "#DADADA")}
              placeholder="Enter your password"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="mr-2"
                style={{ accentColor: "#5A8DEE" }}
              />
              <span style={{ color: "#6B6B6B" }}>Remember me</span>
            </label>
            <Link
              href="/forgot-password"
              className="text-sm hover:underline"
              style={{ color: "#5A8DEE" }}
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: "#023E8A" }}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="mt-6 text-center" style={{ color: "#6B6B6B" }}>
          Don't have an account?{" "}
          <Link
            href="/signup"
            className="font-medium hover:underline"
            style={{ color: "#5A8DEE" }}
          >
            Sign up here
          </Link>
        </p>
      </div>
    </div>
  );
}
