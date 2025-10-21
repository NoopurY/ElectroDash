"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    role: "user",
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

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          role: formData.role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Signup failed");
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
          Create Account
        </h1>
        <p className="text-center mb-6" style={{ color: "#6B6B6B" }}>
          Sign up to get started
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
              htmlFor="name"
              className="block mb-2 font-medium"
              style={{ color: "#212121" }}
            >
              Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded border outline-none focus:ring-2"
              style={{
                borderColor: "#DADADA",
                color: "#212121",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#5A8DEE")}
              onBlur={(e) => (e.target.style.borderColor = "#DADADA")}
            />
          </div>

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
            />
          </div>

          <div>
            <label
              htmlFor="phone"
              className="block mb-2 font-medium"
              style={{ color: "#212121" }}
            >
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded border outline-none focus:ring-2"
              style={{
                borderColor: "#DADADA",
                color: "#212121",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#5A8DEE")}
              onBlur={(e) => (e.target.style.borderColor = "#DADADA")}
            />
          </div>

          <div>
            <label
              htmlFor="role"
              className="block mb-2 font-medium"
              style={{ color: "#212121" }}
            >
              Account Type
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded border outline-none focus:ring-2"
              style={{
                borderColor: "#DADADA",
                color: "#212121",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#5A8DEE")}
              onBlur={(e) => (e.target.style.borderColor = "#DADADA")}
            >
              <option value="user">Customer</option>
              <option value="delivery">Delivery Partner</option>
              <option value="admin">Admin</option>
            </select>
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
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block mb-2 font-medium"
              style={{ color: "#212121" }}
            >
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded border outline-none focus:ring-2"
              style={{
                borderColor: "#DADADA",
                color: "#212121",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#5A8DEE")}
              onBlur={(e) => (e.target.style.borderColor = "#DADADA")}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: "#40E0D0" }}
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <p className="mt-6 text-center" style={{ color: "#6B6B6B" }}>
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium hover:underline"
            style={{ color: "#5A8DEE" }}
          >
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}
