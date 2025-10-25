"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle,
  Download,
  Home,
  Package,
  Store,
  Calendar,
  CreditCard,
  MapPin,
  Phone,
} from "lucide-react";

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
      const orderId = generateOrderId();
      
      // Create order with ID and status
      const orderWithId = {
        ...order,
        orderId: orderId,
        date: new Date().toISOString(),
        status: "Processing"
      };
      
      setOrderData(orderWithId);
      
      // Save order to database and localStorage (only save once using ref)
      if (!orderSavedRef.current) {
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
  const getOrderDateTime = () => {
    const now = new Date();
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

    const orderId = generateOrderId();
    const { date, time } = getOrderDateTime();
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
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5A8DEE] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const orderId = generateOrderId();
  const { date, time } = getOrderDateTime();
  const groupedCart = groupByShop();

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center font-sans pb-10">
      {/* Success Animation */}
      <div className="w-full bg-gradient-to-r from-[#5A8DEE] to-[#40E0D0] text-white px-5 py-12 rounded-b-3xl shadow-md text-center">
        <div className="animate-bounce mb-4">
          <CheckCircle size={80} className="mx-auto" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Order Placed Successfully!</h1>
        <p className="text-lg opacity-90">
          Thank you for your purchase. Your order is confirmed.
        </p>
      </div>

      {/* Receipt Container */}
      <div className="w-full max-w-3xl px-5 mt-8">
        <div ref={receiptRef} className="bg-white rounded-2xl shadow-lg p-8">
          {/* Order Header */}
          <div className="border-b-2 border-gray-200 pb-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Order Receipt</h2>
              <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full font-semibold text-sm">
                CONFIRMED
              </div>
            </div>

            {/* Order Details Grid */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="flex items-start gap-3">
                <Package size={20} className="text-[#5A8DEE] mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Order ID</p>
                  <p className="font-semibold text-gray-800">{orderId}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar size={20} className="text-[#5A8DEE] mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Date & Time</p>
                  <p className="font-semibold text-gray-800">
                    {date}, {time}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CreditCard size={20} className="text-[#5A8DEE] mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Payment Method</p>
                  <p className="font-semibold text-gray-800 capitalize">
                    {orderData.paymentMethod}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin size={20} className="text-[#5A8DEE] mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Delivery Address</p>
                  <p className="font-semibold text-gray-800 text-sm">
                    {orderData.address?.name}
                  </p>
                  <p className="text-sm text-gray-700">
                    {orderData.address?.addressLine1}
                    {orderData.address?.addressLine2 && `, ${orderData.address.addressLine2}`}
                  </p>
                  <p className="text-sm text-gray-700">
                    {orderData.address?.city} - {orderData.address?.pincode}
                  </p>
                  <p className="text-sm text-gray-700">
                    Ph: {orderData.address?.phone}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Order Items</h3>
            {Object.entries(groupedCart).map(([shopName, items]) => (
              <div
                key={shopName}
                className="mb-6 last:mb-0 border border-gray-200 rounded-xl p-4"
              >
                {/* Shop Name */}
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
                  <Store size={18} className="text-gray-500" />
                  <span className="font-semibold text-gray-700">{shopName}</span>
                </div>

                {/* Items */}
                <div className="space-y-3">
                  {items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between py-2"
                    >
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800 text-sm">
                          {item.name}
                        </p>
                        <p className="text-xs text-gray-600">{item.specs}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Qty: {item.quantity} × ₹{item.price}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-[#5A8DEE]">
                          ₹{item.price * item.quantity}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Price Summary */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Payment Summary
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-gray-700">
                <span>Subtotal</span>
                <span>₹{orderData.subtotal}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Delivery Fee</span>
                <span>₹{orderData.deliveryFee}</span>
              </div>
              {orderData.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-₹{orderData.discount}</span>
                </div>
              )}
              <hr />
              <div className="flex justify-between text-xl font-bold text-gray-800">
                <span>Total Paid</span>
                <span className="text-[#5A8DEE]">₹{orderData.total}</span>
              </div>
            </div>
          </div>

          {/* Thank You Message */}
          <div className="text-center mt-8 p-4 bg-blue-50 rounded-xl">
            <p className="text-gray-700 font-semibold">
              Thank you for shopping with ElectroDash! ⚡
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Your order will be delivered within 20-30 minutes
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <button
            onClick={handleDownloadReceipt}
            className="flex-1 bg-[#5A8DEE] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#4A7DDE] transition flex items-center justify-center gap-2"
          >
            <Download size={24} />
            Download Receipt
          </button>
          <button
            onClick={handleGoHome}
            className="flex-1 bg-gradient-to-r from-[#5A8DEE] to-[#40E0D0] text-white py-4 rounded-xl font-bold text-lg hover:shadow-xl transition flex items-center justify-center gap-2"
          >
            <Home size={24} />
            Go to Home
          </button>
        </div>
      </div>
    </div>
  );
}
