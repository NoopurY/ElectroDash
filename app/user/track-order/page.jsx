"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  Store,
  Box,
  CreditCard,
} from "lucide-react";
import {
  AppHeader,
  EmptyState,
  Page,
  PageLoader,
  PageTitle,
  StatusBadge,
  formatINR,
} from "@/components/ui";

export default function TrackOrderPage() {
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute for countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  // Fetch order from database
  const fetchOrderFromDatabase = async (orderId, userId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `/api/orders/track?orderId=${orderId}&userId=${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setOrder(data.order);
      } else {
        console.error("Failed to fetch order from database");
        // Fallback to localStorage
        const orderHistory = JSON.parse(
          localStorage.getItem("orderHistory") || "[]"
        );
        const foundOrder = orderHistory.find((o) => o.orderId === orderId);
        if (foundOrder) {
          setOrder(foundOrder);
        }
      }
    } catch (error) {
      console.error("Error fetching order:", error);
      // Fallback to localStorage
      const orderHistory = JSON.parse(
        localStorage.getItem("orderHistory") || "[]"
      );
      const foundOrder = orderHistory.find((o) => o.orderId === orderId);
      if (foundOrder) {
        setOrder(foundOrder);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (!token || !userData) {
      router.push("/login");
      return;
    }

    // Get order ID from URL params (read from window.location to avoid using next/navigation hook during build)
    const url = new URL(window.location.href);
    const orderId = url.searchParams.get("orderId");
    if (!orderId) {
      router.push("/user/dashboard");
      return;
    }

    const user = JSON.parse(userData);

    // Initial fetch
    fetchOrderFromDatabase(orderId, user.id);

    // Auto-refresh every 10 seconds to get real-time updates
    const refreshInterval = setInterval(() => {
      fetchOrderFromDatabase(orderId, user.id);
    }, 10000); // Refresh every 10 seconds

    return () => clearInterval(refreshInterval);
  }, [router]);

  // Get status steps for progress tracker (Fast Delivery Flow)
  const getOrderSteps = () => {
    const allSteps = [
      {
        status: "Pending",
        label: "Order Placed",
        icon: CheckCircle,
        color: "#32CD32",
      },
      {
        status: "Accepted",
        label: "Accepted",
        icon: CheckCircle,
        color: "#32CD32",
      },
      { status: "Preparing", label: "Preparing", icon: Box, color: "#FFA500" },
      { status: "Ready", label: "Ready", icon: Package, color: "#40E0D0" },
      {
        status: "Picked Up",
        label: "Picked Up",
        icon: Truck,
        color: "#40E0D0",
      },
      {
        status: "On the Way",
        label: "On the Way",
        icon: Truck,
        color: "#40E0D0",
      },
      {
        status: "Delivered",
        label: "Delivered",
        icon: CheckCircle,
        color: "#5A8DEE",
      },
    ];

    // Find current status index
    const currentStatusIndex = allSteps.findIndex(
      (step) => step.status === order?.status
    );

    // For display, show simplified steps
    const displaySteps = [
      {
        status: "Pending",
        label: "Order Placed",
        icon: CheckCircle,
        color: "#32CD32",
      },
      { status: "Preparing", label: "Preparing", icon: Box, color: "#FFA500" },
      {
        status: "On the Way",
        label: "On the Way",
        icon: Truck,
        color: "#40E0D0",
      },
      {
        status: "Delivered",
        label: "Delivered",
        icon: Package,
        color: "#5A8DEE",
      },
    ];

    // Map current status to display step
    let displayIndex = 0;
    if (order?.status === "Pending") displayIndex = 0;
    else if (["Accepted", "Preparing"].includes(order?.status))
      displayIndex = 1;
    else if (
      ["Ready", "Assigned", "Picked Up", "On the Way"].includes(order?.status)
    )
      displayIndex = 2;
    else if (order?.status === "Delivered") displayIndex = 3;

    return displaySteps.map((step, index) => ({
      ...step,
      completed: index <= displayIndex,
      active: index === displayIndex,
    }));
  };

  // Get estimated delivery time (FAST delivery - minutes!)
  const getEstimatedDelivery = () => {
    if (!order) return "";

    const orderDate = order.placedAt
      ? new Date(order.placedAt)
      : new Date(order.createdAt || order.date);
    const now = new Date();

    const status = order.status;

    if (status === "Delivered") {
      return "Delivered ✓";
    } else if (["On the Way", "Picked Up"].includes(status)) {
      // 5-10 minutes when on the way
      const deliveryTime = new Date(orderDate.getTime() + 5 * 60 * 1000);
      const minutesLeft = Math.max(
        0,
        Math.ceil((deliveryTime.getTime() - now.getTime()) / (1000 * 60))
      );
      return minutesLeft > 0
        ? `${minutesLeft}-${minutesLeft + 5} minutes`
        : "Arriving any moment!";
    } else if (["Preparing", "Ready", "Assigned"].includes(status)) {
      // 10-15 minutes when preparing
      return "10-15 minutes";
    } else if (["Pending", "Accepted"].includes(status)) {
      // 20-30 minutes when confirmed
      return "20-30 minutes";
    } else {
      return "20-30 minutes";
    }
  };

  // Group items by shop
  const groupByShop = () => {
    if (!order?.items) return {};

    return order.items.reduce((acc, item) => {
      const shopName =
        item.shop || item.shopName || order.shopName || "Unknown Shop";
      if (!acc[shopName]) {
        acc[shopName] = [];
      }
      acc[shopName].push(item);
      return acc;
    }, {});
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface">
        <AppHeader role="user" />
        <PageLoader label="Loading order details…" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-surface">
        <AppHeader role="user" />
        <Page className="max-w-3xl">
          <EmptyState
            icon={Package}
            title="We couldn't find that order"
            text="It may belong to another account, or the link is incomplete."
            action={
              <button onClick={() => router.push("/user/dashboard")} className="btn btn-primary">
                See my orders
              </button>
            }
          />
        </Page>
      </div>
    );
  }

  const steps = getOrderSteps();
  const groupedItems = groupByShop();
  const rejected = ["Rejected", "Cancelled"].includes(order.status);
  const delivered = order.status === "Delivered";
  const progress = ((steps.filter((s) => s.completed).length - 1) / (steps.length - 1)) * 100;

  // Orders saved in the database use different field names than the local copy
  const total = order.total ?? order.totalAmount ?? 0;
  const subtotal = order.subtotal ?? (order.items || []).reduce((n, i) => n + i.price * i.quantity, 0);
  const deliveryFee = order.deliveryFee ?? Math.max(0, total - subtotal);
  const addr = order.address
    ? {
        name: order.address.name,
        lines: [order.address.addressLine1, order.address.addressLine2].filter(Boolean),
        cityLine: `${order.address.city || ""} ${order.address.pincode || ""}`.trim(),
        phone: order.address.phone,
      }
    : order.deliveryAddress
    ? {
        name: order.userName,
        lines: [order.deliveryAddress.street].filter(Boolean),
        cityLine: `${order.deliveryAddress.city || ""} ${order.deliveryAddress.zipCode || ""}`.trim(),
        phone: order.deliveryAddress.phone,
      }
    : null;
  const placed = (() => {
    const dt = order.placedAt || order.createdAt || order.date;
    const d = dt ? new Date(dt) : null;
    if (!d || isNaN(d.getTime())) return "";
    return `${d.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}, ${d.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  })();
  const fmtTime = (v) =>
    v ? new Date(v).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : null;
  const timeline = [
    ["Order placed", order.placedAt || order.createdAt || order.date],
    ["Accepted by shop", order.acceptedAt],
    ["Preparing", order.preparingAt],
    ["Ready for pickup", order.readyAt],
    ["Picked up", order.pickedUpAt],
    ["Delivered", order.deliveredAt],
  ].filter(([, t]) => t);

  return (
    <div className="min-h-screen bg-surface">
      <AppHeader role="user" />
      <Page>
        <PageTitle
          back="/user/dashboard"
          title="Track order"
          subtitle={
            <>
              <span className="font-mono">#{order.orderId}</span>
              {placed && <> · Placed {placed}</>}
            </>
          }
          actions={<StatusBadge status={order.status} />}
        />

        {/* Status banner + progress */}
        <section className="card overflow-hidden">
          <div
            className={`flex flex-wrap items-center justify-between gap-4 px-5 py-5 sm:px-6 ${
              rejected ? "bg-red-50" : delivered ? "bg-green-50" : "bg-gradient-to-r from-brand-50 to-accent-50"
            }`}
          >
            <div>
              <p className="text-sm font-medium text-muted">
                {rejected ? "Order status" : delivered ? "Delivered" : "Estimated arrival"}
              </p>
              <p className={`mt-0.5 text-2xl font-bold tracking-tight ${rejected ? "text-red-700" : "text-ink"}`}>
                {rejected ? `This order was ${order.status.toLowerCase()}` : getEstimatedDelivery()}
              </p>
            </div>
            {order.deliveryPartnerName && !rejected && (
              <div className="flex items-center gap-3 rounded-2xl bg-white/80 px-4 py-2.5 ring-1 ring-black/5">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-600 text-white">
                  <Truck size={18} />
                </span>
                <div>
                  <p className="text-xs text-muted">Your delivery partner</p>
                  <p className="text-sm font-semibold text-ink">{order.deliveryPartnerName}</p>
                </div>
              </div>
            )}
          </div>

          {!rejected && (
            <div className="px-5 py-6 sm:px-8">
              <div className="relative">
                <div className="absolute left-5 right-5 top-5 h-1 rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand-500 to-accent-500 transition-all duration-700"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <ol className="relative flex justify-between">
                  {steps.map((step, index) => {
                    const Icon = step.icon;
                    return (
                      <li key={index} className="flex w-20 flex-col items-center text-center sm:w-28">
                        <span
                          className={`grid h-10 w-10 place-items-center rounded-full ring-4 ring-white transition ${
                            step.completed ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-400"
                          } ${step.active && !delivered ? "animate-pulse" : ""}`}
                        >
                          <Icon size={18} />
                        </span>
                        <span
                          className={`mt-2.5 text-xs font-semibold sm:text-sm ${
                            step.active ? "text-brand-700" : step.completed ? "text-ink" : "text-muted"
                          }`}
                        >
                          {step.label}
                        </span>
                      </li>
                    );
                  })}
                </ol>
              </div>
            </div>
          )}
        </section>

        <div className="mt-5 grid items-start gap-5 lg:grid-cols-[1fr_340px]">
          {/* Items */}
          <div className="space-y-5">
            {Object.entries(groupedItems).map(([shopName, items]) => (
              <section key={shopName} className="card p-5 sm:p-6">
                <div className="mb-4 flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-50 text-brand-600">
                    <Store size={18} />
                  </span>
                  <div>
                    <h3 className="font-semibold text-ink">{shopName}</h3>
                    <p className="text-xs text-muted">
                      {items.length} item{items.length === 1 ? "" : "s"}
                    </p>
                  </div>
                </div>
                <ul className="divide-y divide-line">
                  {items.map((item, index) => (
                    <li key={index} className="flex items-center gap-4 py-3">
                      <span className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-xl bg-surface">
                        {item.image ? (
                          <img src={item.image} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <Package size={22} className="text-slate-400" />
                        )}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-ink">{item.name}</p>
                        <p className="text-xs text-muted">
                          {item.quantity} × {formatINR(item.price)}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-ink">{formatINR(item.price * item.quantity)}</p>
                    </li>
                  ))}
                </ul>
              </section>
            ))}

            <section className="card p-5 sm:p-6">
              <h3 className="font-semibold text-ink">Payment summary</h3>
              <dl className="mt-4 space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted">Subtotal</dt>
                  <dd className="text-ink">{formatINR(subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted">Delivery fee</dt>
                  <dd className="text-ink">{formatINR(deliveryFee)}</dd>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-green-700">
                    <dt>Discount {order.appliedCoupon && `(${order.appliedCoupon})`}</dt>
                    <dd>−{formatINR(order.discount)}</dd>
                  </div>
                )}
                <div className="flex items-baseline justify-between border-t border-line pt-3">
                  <dt className="font-semibold text-ink">Total</dt>
                  <dd className="text-xl font-bold text-ink">{formatINR(total)}</dd>
                </div>
              </dl>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="space-y-5 lg:sticky lg:top-24">
            <section className="card p-5">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-ink">
                <MapPin size={16} className="text-muted" /> Delivery address
              </h3>
              {addr ? (
                <div className="mt-3 space-y-0.5 text-sm text-ink-soft">
                  {addr.name && <p className="font-semibold text-ink">{addr.name}</p>}
                  {addr.lines.map((l) => (
                    <p key={l}>{l}</p>
                  ))}
                  {addr.cityLine && <p>{addr.cityLine}</p>}
                  {addr.phone && (
                    <p className="flex items-center gap-1.5 pt-2 text-muted">
                      <Phone size={14} /> {addr.phone}
                    </p>
                  )}
                </div>
              ) : (
                <p className="mt-3 text-sm text-muted">No address saved for this order.</p>
              )}
            </section>

            <section className="card p-5">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-ink">
                <CreditCard size={16} className="text-muted" /> Payment
              </h3>
              <p className="mt-3 text-sm font-medium text-ink">{order.paymentMethod || "Not specified"}</p>
            </section>

            {timeline.length > 0 && (
              <section className="card p-5">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-ink">
                  <Clock size={16} className="text-muted" /> Activity
                </h3>
                <ol className="mt-4 space-y-4">
                  {timeline.map(([label, t], i) => (
                    <li key={label} className="relative flex gap-3 pl-0.5">
                      <span
                        className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                          i === timeline.length - 1 ? "bg-brand-600 ring-4 ring-brand-100" : "bg-slate-300"
                        }`}
                      />
                      <div className="flex flex-1 justify-between gap-2 text-sm">
                        <span className={i === timeline.length - 1 ? "font-semibold text-ink" : "text-ink-soft"}>
                          {label}
                        </span>
                        <span className="tabular-nums text-muted">{fmtTime(t)}</span>
                      </div>
                    </li>
                  ))}
                </ol>
              </section>
            )}
          </aside>
        </div>
      </Page>
    </div>
  );
}
