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
    shopName: "",
    shopAddress: "",
    vehicleType: "",
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
          shopName: formData.shopName,
          shopAddress: formData.shopAddress,
          vehicleType: formData.vehicleType,
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
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: "#EAF2FF" }}
    >
      <div
        className="w-full max-w-sm p-6 rounded-xl"
        style={{
          backgroundColor: "#FFFFFF",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.2)",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <h1
          className="text-2xl font-bold text-center mb-1"
          style={{ color: "#5A8DEE" }}
        >
          Create Account
        </h1>

        {error && (
          <div
            className="mb-3 p-2 rounded text-sm"
            style={{ backgroundColor: "#FFE5DD", color: "#FF6B35" }}
          >
            {error}
          </div>
        )}

  <form onSubmit={handleSubmit} className="space-y-3">
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
              className="w-full px-3 py-2 rounded border outline-none focus:ring-2 text-sm"
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
              className="w-full px-3 py-2 rounded border outline-none focus:ring-2 text-sm"
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
              className="w-full px-3 py-2 rounded border outline-none focus:ring-2 text-sm"
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
              className="w-full px-3 py-2 rounded border outline-none focus:ring-2 text-sm"
              style={{
                borderColor: "#DADADA",
                color: "#212121",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#5A8DEE")}
              onBlur={(e) => (e.target.style.borderColor = "#DADADA")}
            >
              <option value="user">Customer</option>
              <option value="delivery">Delivery Partner</option>
              <option value="admin">Vendor/Shop Owner</option>
            </select>
          </div>

          {/* Conditional fields for Vendor */}
          {formData.role === "admin" && (
            <>
              <div>
                <label
                  htmlFor="shopName"
                  className="block mb-2 font-medium"
                  style={{ color: "#212121" }}
                >
                  Shop Name *
                </label>
                <input
                  type="text"
                  id="shopName"
                  name="shopName"
                  value={formData.shopName}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Gada Electronics"
                  className="w-full px-3 py-2 rounded border outline-none focus:ring-2 text-sm"
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
                  htmlFor="shopAddress"
                  className="block mb-2 font-medium"
                  style={{ color: "#212121" }}
                >
                  Shop Address
                </label>
                <textarea
                  id="shopAddress"
                  name="shopAddress"
                  value={formData.shopAddress}
                  onChange={handleChange}
                  rows="2"
                  placeholder="Full shop address"
                  className="w-full px-3 py-2 rounded border outline-none focus:ring-2 text-sm"
                  style={{
                    borderColor: "#DADADA",
                    color: "#212121",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#5A8DEE")}
                  onBlur={(e) => (e.target.style.borderColor = "#DADADA")}
                />
              </div>
            </>
          )}

          {/* Conditional fields for Delivery Partner */}
          {formData.role === "delivery" && (
            <div>
              <label
                htmlFor="vehicleType"
                className="block mb-2 font-medium"
                style={{ color: "#212121" }}
              >
                Vehicle Type *
              </label>
              <select
                id="vehicleType"
                name="vehicleType"
                value={formData.vehicleType}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 rounded border outline-none focus:ring-2 text-sm"
                style={{
                  borderColor: "#DADADA",
                  color: "#212121",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#5A8DEE")}
                onBlur={(e) => (e.target.style.borderColor = "#DADADA")}
              >
                <option value="">Select Vehicle</option>
                <option value="Bike">Bike</option>
                <option value="Scooter">Scooter</option>
                <option value="Bicycle">Bicycle</option>
                <option value="Car">Car</option>
              </select>
            </div>
          )}

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
              className="w-full px-3 py-2 rounded border outline-none focus:ring-2 text-sm"
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
            className="w-full py-2 px-4 rounded font-md text-white hover:pointer hover:text-blue-950 disabled:opacity-10 text-md"
            style={{ backgroundColor: "#40E0D0" }}
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm" style={{ color: "#6B6B6B" }}>
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
