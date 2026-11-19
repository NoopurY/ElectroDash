"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle,
  Download,
  Home,
  Store,
  Calendar,
  CreditCard,
  MapPin,
  Truck,
} from "lucide-react";
import { AppHeader, Page, PageLoader, formatINR } from "@/components/ui";

export default function OrderSuccessPage() {
  const router = useRouter();
  const [orderData, setOrderData] = useState(null);
  const receiptRef = useRef(null);
  const orderSavedRef = useRef(false); // Track if order was already saved

  // Generate order ID
  const generateOrderId = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `ORD${timestamp}${random}`;
  };

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (!token || !userData) {
      router.push("/login");
      return;
    }

    const user = JSON.parse(userData);

    // Get order data from sessionStorage
    const savedOrderData = sessionStorage.getItem("lastOrder");
    if (savedOrderData) {
      const order = JSON.parse(savedOrderData);

      // If this order already got an ID (page was refreshed), reuse it and don't save it again
      const alreadySaved = Boolean(order.orderId);
      const orderWithId = alreadySaved
        ? order
        : {
            ...order,
            orderId: generateOrderId(),
            date: new Date().toISOString(),
            status: "Processing",
          };
      sessionStorage.setItem("lastOrder", JSON.stringify(orderWithId));

      setOrderData(orderWithId);

      // Save order to database and localStorage (only save once using ref)
      if (!alreadySaved && !orderSavedRef.current) {
        // Save to database
        saveOrderToDatabase(orderWithId, user, token);
        
        // Save to localStorage for order history
        const orderHistory = JSON.parse(localStorage.getItem("orderHistory") || "[]");
        orderHistory.unshift(orderWithId); // Add to beginning of array
        localStorage.setItem("orderHistory", JSON.stringify(orderHistory));
        orderSavedRef.current = true; // Mark as saved
      }
    } else {
      // Redirect to home if no order data
      router.push("/user");
    }
  }, [router]);

  // Save order to database
  const saveOrderToDatabase = async (order, user, token) => {
    try {
      const response = await fetch("/api/orders/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          orderId: order.orderId,
          userId: user._id || user.id,
          userEmail: user.email,
          userName: user.name,
          items: order.items,
          totalAmount: order.total,
          deliveryAddress: {
            street: `${order.address.addressLine1}, ${order.address.addressLine2 || ''}`.trim(),
            city: order.address.city,
            state: "India", // Default state
            zipCode: order.address.pincode,
            phone: order.address.phone,
          },
          paymentMethod: order.paymentMethod,
          customerNotes: "",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to save order to database:", errorData);
      } else {
        const data = await response.json();
        console.log("Order saved to database successfully:", data);
      }
    } catch (error) {
      console.error("Error saving order to database:", error);
    }
  };

  // Get current date and time
  const getOrderDateTime = (when) => {
    const now = when ? new Date(when) : new Date();
    return {
      date: now.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      time: now.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  // Group items by shop
  const groupByShop = () => {
    if (!orderData?.items) return {};
    const grouped = {};
    orderData.items.forEach((item) => {
      const shopName = item.shopName || "Unknown Shop";
      if (!grouped[shopName]) {
        grouped[shopName] = [];
      }
      grouped[shopName].push(item);
    });
    return grouped;
  };

  // Download receipt as HTML
  const handleDownloadReceipt = () => {
    if (!orderData) return;

    const orderId = orderData.orderId;
    const { date, time } = getOrderDateTime(orderData.date);
    const groupedCart = groupByShop();

    const receiptHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Order Receipt - ${orderId}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 800px;
      margin: 40px auto;
      padding: 20px;
      color: #333;
    }
    .header {
      text-align: center;
      border-bottom: 3px solid #5A8DEE;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .header h1 {
      color: #5A8DEE;
      margin: 0;
      font-size: 32px;
    }
    .success-badge {
      display: inline-block;
      background: #10B981;
      color: white;
      padding: 8px 20px;
      border-radius: 20px;
      margin-top: 10px;
      font-weight: bold;
    }
    .order-info {
      background: #F3F4F6;
      padding: 20px;
      border-radius: 10px;
      margin-bottom: 30px;
    }
    .order-info-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
    }
    .label {
      font-weight: bold;
      color: #6B7280;
    }
    .shop-section {
      margin-bottom: 30px;
      border: 2px solid #E5E7EB;
      border-radius: 10px;
      padding: 15px;
    }
    .shop-name {
      font-size: 18px;
      font-weight: bold;
      color: #5A8DEE;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 1px solid #E5E7EB;
    }
    .item {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #F3F4F6;
    }
    .item:last-child {
      border-bottom: none;
    }
    .item-details {
      flex: 1;
    }
    .item-name {
      font-weight: bold;
      margin-bottom: 5px;
    }
    .item-specs {
      font-size: 12px;
      color: #6B7280;
    }
    .item-price {
      text-align: right;
      font-weight: bold;
      color: #5A8DEE;
    }
    .price-summary {
      background: #F9FAFB;
      padding: 20px;
      border-radius: 10px;
      margin-top: 30px;
    }
    .price-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
    }
    .price-row.total {
      border-top: 2px solid #E5E7EB;
      margin-top: 10px;
      padding-top: 15px;
      font-size: 20px;
      font-weight: bold;
      color: #5A8DEE;
    }
    .footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #E5E7EB;
      color: #6B7280;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>⚡ ElectroDash</h1>
    <div class="success-badge">✓ ORDER CONFIRMED</div>
  </div>

  <div class="order-info">
    <div class="order-info-row">
      <span class="label">Order ID:</span>
      <span>${orderId}</span>
    </div>
    <div class="order-info-row">
      <span class="label">Date:</span>
      <span>${date}</span>
    </div>
    <div class="order-info-row">
      <span class="label">Time:</span>
      <span>${time}</span>
    </div>
    <div class="order-info-row">
      <span class="label">Payment Method:</span>
      <span>${orderData.paymentMethod}</span>
    </div>
    <div class="order-info-row">
      <span class="label">Delivery Address:</span>
      <span>${orderData.address?.name}<br/>
      ${orderData.address?.addressLine1}${orderData.address?.addressLine2 ? ", " + orderData.address.addressLine2 : ""}<br/>
      ${orderData.address?.city} - ${orderData.address?.pincode}<br/>
      Ph: ${orderData.address?.phone}</span>
    </div>
  </div>

  <h2>Order Items</h2>
  ${Object.entries(groupedCart)
    .map(
      ([shopName, items]) => `
    <div class="shop-section">
      <div class="shop-name">🏪 ${shopName}</div>
      ${items
        .map(
          (item) => `
        <div class="item">
          <div class="item-details">
            <div class="item-name">${item.name}</div>
            <div class="item-specs">${item.specs}</div>
            <div class="item-specs">Quantity: ${item.quantity}</div>
          </div>
          <div class="item-price">₹${item.price * item.quantity}</div>
        </div>
      `
        )
        .join("")}
    </div>
  `
    )
    .join("")}

  <div class="price-summary">
    <div class="price-row">
      <span>Subtotal:</span>
      <span>₹${orderData.subtotal}</span>
    </div>
    <div class="price-row">
      <span>Delivery Fee:</span>
      <span>₹${orderData.deliveryFee}</span>
    </div>
    ${
      orderData.discount > 0
        ? `
    <div class="price-row" style="color: #10B981;">
      <span>Discount:</span>
      <span>-₹${orderData.discount}</span>
    </div>
    `
        : ""
    }
    <div class="price-row total">
      <span>Total Amount:</span>
      <span>₹${orderData.total}</span>
    </div>
  </div>

  <div class="footer">
    <p><strong>Thank you for shopping with ElectroDash!</strong></p>
    <p>For support, contact us at support@electrodash.com</p>
    <p>© ${new Date().getFullYear()} ElectroDash. All rights reserved.</p>
  </div>
</body>
</html>
    `;

    // Create blob and download
    const blob = new Blob([receiptHTML], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ElectroDash_Receipt_${orderId}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Handle go to home
  const handleGoHome = () => {
    sessionStorage.removeItem("lastOrder");
    router.push("/user");
  };

  if (!orderData) {
    return <PageLoader label="Confirming your order…" />;
  }

  const orderId = orderData.orderId;
  const { date, time } = getOrderDateTime(orderData.date);
  const groupedCart = groupByShop();
  const a = orderData.address || {};

  return (
    <div className="min-h-screen bg-surface">
      <AppHeader role="user" cartCount={0} />
      <Page className="max-w-3xl">
        {/* Success hero */}
        <section className="card relative overflow-hidden px-6 py-10 text-center">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(60% 70% at 50% 0%, rgb(207 250 240 / .8), transparent 70%)",
            }}
          />
          <div className="relative">
            <span className="mx-auto grid h-16 w-16 animate-fade-up place-items-center rounded-full bg-green-600 text-white shadow-[0_10px_30px_-8px_rgb(22_163_74/.6)]">
              <CheckCircle size={34} />
            </span>
            <h1 className="mt-5 text-2xl font-bold tracking-tight text-ink sm:text-3xl">Order placed!</h1>
            <p className="mt-2 text-muted">
              Thanks{a.name ? `, ${a.name.split(" ")[0]}` : ""}. Your parts are on their way in about 20–30 minutes.
            </p>
            <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-sm ring-1 ring-line">
              <span className="text-muted">Order ID</span>
              <span className="font-mono font-semibold text-ink">{orderId}</span>
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                onClick={() => {
                  sessionStorage.removeItem("lastOrder");
                  router.push(`/user/track-order?orderId=${encodeURIComponent(orderId)}`);
                }}
                className="btn btn-primary btn-lg"
              >
                <Truck size={18} /> Track order
              </button>
              <button onClick={handleDownloadReceipt} className="btn btn-secondary btn-lg">
                <Download size={18} /> Receipt
              </button>
            </div>
          </div>
        </section>

        {/* Details */}
        <section className="card mt-5 grid gap-5 p-5 sm:grid-cols-3 sm:p-6">
          <Detail icon={Calendar} label="Placed on" value={`${date}, ${time}`} />
          <Detail icon={CreditCard} label="Payment" value={orderData.paymentMethod} />
          <Detail
            icon={MapPin}
            label="Delivering to"
            value={
              <>
                {a.addressLine1}
                {a.addressLine2 ? `, ${a.addressLine2}` : ""}
                <br />
                {a.city} {a.pincode}
              </>
            }
          />
        </section>

        {/* Items */}
        <section className="card mt-5 p-5 sm:p-6">
          <h2 className="font-semibold text-ink">Items</h2>
          <div className="mt-4 space-y-5">
            {Object.entries(groupedCart).map(([shopName, items]) => (
              <div key={shopName}>
                <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted">
                  <Store size={14} /> {shopName}
                </p>
                <ul className="divide-y divide-line">
                  {items.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-4 py-3">
                      {item.image && (
                        <img src={item.image} alt="" className="h-12 w-12 rounded-xl bg-surface object-cover" />
                      )}
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
              </div>
            ))}
          </div>

          <dl className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Subtotal</dt>
              <dd className="text-ink">{formatINR(orderData.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Delivery fee</dt>
              <dd className="text-ink">{formatINR(orderData.deliveryFee)}</dd>
            </div>
            {orderData.discount > 0 && (
              <div className="flex justify-between text-green-700">
                <dt>Discount{orderData.appliedCoupon ? ` (${orderData.appliedCoupon})` : ""}</dt>
                <dd>−{formatINR(orderData.discount)}</dd>
              </div>
            )}
            <div className="flex items-baseline justify-between border-t border-line pt-3">
              <dt className="font-semibold text-ink">Total</dt>
              <dd className="text-xl font-bold text-ink">{formatINR(orderData.total)}</dd>
            </div>
          </dl>
        </section>

        <div className="mt-6 flex justify-center">
          <button onClick={handleGoHome} className="btn btn-ghost">
            <Home size={18} /> Back to shopping
          </button>
        </div>
      </Page>
    </div>
  );
}

function Detail({ icon: Icon, label, value }) {
  return (
    <div className="flex gap-3">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
        <Icon size={18} />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium text-muted">{label}</p>
        <p className="mt-0.5 text-sm font-semibold leading-snug text-ink">{value}</p>
      </div>
    </div>
  );
}
