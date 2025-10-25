"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ShoppingCart,
  CreditCard,
  Wallet,
  Banknote,
  Tag,
  CheckCircle,
  Store,
  Package,
  MapPin,
  Phone,
  X,
} from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discount, setDiscount] = useState(0);
  const [address, setAddress] = useState({
    name: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    pincode: "",
  });

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
      const cartData = JSON.parse(savedCart);
      if (cartData.length === 0) {
        router.push("/user");
        return;
      }
      setCart(cartData);
    } else {
      router.push("/user");
    }

    // Load saved address if exists
    const savedAddress = localStorage.getItem("deliveryAddress");
    if (savedAddress) {
      setAddress(JSON.parse(savedAddress));
    }
  }, [router]);

  // Handle back navigation
  const handleBack = () => {
    router.back();
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

  // Calculate subtotal
  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  // Calculate delivery fee
  const calculateDeliveryFee = () => {
    const numberOfShops = Object.keys(groupedCart).length;
    return numberOfShops * 20; // ₹20 per shop
  };

  // Calculate total
  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const deliveryFee = calculateDeliveryFee();
    return subtotal + deliveryFee - discount;
  };

  // Handle coupon apply
  const handleApplyCoupon = () => {
    if (!couponCode.trim()) return;

    // Mock coupon validation
    const validCoupons = {
      SAVE10: { discount: 10, type: "percentage" },
      FLAT50: { discount: 50, type: "flat" },
      FIRST100: { discount: 100, type: "flat" },
    };

    const coupon = validCoupons[couponCode.toUpperCase()];
    if (coupon) {
      const subtotal = calculateSubtotal();
      const discountAmount =
        coupon.type === "percentage"
          ? (subtotal * coupon.discount) / 100
          : coupon.discount;
      setDiscount(discountAmount);
      setAppliedCoupon({
        code: couponCode.toUpperCase(),
        ...coupon,
      });
    } else {
      alert("Invalid coupon code");
    }
  };

  // Handle remove coupon
  const handleRemoveCoupon = () => {
    setCouponCode("");
    setAppliedCoupon(null);
    setDiscount(0);
  };

  // Handle address change
  const handleAddressChange = (field, value) => {
    setAddress((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Validate address
  const isAddressValid = () => {
    return (
      address.name.trim() !== "" &&
      address.phone.trim() !== "" &&
      address.addressLine1.trim() !== "" &&
      address.city.trim() !== "" &&
      address.pincode.trim() !== "" &&
      address.pincode.length === 6
    );
  };

  // Handle place order
  const handlePlaceOrder = () => {
    if (!selectedPayment) {
      alert("Please select a payment method");
      return;
    }

    if (!isAddressValid()) {
      alert("Please fill in all required address fields correctly");
      return;
    }

    // Save address to localStorage for future use
    localStorage.setItem("deliveryAddress", JSON.stringify(address));

    // Prepare order data
    const orderData = {
      items: cart,
      subtotal: calculateSubtotal(),
      deliveryFee: calculateDeliveryFee(),
      discount: discount,
      total: calculateTotal(),
      paymentMethod: selectedPayment === "card" 
        ? "Credit/Debit Card" 
        : selectedPayment === "wallet" 
        ? "Digital Wallet" 
        : "Cash on Delivery",
      appliedCoupon: appliedCoupon?.code || null,
      address: address,
    };

    // Save order data to sessionStorage
    sessionStorage.setItem("lastOrder", JSON.stringify(orderData));

    // Clear cart
    localStorage.removeItem("cart");

    // Redirect to success page
    router.push("/user/order-success");
  };

  const paymentMethods = [
    { id: "card", name: "Credit/Debit Card", icon: CreditCard },
    { id: "wallet", name: "Digital Wallet (UPI/Paytm)", icon: Wallet },
    { id: "cod", name: "Cash on Delivery", icon: Banknote },
  ];

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
              Checkout
            </h1>
            <p className="text-sm opacity-90">Review and place your order</p>
          </div>
        </div>
      </header>

      <div className="w-full max-w-4xl px-5 mt-6 flex flex-col lg:flex-row gap-6">
        {/* Left Column - Order Details */}
        <div className="flex-1 space-y-6">
          {/* Order Summary */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Package size={20} />
              Order Summary
            </h2>

            {Object.entries(groupedCart).map(([shopName, items]) => (
              <div key={shopName} className="mb-6 last:mb-0">
                {/* Shop Header */}
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200">
                  <Store size={16} className="text-gray-500" />
                  <span className="text-sm font-semibold text-gray-500">
                    {shopName}
                  </span>
                </div>

                {/* Items */}
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={`${item.id}_${item.shopName}`} className="flex items-center gap-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-contain rounded-lg border border-gray-200"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm text-gray-800">
                          {item.name}
                        </h3>
                        <p className="text-xs text-gray-600">{item.specs}</p>
                        <p className="text-xs text-gray-500">
                          Qty: {item.quantity}
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

          {/* Delivery Address */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <MapPin size={20} />
              Delivery Address
            </h2>
            <div className="space-y-4">
              {/* Name and Phone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={address.name}
                    onChange={(e) => handleAddressChange("name", e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#5A8DEE] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="10-digit mobile number"
                    value={address.phone}
                    onChange={(e) => handleAddressChange("phone", e.target.value)}
                    maxLength={10}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#5A8DEE] outline-none"
                  />
                </div>
              </div>

              {/* Address Line 1 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Address Line 1 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="House No., Building Name"
                  value={address.addressLine1}
                  onChange={(e) => handleAddressChange("addressLine1", e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#5A8DEE] outline-none"
                />
              </div>

              {/* Address Line 2 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Address Line 2 <span className="text-gray-400">(Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="Road Name, Area, Colony"
                  value={address.addressLine2}
                  onChange={(e) => handleAddressChange("addressLine2", e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#5A8DEE] outline-none"
                />
              </div>

              {/* City and Pincode */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter city"
                    value={address.city}
                    onChange={(e) => handleAddressChange("city", e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#5A8DEE] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Pincode <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="6-digit pincode"
                    value={address.pincode}
                    onChange={(e) => handleAddressChange("pincode", e.target.value)}
                    maxLength={6}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#5A8DEE] outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <CreditCard size={20} />
              Payment Method
            </h2>
            <div className="space-y-3">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <button
                    key={method.id}
                    onClick={() => setSelectedPayment(method.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition ${
                      selectedPayment === method.id
                        ? "border-[#5A8DEE] bg-blue-50"
                        : "border-gray-200 hover:border-[#5A8DEE] hover:bg-gray-50"
                    }`}
                  >
                    <Icon
                      size={24}
                      className={
                        selectedPayment === method.id
                          ? "text-[#5A8DEE]"
                          : "text-gray-500"
                      }
                    />
                    <span
                      className={`font-semibold text-sm ${
                        selectedPayment === method.id
                          ? "text-[#5A8DEE]"
                          : "text-gray-700"
                      }`}
                    >
                      {method.name}
                    </span>
                    {selectedPayment === method.id && (
                      <CheckCircle
                        size={20}
                        className="ml-auto text-[#5A8DEE]"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column - Price Details */}
        <div className="lg:w-96 w-full">
          <div className="bg-white rounded-2xl shadow-md p-6 lg:sticky lg:top-6">
            {/* Coupon Section */}
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <Tag size={18} />
                Apply Coupon
              </h3>
              {!appliedCoupon ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-[#5A8DEE] outline-none text-sm"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    className="bg-[#5A8DEE] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#4A7DDE] transition text-sm"
                  >
                    Apply
                  </button>
                </div>
              ) : (
                <div className="bg-green-50 border-2 border-green-500 rounded-lg p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Tag size={16} className="text-green-600" />
                    <div>
                      <p className="font-semibold text-green-800 text-sm">
                        {appliedCoupon.code}
                      </p>
                      <p className="text-xs text-green-600">
                        {appliedCoupon.type === "percentage"
                          ? `${appliedCoupon.discount}% off`
                          : `₹${appliedCoupon.discount} off`}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleRemoveCoupon}
                    className="text-red-500 hover:text-red-700 transition"
                  >
                    <X size={18} />
                  </button>
                </div>
              )}
            </div>

            <hr className="mb-4" />

            {/* Price Breakdown */}
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Price Details
            </h3>
            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-gray-700">
                <span>Subtotal ({cart.length} items)</span>
                <span>₹{calculateSubtotal()}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Delivery Fee</span>
                <span>₹{calculateDeliveryFee()}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-₹{discount}</span>
                </div>
              )}
            </div>

            <hr className="mb-4" />

            <div className="flex justify-between text-xl font-bold text-gray-800 mb-6">
              <span>Total Amount</span>
              <span className="text-[#5A8DEE]">₹{calculateTotal()}</span>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={!selectedPayment || !isAddressValid()}
              className="w-full bg-gradient-to-r from-[#5A8DEE] to-[#40E0D0] text-white py-4 rounded-xl font-bold text-lg hover:shadow-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Place Order
            </button>

            {!isAddressValid() && (
              <p className="text-xs text-red-500 text-center mt-2">
                Please fill in all required address fields
              </p>
            )}

            {/* Available Coupons */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs font-semibold text-gray-600 mb-2">
                Available Coupons:
              </p>
              <div className="space-y-1 text-xs text-gray-500">
                <p>• SAVE10 - 10% off</p>
                <p>• FLAT50 - ₹50 off</p>
                <p>• FIRST100 - ₹100 off</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
