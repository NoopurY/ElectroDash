"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, ChevronRight, KeyRound, LogOut, Mail, Package, Pencil, Phone, User } from "lucide-react";
import { Alert, AppHeader, Field, Page, PageLoader, PageTitle, formatINR, logout } from "@/components/ui";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({ name: "", email: "", phone: "" });
  const [originalData, setOriginalData] = useState({});
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [stats, setStats] = useState({ totalOrders: 0, totalSpent: 0 });

  useEffect(() => {
    // Check authentication
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
    const data = {
      name: parsedUser.name || "",
      email: parsedUser.email || "",
      phone: parsedUser.phone || "",
    };
    setProfileData(data);
    setOriginalData(data);

    const history = JSON.parse(localStorage.getItem("orderHistory") || "[]");
    setStats({
      totalOrders: history.length,
      totalSpent: history.reduce((sum, order) => sum + (order.total || 0), 0),
    });

    // Prefer the live order list from the server when available
    fetch("/api/orders/mine", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data?.orders) return;
        const counted = data.orders.filter((o) => !["Cancelled", "Rejected"].includes(o.status));
        setStats({
          totalOrders: data.orders.length,
          totalSpent: counted.reduce((sum, o) => sum + (o.totalAmount || 0), 0),
        });
      })
      .catch(() => {});
  }, [router]);

  const handleCancel = () => {
    setProfileData(originalData);
    setIsEditing(false);
  };

  const handleSave = (e) => {
    e?.preventDefault();
    // Name and phone are kept on this device
    const updatedUser = { ...user, name: profileData.name, phone: profileData.phone };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);
    setOriginalData(profileData);
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleInputChange = (field, value) => {
    setProfileData({ ...profileData, [field]: value });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-surface">
        <AppHeader role="user" />
        <PageLoader label="Loading profile…" />
      </div>
    );
  }

  const joined = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" })
    : null;

  return (
    <div className="min-h-screen bg-surface">
      <AppHeader role="user" />
      <Page className="max-w-4xl">
        <PageTitle back="/user/dashboard" title="Profile & settings" subtitle="Manage your personal details and account." />

        {saveSuccess && (
          <div className="mb-5 animate-fade-up">
            <Alert tone="success">Your profile was updated.</Alert>
          </div>
        )}

        <div className="grid items-start gap-5 lg:grid-cols-[280px_1fr]">
          {/* Summary card */}
          <section className="card p-6 text-center">
            <span className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-accent-500 text-3xl font-bold text-white shadow-lift">
              {profileData.name?.charAt(0).toUpperCase() || "U"}
            </span>
            <h2 className="mt-4 text-lg font-semibold text-ink">{profileData.name || "Customer"}</h2>
            <p className="truncate text-sm text-muted">{profileData.email}</p>

            <div className="mt-5 grid grid-cols-2 divide-x divide-line rounded-2xl border border-line">
              <div className="p-3">
                <p className="text-lg font-bold text-ink">{stats.totalOrders}</p>
                <p className="text-xs text-muted">Orders</p>
              </div>
              <div className="p-3">
                <p className="text-lg font-bold text-ink">{formatINR(stats.totalSpent)}</p>
                <p className="text-xs text-muted">Spent</p>
              </div>
            </div>
            {joined && (
              <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted">
                <Calendar size={14} /> Member since {joined}
              </p>
            )}
          </section>

          <div className="space-y-5">
            {/* Personal information */}
            <form onSubmit={handleSave} className="card p-5 sm:p-6">
              <div className="mb-5 flex items-center justify-between gap-3">
                <h3 className="font-semibold text-ink">Personal information</h3>
                {!isEditing && (
                  <button type="button" onClick={() => setIsEditing(true)} className="btn btn-secondary btn-sm">
                    <Pencil size={14} /> Edit
                  </button>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Full name" htmlFor="pf-name">
                  {isEditing ? (
                    <input
                      id="pf-name"
                      type="text"
                      value={profileData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      className="input"
                      placeholder="Your name"
                    />
                  ) : (
                    <ReadOnly icon={User}>{profileData.name || "Not set"}</ReadOnly>
                  )}
                </Field>
                <Field label="Phone number" htmlFor="pf-phone">
                  {isEditing ? (
                    <input
                      id="pf-phone"
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      className="input"
                      placeholder="Your phone number"
                    />
                  ) : (
                    <ReadOnly icon={Phone}>{profileData.phone || "Not set"}</ReadOnly>
                  )}
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Email address" hint={isEditing ? "Your login email can’t be changed here." : undefined}>
                    <ReadOnly icon={Mail}>{profileData.email}</ReadOnly>
                  </Field>
                </div>
              </div>

              {isEditing && (
                <div className="mt-5 flex justify-end gap-2 border-t border-line pt-5">
                  <button type="button" onClick={handleCancel} className="btn btn-ghost">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Save changes
                  </button>
                </div>
              )}
            </form>

            {/* Account */}
            <section className="card divide-y divide-line overflow-hidden">
              <SettingsRow
                icon={KeyRound}
                title="Change password"
                text="Update the password you use to log in"
                onClick={() => router.push("/user/change-password")}
              />
              <SettingsRow
                icon={Package}
                title="My orders"
                text="Track current orders and see past ones"
                onClick={() => router.push("/user/dashboard")}
              />
              <SettingsRow icon={LogOut} title="Log out" text="Sign out on this device" danger onClick={() => logout(router)} />
            </section>
          </div>
        </div>
      </Page>
    </div>
  );
}

function ReadOnly({ icon: Icon, children }) {
  return (
    <div className="flex h-11 items-center gap-2.5 rounded-xl bg-surface px-3.5 text-[15px] text-ink">
      <Icon size={16} className="shrink-0 text-muted" />
      <span className="truncate">{children}</span>
    </div>
  );
}

function SettingsRow({ icon: Icon, title, text, onClick, danger }) {
  return (
    <button onClick={onClick} className="group flex w-full items-center gap-4 px-5 py-4 text-left transition hover:bg-surface">
      <span
        className={`grid h-10 w-10 place-items-center rounded-xl ${
          danger ? "bg-red-50 text-red-600" : "bg-brand-50 text-brand-600"
        }`}
      >
        <Icon size={18} />
      </span>
      <span className="flex-1">
        <span className={`block text-sm font-semibold ${danger ? "text-red-600" : "text-ink"}`}>{title}</span>
        <span className="block text-xs text-muted">{text}</span>
      </span>
      <ChevronRight size={18} className="text-slate-300 transition group-hover:translate-x-0.5" />
    </button>
  );
}
