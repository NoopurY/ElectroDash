"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Store, Package, CheckCircle, Clock, XCircle, Truck, User, LogOut, TrendingUp, AlertCircle, Search, RefreshCw } from "lucide-react";

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
    console.log("Fetching orders for vendor:", userData._id || userData.id);
    console.log("Vendor shop name:", userData.shopName);
    try {
      const response = await fetch(`/api/orders/vendor?vendorId=${userData._id || userData.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      console.log("Response status:", response.status);
      if (response.ok) {
        const data = await response.json();
        console.log("Fetched orders:", data.orders);
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

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="text-xl text-[#5A8DEE]">Loading...</div></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-[#5A8DEE] to-[#40E0D0] text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Store size={32} />
              <div>
                <h1 className="text-2xl font-bold">{user.shopName || "Vendor Dashboard"}</h1>
                <p className="text-sm text-white/80">Manage your orders</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={handleRefresh} className={`p-2 bg-white/20 hover:bg-white/30 rounded-lg transition ${refreshing ? 'animate-spin' : ''}`} title="Refresh"><RefreshCw size={20} /></button>
              <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition"><LogOut size={20} /><span className="hidden sm:inline">Logout</span></button>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-yellow-500">
            <div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Pending Orders</p><p className="text-3xl font-bold text-gray-800">{stats.pending}</p></div><Clock size={40} className="text-yellow-500" /></div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-500">
            <div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Active Orders</p><p className="text-3xl font-bold text-gray-800">{stats.active}</p></div><Package size={40} className="text-blue-500" /></div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-500">
            <div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Completed</p><p className="text-3xl font-bold text-gray-800">{stats.completed}</p></div><CheckCircle size={40} className="text-green-500" /></div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-purple-500">
            <div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Total Revenue</p><p className="text-3xl font-bold text-gray-800">₹{stats.totalRevenue}</p></div><TrendingUp size={40} className="text-purple-500" /></div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-md mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} /><input type="text" placeholder="Search by Order ID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#5A8DEE] focus:outline-none" /></div>
            <div className="flex gap-2 flex-wrap">{["All", "Pending", "Accepted", "Preparing", "Ready", "Delivered"].map((status) => (<button key={status} onClick={() => setFilter(status)} className={`px-4 py-2 rounded-lg font-medium transition ${filter === status ? 'bg-gradient-to-r from-[#5A8DEE] to-[#40E0D0] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>{status}</button>))}</div>
          </div>
        </div>
        {loading ? (<div className="text-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5A8DEE] mx-auto"></div><p className="mt-4 text-gray-600">Loading orders...</p></div>) : getFilteredOrders().length === 0 ? (<div className="bg-white p-12 rounded-xl shadow-md text-center"><AlertCircle size={48} className="mx-auto text-gray-400 mb-4" /><p className="text-xl text-gray-600">No orders found</p></div>) : (<div className="space-y-4">{getFilteredOrders().map((order) => (<div key={order._id} className="bg-white rounded-xl shadow-md p-6"><div className="flex justify-between mb-4"><div><h3 className="text-xl font-bold text-gray-800">Order #{order.orderId}</h3><p className="text-sm text-gray-600 flex items-center gap-1"><User size={14} />{order.userName || order.userEmail}</p></div><div className="text-right"><span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold border-2 ${getStatusColor(order.status)}`}>{order.status}</span><p className="text-2xl font-bold text-gray-800 mt-2">₹{order.totalAmount}</p></div></div><div className="flex gap-2">{order.status === "Pending" && (<><button onClick={() => handleAcceptOrder(order._id)} className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium"><CheckCircle size={18} />Accept</button><button onClick={() => handleRejectOrder(order._id)} className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium"><XCircle size={18} />Reject</button></>)}{order.status === "Accepted" && (<button onClick={() => handleUpdateStatus(order._id, "Preparing")} className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium"><Package size={18} />Mark Preparing</button>)}{order.status === "Preparing" && (<button onClick={() => handleUpdateStatus(order._id, "Ready")} className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium"><CheckCircle size={18} />Mark Ready</button>)}{order.status === "Ready" && !order.deliveryPartnerId && (<button onClick={() => handleAssignDelivery(order._id)} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#5A8DEE] to-[#40E0D0] text-white rounded-lg font-medium"><Truck size={18} />Assign Delivery</button>)}</div></div>))}</div>)}
      </main>
    </div>
  );
}
