"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  Heart,
  IndianRupee,
  KeyRound,
  Package,
  ShoppingBag,
  Truck,
  User,
} from "lucide-react";
import {
  AppHeader,
  EmptyState,
  Page,
  PageLoader,
  PageTitle,
  SectionTitle,
  StatCard,
  StatusBadge,
  formatINR,
} from "@/components/ui";

const LEGACY_STATUS = {
  Processing: "Pending",
  Packed: "Preparing",
  Shipped: "On the Way",
  "Out for Delivery": "On the Way",
};
const CLOSED = ["Delivered", "Cancelled", "Rejected"];

// Make database orders and older browser-saved orders look the same
function normalize(o) {
  return {
    orderId: o.orderId,
    status: LEGACY_STATUS[o.status] || o.status || "Pending",
    items: o.items || [],
    total: o.total ?? o.totalAmount ?? 0,
    date: o.placedAt || o.createdAt || o.date,
    shopName: o.shopName || o.items?.[0]?.shopName || o.items?.[0]?.shop,
  };
}

export default function UserDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [filter, setFilter] = useState("all");

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
    setFavorites(JSON.parse(localStorage.getItem("favorites") || "[]"));

    const local = JSON.parse(localStorage.getItem("orderHistory") || "[]").map(normalize);
    setOrders(local);

    // Live statuses from the server; keep any local-only orders too
    fetch("/api/orders/mine", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data?.orders) return;
        const remote = data.orders.map(normalize);
        const ids = new Set(remote.map((o) => o.orderId));
        setOrders([...remote, ...local.filter((o) => !ids.has(o.orderId))]);
      })
      .catch(() => {});
  }, [router]);

  const removeFavorite = (index) => {
    const updated = favorites.filter((_, i) => i !== index);
    setFavorites(updated);
    localStorage.setItem("favorites", JSON.stringify(updated));
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-surface">
        <AppHeader role="user" />
        <PageLoader />
      </div>
    );
  }

  const active = orders.filter((o) => !CLOSED.includes(o.status));
  const totalSpent = orders.filter((o) => !["Cancelled", "Rejected"].includes(o.status)).reduce((s, o) => s + o.total, 0);
  const shown = filter === "active" ? active : orders;
  const firstName = (user.name || "").split(" ")[0];

  return (
    <div className="min-h-screen bg-surface">
      <AppHeader role="user" />
      <Page>
        <PageTitle
          title={firstName ? `Welcome back, ${firstName}` : "My orders"}
          subtitle="Track your orders and manage your account."
          actions={
            <button onClick={() => router.push("/user")} className="btn btn-primary">
              <ShoppingBag size={17} /> Shop now
            </button>
          }
        />

        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <StatCard label="Total orders" value={orders.length} icon={Package} />
          <StatCard label="In progress" value={active.length} icon={Truck} tone="amber" />
          <StatCard label="Total spent" value={formatINR(totalSpent)} icon={IndianRupee} tone="green" />
          <StatCard label="Favourites" value={favorites.length} icon={Heart} tone="violet" />
        </div>

        <div className="mt-8 grid items-start gap-6 lg:grid-cols-[1fr_320px]">
          {/* Orders */}
          <section>
            <SectionTitle
              action={
                <div className="inline-flex rounded-xl bg-slate-100 p-1 text-sm font-medium">
                  {[
                    ["all", `All (${orders.length})`],
                    ["active", `In progress (${active.length})`],
                  ].map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => setFilter(key)}
                      className={`rounded-lg px-3 py-1.5 transition ${
                        filter === key ? "bg-white text-ink shadow-card" : "text-muted hover:text-ink"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              }
            >
              Your orders
            </SectionTitle>

            {shown.length === 0 ? (
              <EmptyState
                icon={Package}
                title={filter === "active" ? "Nothing in progress" : "No orders yet"}
                text={filter === "active" ? "Orders you place will show up here until they're delivered." : "Your orders will appear here once you place one."}
                action={
                  <button onClick={() => router.push("/user")} className="btn btn-primary">
                    Start shopping
                  </button>
                }
              />
            ) : (
              <ul className="space-y-3">
                {shown.map((order) => (
                  <li key={order.orderId}>
                    <button
                      onClick={() => router.push(`/user/track-order?orderId=${encodeURIComponent(order.orderId)}`)}
                      className="card card-hover flex w-full items-center gap-4 p-4 text-left sm:p-5"
                    >
                      <div className="hidden shrink-0 -space-x-3 sm:flex">
                        {order.items.slice(0, 3).map((item, i) => (
                          <span key={i} className="grid h-12 w-12 place-items-center overflow-hidden rounded-xl bg-surface ring-2 ring-white">
                            {item.image ? (
                              <img src={item.image} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <Package size={18} className="text-slate-400" />
                            )}
                          </span>
                        ))}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-ink">{order.shopName || "Order"}</p>
                          <StatusBadge status={order.status} />
                        </div>
                        <p className="mt-1 truncate text-sm text-muted">
                          {order.items.map((i) => `${i.name} ×${i.quantity}`).join(", ")}
                        </p>
                        <p className="mt-1 text-xs text-muted">
                          <span className="font-mono">#{order.orderId}</span>
                          {order.date && (
                            <>
                              {" · "}
                              {new Date(order.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                            </>
                          )}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1">
                        <span className="font-bold text-ink">{formatINR(order.total)}</span>
                        <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-brand-600">
                          {CLOSED.includes(order.status) ? "Details" : "Track"} <ChevronRight size={14} />
                        </span>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Sidebar */}
          <aside className="space-y-5">
            <section className="card p-5">
              <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-accent-500 text-lg font-bold text-white">
                  {(user.name || user.email || "?")[0].toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-ink">{user.name || "Customer"}</p>
                  <p className="truncate text-sm text-muted">{user.email}</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button onClick={() => router.push("/user/profile")} className="btn btn-secondary btn-sm">
                  <User size={15} /> Profile
                </button>
                <button onClick={() => router.push("/user/change-password")} className="btn btn-secondary btn-sm">
                  <KeyRound size={15} /> Password
                </button>
              </div>
            </section>

            <section className="card p-5">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-ink">
                <Heart size={16} className="text-muted" /> Favourites
              </h3>
              {favorites.length > 0 ? (
                <ul className="mt-3 space-y-1">
                  {favorites.map((item, index) => (
                    <li key={index} className="flex items-center gap-3 rounded-xl p-2 hover:bg-surface">
                      <span className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-lg bg-surface">
                        {item.image ? (
                          <img src={item.image} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <Package size={18} className="text-slate-400" />
                        )}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-ink">{item.name}</p>
                        <p className="truncate text-xs text-muted">
                          {formatINR(item.price)} · {item.shopName}
                        </p>
                      </div>
                      <button
                        onClick={() => removeFavorite(index)}
                        className="grid h-8 w-8 place-items-center rounded-lg text-red-500 hover:bg-red-50"
                        aria-label={`Remove ${item.name} from favourites`}
                      >
                        <Heart size={16} fill="currentColor" />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-muted">Tap the heart on any product to save it here.</p>
              )}
            </section>
          </aside>
        </div>
      </Page>
    </div>
  );
}
