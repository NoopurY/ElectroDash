"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bike, ShoppingBag, Store } from "lucide-react";
import AuthShell from "@/components/AuthShell";
import { Alert, Field, Spinner } from "@/components/ui";

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
    vendorCode: "",
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
          vendorCode: formData.vendorCode,
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

  const ROLES = [
    { value: "user", label: "Customer", text: "Order parts", icon: ShoppingBag },
    { value: "admin", label: "Vendor", text: "Sell from your shop", icon: Store },
    { value: "delivery", label: "Delivery", text: "Earn by delivering", icon: Bike },
  ];

  return (
    <AuthShell
      title="Create your account"
      subtitle="Join ElectroDash in under a minute."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-brand-600 hover:text-brand-700">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && <Alert>{error}</Alert>}

        <fieldset>
          <legend className="field-label">I want to</legend>
          <div className="grid grid-cols-3 gap-2.5">
            {ROLES.map(({ value, label, text, icon: Icon }) => {
              const active = formData.role === value;
              return (
                <label
                  key={value}
                  className={`relative flex cursor-pointer flex-col items-center gap-1.5 rounded-2xl border px-2 py-3.5 text-center transition ${
                    active
                      ? "border-brand-500 bg-brand-50 ring-4 ring-brand-500/10"
                      : "border-line bg-white hover:border-slate-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={value}
                    checked={active}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <span
                    className={`grid h-9 w-9 place-items-center rounded-xl ${
                      active ? "bg-brand-600 text-white" : "bg-slate-100 text-ink-soft"
                    }`}
                  >
                    <Icon size={18} />
                  </span>
                  <span className={`text-sm font-semibold ${active ? "text-brand-700" : "text-ink"}`}>{label}</span>
                  <span className="hidden text-[11px] leading-tight text-muted sm:block">{text}</span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name" htmlFor="name">
            <input
              type="text"
              id="name"
              name="name"
              autoComplete="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="input"
              placeholder="Riya Mehta"
            />
          </Field>
          <Field label="Phone" htmlFor="phone">
            <input
              type="tel"
              id="phone"
              name="phone"
              autoComplete="tel"
              value={formData.phone}
              onChange={handleChange}
              className="input"
              placeholder="98200 00000"
            />
          </Field>
        </div>

        <Field label="Email address" htmlFor="email">
          <input
            type="email"
            id="email"
            name="email"
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="input"
            placeholder="you@example.com"
          />
        </Field>

        {formData.role === "admin" && (
          <div className="space-y-4 rounded-2xl border border-line bg-surface p-4 animate-fade-up">
            <p className="eyebrow">Shop details</p>
            <Field label="Shop name" htmlFor="shopName">
              <input
                type="text"
                id="shopName"
                name="shopName"
                value={formData.shopName}
                onChange={handleChange}
                required
                placeholder="e.g. Gada Electronics"
                className="input"
              />
            </Field>
            <Field label="Shop address" htmlFor="shopAddress">
              <textarea
                id="shopAddress"
                name="shopAddress"
                value={formData.shopAddress}
                onChange={handleChange}
                rows="2"
                placeholder="Shop no., street, area"
                className="input"
              />
            </Field>
            <Field
              label="Vendor invite code"
              htmlFor="vendorCode"
              hint="Only needed if the site owner gave you one."
            >
              <input
                id="vendorCode"
                name="vendorCode"
                type="text"
                value={formData.vendorCode}
                onChange={handleChange}
                className="input"
              />
            </Field>
          </div>
        )}

        {formData.role === "delivery" && (
          <div className="rounded-2xl border border-line bg-surface p-4 animate-fade-up">
            <Field label="Vehicle type" htmlFor="vehicleType">
              <select
                id="vehicleType"
                name="vehicleType"
                value={formData.vehicleType}
                onChange={handleChange}
                required
                className="input"
              >
                <option value="">Select your vehicle</option>
                <option value="Bike">Bike</option>
                <option value="Scooter">Scooter</option>
                <option value="Bicycle">Bicycle</option>
                <option value="Car">Car</option>
              </select>
            </Field>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Password" htmlFor="password" hint="At least 6 characters">
            <input
              type="password"
              id="password"
              name="password"
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              className="input"
            />
          </Field>
          <Field label="Confirm password" htmlFor="confirmPassword">
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              autoComplete="new-password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="input"
            />
          </Field>
        </div>

        <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-full">
          {loading ? (
            <>
              <Spinner size={16} /> Creating account…
            </>
          ) : (
            "Create account"
          )}
        </button>
      </form>
    </AuthShell>
  );
}
