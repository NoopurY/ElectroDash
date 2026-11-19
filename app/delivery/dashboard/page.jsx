"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Truck,
  MapPin,
  Package,
  CheckCircle,
  Phone,
  Store,
  Navigation,
  Power,
  RefreshCw,
  Wallet,
} from "lucide-react";
import {
  AppHeader,
  EmptyState,
  Page,
  PageLoader,
  SectionTitle,
  Spinner,
  StatCard,
  formatINR,
} from "@/components/ui";

export default function DeliveryDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAvailable, setIsAvailable] = useState(true);
  const [notice, setNotice] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const flash = (msg) => {
    setNotice(msg);
    setTimeout(() => setNotice(""), 2500);
  };
  const [stats, setStats] = useState({
    pending: 0,
    completed: 0,
    earnings: 0,
  });

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      router.push("/login");
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== "delivery") {
      router.push("/login");
      return;
    }

    setUser(parsedUser);
    setIsAvailable(parsedUser.isAvailable !== false);
    fetchOrders(parsedUser._id || parsedUser.id);

    // Auto-refresh orders every 15 seconds
    const refreshInterval = setInterval(() => {
      fetchOrders(parsedUser._id || parsedUser.id);
    }, 15000);

    return () => clearInterval(refreshInterval);
  }, [router]);

  const fetchOrders = async (deliveryPartnerId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `/api/orders/delivery-partner?partnerId=${deliveryPartnerId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);

        // Calculate stats
        const pending = data.orders.filter((o) =>
          ["Assigned", "Picked Up", "On the Way"].includes(o.status)
        ).length;
        const completed = data.orders.filter(
          (o) => o.status === "Delivered"
        ).length;
        const earnings = data.orders
          .filter((o) => o.status === "Delivered")
          .reduce((sum, o) => sum + o.totalAmount * 0.1, 0); // 10% commission

        setStats({ pending, completed, earnings });
      } else {
        console.error("Failed to fetch orders");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAvailability = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/delivery-partners/availability", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          isAvailable: !isAvailable,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setIsAvailable(data.isAvailable);

        // Update localStorage
        const userData = JSON.parse(localStorage.getItem("user"));
        userData.isAvailable = data.isAvailable;
        localStorage.setItem("user", JSON.stringify(userData));
        flash(data.isAvailable ? "You are online" : "You are offline");
      } else {
        flash("Could not update your availability");
      }
    } catch (error) {
      console.error("Error updating availability:", error);
      flash("Network error. Please try again.");
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        // Refresh orders
        fetchOrders(user._id || user.id);
        flash(`Marked as ${newStatus}`);
      } else {
        flash("Could not update this order");
      }
    } catch (error) {
      console.error("Error updating order:", error);
      flash("Network error. Please try again.");
    } finally {
      setUpdatingId(null);
    }
  };

  const ACTIVE = ["Assigned", "Picked Up", "On the Way"];
  const STEPS = ["Assigned", "Picked Up", "On the Way", "Delivered"];
  const NEXT = {
    Assigned: { status: "Picked Up", label: "I've picked it up", icon: Package, cls: "btn-primary" },
    "Picked Up": { status: "On the Way", label: "Start delivery", icon: Navigation, cls: "btn-primary" },
    "On the Way": { status: "Delivered", label: "Mark delivered", icon: CheckCircle, cls: "btn-success" },
  };
  const activeOrders = orders.filter((o) => ACTIVE.includes(o.status));
  const doneOrders = orders.filter((o) => o.status === "Delivered");
  const addressLine = (a) => [a?.street, a?.city, a?.zipCode].filter(Boolean).join(", ");

  if (loading) {
    return (
      <div className="min-h-screen bg-surface">
        <AppHeader role="delivery" />
        <PageLoader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      <AppHeader role="delivery" />
      <Page className="max-w-4xl">
        {notice && (
          <div className="fixed inset-x-0 top-20 z-50 flex justify-center px-4">
            <div className="animate-fade-up rounded-xl bg-ink px-4 py-2.5 text-sm font-medium text-white shadow-pop" role="status">
              {notice}
            </div>
          </div>
        )}

        {/* Availability */}
        <section
          className={`card flex flex-wrap items-center gap-4 p-5 transition ${
            isAvailable ? "border-green-200 bg-gradient-to-r from-green-50 to-white" : ""
          }`}
        >
          <span
            className={`relative grid h-12 w-12 place-items-center rounded-full ${
              isAvailable ? "bg-green-600 text-white" : "bg-slate-200 text-slate-500"
            }`}
          >
            <Power size={22} />
            {isAvailable && <span className="absolute inset-0 animate-ping rounded-full bg-green-500/30" />}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-lg font-bold text-ink">{isAvailable ? "You're online" : "You're offline"}</p>
            <p className="text-sm text-muted">
              {isAvailable ? "Shops can assign deliveries to you." : "Go online to start receiving deliveries."}
            </p>
          </div>
          <button
            role="switch"
            aria-checked={isAvailable}
            onClick={toggleAvailability}
            className={`relative h-8 w-14 shrink-0 rounded-full transition ${isAvailable ? "bg-green-600" : "bg-slate-300"}`}
            aria-label="Toggle availability"
          >
            <span
              className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-all ${isAvailable ? "left-7" : "left-1"}`}
            />
          </button>
        </section>

        <div className="mt-4 grid grid-cols-3 gap-3">
          <StatCard label="Active" value={stats.pending} icon={Truck} />
          <StatCard label="Completed" value={stats.completed} icon={CheckCircle} tone="green" />
          <StatCard label="Earnings" value={formatINR(stats.earnings)} icon={Wallet} tone="accent" />
        </div>

        {/* Active deliveries */}
        <section className="mt-8">
          <SectionTitle
            action={
              <button onClick={() => fetchOrders(user._id || user.id)} className="btn btn-ghost btn-sm">
                <RefreshCw size={14} /> Refresh
              </button>
            }
          >
            Active deliveries
          </SectionTitle>

          {activeOrders.length === 0 ? (
            <EmptyState
              icon={Truck}
              title="No active deliveries"
              text={
                isAvailable
                  ? "Stay online. New deliveries appear here automatically."
                  : "You're offline. Go online to get deliveries."
              }
            />
          ) : (
            <div className="space-y-4">
              {activeOrders.map((order) => {
                const next = NEXT[order.status];
                const stepIdx = STEPS.indexOf(order.status);
                const busy = updatingId === order._id;
                return (
                  <article key={order._id} className="card overflow-hidden">
                    {/* Progress */}
                    <div className="flex gap-1 bg-surface px-5 pt-4">
                      {STEPS.map((s, i) => (
                        <div key={s} className="flex-1">
                          <div className={`h-1.5 rounded-full ${i <= stepIdx ? "bg-brand-600" : "bg-slate-200"}`} />
                          <p className={`mt-1.5 text-[11px] font-medium ${i <= stepIdx ? "text-ink" : "text-muted"}`}>{s}</p>
                        </div>
                      ))}
                    </div>

                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <p className="font-mono text-sm font-semibold text-ink">#{order.orderId}</p>
                        <p className="text-right">
                          <span className="block text-xs text-muted">You earn</span>
                          <span className="font-bold text-green-700">{formatINR(order.totalAmount * 0.1)}</span>
                        </p>
                      </div>

                      {/* Route */}
                      <ol className="relative mt-4 space-y-4 pl-8">
                        <span aria-hidden className="absolute bottom-3 left-[11px] top-3 w-px border-l-2 border-dashed border-slate-200" />
                        <li className="relative">
                          <span className="absolute -left-8 grid h-6 w-6 place-items-center rounded-full bg-brand-50 text-brand-600 ring-4 ring-white">
                            <Store size={13} />
                          </span>
                          <p className="text-xs font-medium uppercase tracking-wider text-muted">Pick up</p>
                          <p className="font-semibold text-ink">{order.shopName}</p>
                        </li>
                        <li className="relative">
                          <span className="absolute -left-8 grid h-6 w-6 place-items-center rounded-full bg-accent-50 text-accent-700 ring-4 ring-white">
                            <MapPin size={13} />
                          </span>
                          <p className="text-xs font-medium uppercase tracking-wider text-muted">Drop off</p>
                          <p className="font-semibold text-ink">{order.userName}</p>
                          <p className="text-sm text-ink-soft">{addressLine(order.deliveryAddress)}</p>
                        </li>
                      </ol>

                      <ul className="mt-4 flex flex-wrap gap-1.5">
                        {(order.items || []).map((item, idx) => (
                          <li key={idx} className="badge h-7 bg-surface px-2.5 font-medium text-ink-soft ring-1 ring-inset ring-line">
                            {item.quantity}× {item.name}
                          </li>
                        ))}
                      </ul>

                      {order.customerNotes && (
                        <p className="mt-3 rounded-xl bg-amber-50 px-3.5 py-2.5 text-sm text-amber-900">
                          <span className="font-semibold">Note:</span> {order.customerNotes}
                        </p>
                      )}

                      <div className="mt-5 grid grid-cols-2 gap-2">
                        {order.deliveryAddress?.phone ? (
                          <a href={`tel:${order.deliveryAddress.phone}`} className="btn btn-secondary">
                            <Phone size={16} /> Call
                          </a>
                        ) : (
                          <span className="btn btn-secondary pointer-events-none opacity-50">
                            <Phone size={16} /> No phone
                          </span>
                        )}
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressLine(order.deliveryAddress))}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-secondary"
                        >
                          <Navigation size={16} /> Navigate
                        </a>
                      </div>
                      {next && (
                        <button
                          onClick={() => updateOrderStatus(order._id, next.status)}
                          disabled={busy}
                          className={`btn btn-lg mt-2 w-full ${next.cls}`}
                        >
                          {busy ? <Spinner size={16} /> : <next.icon size={18} />} {next.label}
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* Completed */}
        {doneOrders.length > 0 && (
          <section className="mt-8">
            <SectionTitle>Completed</SectionTitle>
            <ul className="card divide-y divide-line">
              {doneOrders.map((order) => (
                <li key={order._id} className="flex items-center gap-4 px-5 py-3.5">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-green-50 text-green-600">
                    <CheckCircle size={18} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink">
                      {order.shopName} → {order.userName}
                    </p>
                    <p className="text-xs text-muted">
                      <span className="font-mono">#{order.orderId}</span>
                      {order.deliveredAt && <> · {new Date(order.deliveredAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</>}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-green-700">+{formatINR(order.totalAmount * 0.1)}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </Page>
    </div>
  );
}
