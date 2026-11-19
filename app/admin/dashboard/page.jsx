"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Package, CheckCircle, Clock, XCircle, Truck, User, TrendingUp, Search, RefreshCw, MapPin } from "lucide-react";
import {
  AppHeader,
  EmptyState,
  Page,
  PageLoader,
  PageTitle,
  StatCard,
  StatusBadge,
  formatINR,
} from "@/components/ui";

export default function VendorDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("Pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (!token || !userData) {
      router.push("/login");
      return;
    }
    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== "admin") {
      router.push("/login");
      return;
    }
    setUser(parsedUser);
    fetchOrders(parsedUser);
  }, [router]);

  const fetchOrders = async (userData) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/orders/vendor?vendorId=${userData._id || userData.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      } else {
        const errorData = await response.json();
        console.error("Failed to fetch orders:", response.status, errorData);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchOrders(user);
    setRefreshing(false);
  };

  const handleAcceptOrder = async (orderId) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/accept`, {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}`, "Content-Type": "application/json" },
      });
      if (response.ok) fetchOrders(user);
    } catch (error) {
      console.error("Error accepting order:", error);
    }
  };

  const handleRejectOrder = async (orderId) => {
    if (!confirm("Are you sure you want to reject this order?")) return;
    try {
      const response = await fetch(`/api/orders/${orderId}/reject`, {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}`, "Content-Type": "application/json" },
      });
      if (response.ok) fetchOrders(user);
    } catch (error) {
      console.error("Error rejecting order:", error);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}`, "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (response.ok) fetchOrders(user);
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleAssignDelivery = (orderId) => {
    router.push(`/admin/assign-delivery/${orderId}`);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const getStatusColor = (status) => {
    const colors = {
      Pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
      Accepted: "bg-blue-100 text-blue-800 border-blue-300",
      Rejected: "bg-red-100 text-red-800 border-red-300",
      Preparing: "bg-purple-100 text-purple-800 border-purple-300",
      Ready: "bg-green-100 text-green-800 border-green-300",
      Assigned: "bg-cyan-100 text-cyan-800 border-cyan-300",
      "Picked Up": "bg-indigo-100 text-indigo-800 border-indigo-300",
      "On the Way": "bg-orange-100 text-orange-800 border-orange-300",
      Delivered: "bg-emerald-100 text-emerald-800 border-emerald-300",
      Cancelled: "bg-gray-100 text-gray-800 border-gray-300",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getFilteredOrders = () => {
    return orders.filter((order) => {
      const matchesFilter = filter === "All" || order.status === filter;
      const matchesSearch = searchTerm === "" || order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) || order.userName?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  };

  const stats = {
    pending: orders.filter((o) => o.status === "Pending").length,
    active: orders.filter((o) => ["Accepted", "Preparing", "Ready", "Assigned", "Picked Up", "On the Way"].includes(o.status)).length,
    completed: orders.filter((o) => o.status === "Delivered").length,
    totalRevenue: orders.filter((o) => o.status === "Delivered").reduce((sum, o) => sum + o.totalAmount, 0),
  };

  const OUT_FOR_DELIVERY = ["Assigned", "Picked Up", "On the Way"];
  const FILTERS = [
    ["Pending", "New"],
    ["Accepted", "Accepted"],
    ["Preparing", "Preparing"],
    ["Ready", "Ready"],
    ["Out", "Out for delivery"],
    ["Delivered", "Delivered"],
    ["All", "All"],
  ];
  const countFor = (key) =>
    key === "All"
      ? orders.length
      : key === "Out"
      ? orders.filter((o) => OUT_FOR_DELIVERY.includes(o.status)).length
      : orders.filter((o) => o.status === key).length;

  const visible = orders.filter((order) => {
    const matchesFilter =
      filter === "All" || (filter === "Out" ? OUT_FOR_DELIVERY.includes(order.status) : order.status === filter);
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      q === "" || order.orderId.toLowerCase().includes(q) || order.userName?.toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  const timeAgo = (d) => {
    if (!d) return "";
    const mins = Math.round((Date.now() - new Date(d).getTime()) / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins} min ago`;
    const h = Math.round(mins / 60);
    if (h < 24) return `${h} h ago`;
    return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-surface">
        <AppHeader role="admin" />
        <PageLoader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      <AppHeader role="admin" onLogout={handleLogout} />
      <Page>
        <PageTitle
          title={user.shopName || "Your shop"}
          subtitle="Accept new orders, prepare them, and hand them to a delivery partner."
          actions={
            <button onClick={handleRefresh} className="btn btn-secondary" disabled={refreshing}>
              <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} /> Refresh
            </button>
          }
        />

        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <StatCard label="New orders" value={stats.pending} icon={Clock} tone="amber" hint={stats.pending ? "Waiting for you" : "All caught up"} />
          <StatCard label="In progress" value={stats.active} icon={Package} />
          <StatCard label="Delivered" value={stats.completed} icon={CheckCircle} tone="green" />
          <StatCard label="Revenue" value={formatINR(stats.totalRevenue)} icon={TrendingUp} tone="violet" hint="From delivered orders" />
        </div>

        <div className="mt-8 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="scrollbar-none -mx-4 flex gap-1.5 overflow-x-auto px-4 lg:mx-0 lg:px-0">
            {FILTERS.map(([key, label]) => {
              const n = countFor(key);
              const active = filter === key;
              return (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`inline-flex h-9 shrink-0 items-center gap-2 rounded-full border px-3.5 text-sm font-medium transition ${
                    active ? "border-ink bg-ink text-white" : "border-line bg-white text-ink-soft hover:border-slate-300"
                  }`}
                >
                  {label}
                  <span
                    className={`rounded-full px-1.5 text-xs font-semibold tabular-nums ${
                      active ? "bg-white/20" : key === "Pending" && n > 0 ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-muted"
                    }`}
                  >
                    {n}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="relative lg:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={17} />
            <input
              type="search"
              placeholder="Search order ID or customer"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input h-10 pl-9 text-sm"
            />
          </div>
        </div>

        <div className="mt-5">
          {loading ? (
            <PageLoader label="Loading orders…" />
          ) : visible.length === 0 ? (
            <EmptyState
              icon={filter === "Pending" ? CheckCircle : Package}
              title={filter === "Pending" ? "No new orders right now" : "No orders here"}
              text={
                filter === "Pending"
                  ? "New orders from customers will show up here. Use Refresh to check again."
                  : "Try a different filter or search."
              }
            />
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {visible.map((order) => (
                <article key={order._id} className="card flex flex-col p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-mono text-sm font-semibold text-ink">#{order.orderId}</p>
                      <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted">
                        <User size={14} /> {order.userName || order.userEmail}
                        <span aria-hidden>·</span>
                        {timeAgo(order.placedAt || order.createdAt)}
                      </p>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>

                  <ul className="mt-4 space-y-1.5 rounded-xl bg-surface px-3.5 py-3 text-sm">
                    {(order.items || []).map((item, i) => (
                      <li key={i} className="flex justify-between gap-3">
                        <span className="truncate text-ink-soft">
                          <span className="font-semibold text-ink">{item.quantity}×</span> {item.name}
                        </span>
                        <span className="shrink-0 tabular-nums text-muted">{formatINR(item.price * item.quantity)}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
                    {order.deliveryAddress?.city && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin size={13} /> {order.deliveryAddress.street?.split(",").slice(-1)[0]?.trim() || order.deliveryAddress.city}
                      </span>
                    )}
                    <span>{order.paymentMethod}</span>
                    {order.deliveryPartnerName && (
                      <span className="inline-flex items-center gap-1 font-medium text-indigo-700">
                        <Truck size={13} /> {order.deliveryPartnerName}
                      </span>
                    )}
                  </div>

                  <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4 mt-4">
                    <p className="text-lg font-bold text-ink">{formatINR(order.totalAmount)}</p>
                    <div className="flex flex-wrap gap-2">
                      {order.status === "Pending" && (
                        <>
                          <button onClick={() => handleRejectOrder(order._id)} className="btn btn-danger btn-sm">
                            <XCircle size={15} /> Reject
                          </button>
                          <button onClick={() => handleAcceptOrder(order._id)} className="btn btn-success btn-sm">
                            <CheckCircle size={15} /> Accept
                          </button>
                        </>
                      )}
                      {order.status === "Accepted" && (
                        <button onClick={() => handleUpdateStatus(order._id, "Preparing")} className="btn btn-primary btn-sm">
                          <Package size={15} /> Start preparing
                        </button>
                      )}
                      {order.status === "Preparing" && (
                        <button onClick={() => handleUpdateStatus(order._id, "Ready")} className="btn btn-primary btn-sm">
                          <CheckCircle size={15} /> Mark ready
                        </button>
                      )}
                      {order.status === "Ready" && !order.deliveryPartnerId && (
                        <button onClick={() => handleAssignDelivery(order._id)} className="btn btn-accent btn-sm">
                          <Truck size={15} /> Assign delivery
                        </button>
                      )}
                      {OUT_FOR_DELIVERY.includes(order.status) && (
                        <span className="text-xs font-medium text-muted">With delivery partner</span>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </Page>
    </div>
  );
}
