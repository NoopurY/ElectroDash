"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  Store,
  Package,
} from "lucide-react";

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState([]);

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (!token || !userData) {
      router.push("/login");
      return;
    }

    // Load cart from localStorage
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, [router]);

  // Handle back navigation
  const handleBack = () => {
    router.back();
  };

  // Handle quantity increase
  const handleIncreaseQuantity = (itemId) => {
    const updatedCart = cart.map((item) =>
      item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item
    );
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  // Handle quantity decrease
  const handleDecreaseQuantity = (itemId) => {
    const updatedCart = cart
      .map((item) =>
        item.id === itemId
          ? { ...item, quantity: Math.max(0, item.quantity - 1) }
          : item
      )
      .filter((item) => item.quantity > 0);
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  // Handle remove item
  const handleRemoveItem = (itemId) => {
    const updatedCart = cart.filter((item) => item.id !== itemId);
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  // Calculate totals
  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  // Group items by shop
  const groupByShop = () => {
    const grouped = {};
    cart.forEach((item) => {
      const shopName = item.shopName || "Unknown Shop";
      if (!grouped[shopName]) {
        grouped[shopName] = [];
      }
      grouped[shopName].push(item);
    });
    return grouped;
  };

  const groupedCart = groupByShop();

  // Handle checkout
  const handleCheckout = () => {
    if (cart.length === 0) return;
    router.push("/user/checkout");
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center font-sans pb-10">
      {/* Header */}
      <header className="w-full bg-[#5A8DEE] text-white px-5 py-4 rounded-b-3xl shadow-md">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="hover:bg-white/20 rounded-full p-2 transition"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-semibold flex items-center gap-2">
              <ShoppingCart size={24} />
              My Cart
            </h1>
            <p className="text-sm opacity-90">
              {cart.length} {cart.length === 1 ? "item" : "items"} in cart
            </p>
          </div>
        </div>
      </header>

      {/* Cart Content */}
      <div className="w-full max-w-4xl px-5 mt-6">
        {cart.length === 0 ? (
          /* Empty Cart */
          <div className="bg-white rounded-2xl shadow-md p-12 text-center">
            <ShoppingCart
              size={64}
              className="mx-auto text-gray-300 mb-4"
            />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Your cart is empty
            </h2>
            <p className="text-gray-600 mb-6">
              Start adding components to your cart!
            </p>
            <button
              onClick={handleBack}
              className="bg-[#5A8DEE] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#4A7DDE] transition"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            {/* Cart Items Grouped by Shop */}
            <div className="space-y-6 mb-6">
              {Object.entries(groupedCart).map(([shopName, items]) => (
                <div
                  key={shopName}
                  className="bg-white rounded-2xl shadow-md overflow-hidden"
                >
                  {/* Shop Header */}
                  <div className="bg-[#5A8DEE] text-white px-5 py-3 flex items-center gap-2">
                    <Store size={20} />
                    <h2 className="font-semibold">{shopName}</h2>
                  </div>

                  {/* Items in this shop */}
                  <div className="divide-y divide-gray-200">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 flex items-center gap-4 hover:bg-gray-50 transition"
                      >
                        {/* Product Image */}
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-20 h-20 object-contain rounded-lg border border-gray-200"
                        />

                        {/* Product Details */}
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800 mb-1">
                            {item.name}
                          </h3>
                          <p className="text-xs text-gray-600 mb-2">
                            {item.specs}
                          </p>
                          <div className="flex items-center gap-2">
                            <Package size={14} className="text-gray-500" />
                            <span className="text-sm text-gray-600">
                              {item.category}
                            </span>
                          </div>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleDecreaseQuantity(item.id)}
                            className="bg-gray-200 hover:bg-gray-300 rounded-full p-1 transition"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="font-semibold text-lg w-8 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleIncreaseQuantity(item.id)}
                            className="bg-[#5A8DEE] hover:bg-[#4A7DDE] text-white rounded-full p-1 transition"
                          >
                            <Plus size={16} />
                          </button>
                        </div>

                        {/* Price & Remove */}
                        <div className="text-right">
                          <p className="text-lg font-bold text-[#5A8DEE] mb-2">
                            ₹{item.price * item.quantity}
                          </p>
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-red-500 hover:text-red-700 transition"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Cart Summary */}
            <div className="bg-white rounded-2xl shadow-md p-6 sticky bottom-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold text-gray-800">
                  Total Amount:
                </span>
                <span className="text-2xl font-bold text-[#5A8DEE]">
                  ₹{calculateTotal()}
                </span>
              </div>
              <button
                onClick={handleCheckout}
                className="w-full bg-gradient-to-r from-[#5A8DEE] to-[#40E0D0] text-white py-4 rounded-xl font-bold text-lg hover:shadow-xl transition"
              >
                Proceed to Checkout
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
