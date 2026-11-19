"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  Wallet,
  Banknote,
  Tag,
  CheckCircle,
  Store,
  Package,
  MapPin,
  X,
} from "lucide-react";
import { AppHeader, Field, Page, PageTitle, formatINR } from "@/components/ui";

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discount, setDiscount] = useState(0);
  const [couponError, setCouponError] = useState("");
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
      setCouponError("That coupon code is not valid");
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

  const itemCount = cart.reduce((n, i) => n + i.quantity, 0);
  const addressOk = isAddressValid();

  const SectionHeader = ({ step, icon: Icon, title, done }) => (
    <div className="mb-5 flex items-center gap-3">
      <span
        className={`grid h-8 w-8 place-items-center rounded-full text-sm font-bold ${
          done ? "bg-green-600 text-white" : "bg-brand-50 text-brand-700"
        }`}
      >
        {done ? <CheckCircle size={16} /> : step}
      </span>
      <h2 className="flex items-center gap-2 text-base font-semibold text-ink">
        <Icon size={18} className="text-muted" /> {title}
      </h2>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface">
      <AppHeader role="user" cartCount={itemCount} />
      <Page>
        <PageTitle back="/user/cart" title="Checkout" subtitle="Add your address, choose how to pay, and place your order." />

        <div className="grid items-start gap-6 lg:grid-cols-[1fr_380px]">
          <div className="space-y-5">
            {/* Delivery Address */}
            <section className="card p-5 sm:p-6">
              <SectionHeader step={1} icon={MapPin} title="Delivery address" done={addressOk} />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Full name" htmlFor="co-name">
                  <input
                    id="co-name"
                    type="text"
                    autoComplete="name"
                    placeholder="Your full name"
                    value={address.name}
                    onChange={(e) => handleAddressChange("name", e.target.value)}
                    className="input"
                  />
                </Field>
                <Field label="Phone number" htmlFor="co-phone">
                  <input
                    id="co-phone"
                    type="tel"
                    autoComplete="tel"
                    placeholder="10-digit mobile number"
                    value={address.phone}
                    onChange={(e) => handleAddressChange("phone", e.target.value)}
                    maxLength={10}
                    className="input"
                  />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Address line 1" htmlFor="co-a1">
                    <input
                      id="co-a1"
                      type="text"
                      autoComplete="address-line1"
                      placeholder="Flat / house no., building"
                      value={address.addressLine1}
                      onChange={(e) => handleAddressChange("addressLine1", e.target.value)}
                      className="input"
                    />
                  </Field>
                </div>
                <div className="sm:col-span-2">
                  <Field label="Address line 2 (optional)" htmlFor="co-a2">
                    <input
                      id="co-a2"
                      type="text"
                      autoComplete="address-line2"
                      placeholder="Road, area, landmark"
                      value={address.addressLine2}
                      onChange={(e) => handleAddressChange("addressLine2", e.target.value)}
                      className="input"
                    />
                  </Field>
                </div>
                <Field label="City" htmlFor="co-city">
                  <input
                    id="co-city"
                    type="text"
                    autoComplete="address-level2"
                    placeholder="City"
                    value={address.city}
                    onChange={(e) => handleAddressChange("city", e.target.value)}
                    className="input"
                  />
                </Field>
                <Field
                  label="Pincode"
                  htmlFor="co-pin"
                  error={address.pincode && address.pincode.length !== 6 ? "Pincode must be 6 digits" : ""}
                >
                  <input
                    id="co-pin"
                    type="text"
                    inputMode="numeric"
                    autoComplete="postal-code"
                    placeholder="6-digit pincode"
                    value={address.pincode}
                    onChange={(e) => handleAddressChange("pincode", e.target.value.replace(/\D/g, ""))}
                    maxLength={6}
                    className={`input ${address.pincode && address.pincode.length !== 6 ? "input-error" : ""}`}
                  />
                </Field>
              </div>
            </section>

            {/* Payment Method */}
            <section className="card p-5 sm:p-6">
              <SectionHeader step={2} icon={CreditCard} title="Payment method" done={!!selectedPayment} />
              <div className="grid gap-3 sm:grid-cols-3">
                {paymentMethods.map((method) => {
                  const Icon = method.icon;
                  const active = selectedPayment === method.id;
                  return (
                    <button
                      key={method.id}
                      onClick={() => setSelectedPayment(method.id)}
                      aria-pressed={active}
                      className={`relative flex flex-col items-start gap-3 rounded-2xl border p-4 text-left transition ${
                        active
                          ? "border-brand-500 bg-brand-50 ring-4 ring-brand-500/10"
                          : "border-line bg-white hover:border-slate-300"
                      }`}
                    >
                      <span
                        className={`grid h-10 w-10 place-items-center rounded-xl ${
                          active ? "bg-brand-600 text-white" : "bg-surface text-ink-soft"
                        }`}
                      >
                        <Icon size={20} />
                      </span>
                      <span className={`text-sm font-semibold ${active ? "text-brand-700" : "text-ink"}`}>
                        {method.name}
                      </span>
                      {active && <CheckCircle size={18} className="absolute right-3 top-3 text-brand-600" />}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Items */}
            <section className="card p-5 sm:p-6">
              <SectionHeader step={3} icon={Package} title={`Review items (${itemCount})`} />
              <div className="space-y-5">
                {Object.entries(groupedCart).map(([shopName, items]) => (
                  <div key={shopName}>
                    <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted">
                      <Store size={14} /> {shopName}
                    </p>
                    <ul className="space-y-3">
                      {items.map((item) => (
                        <li key={`${item.id}_${item.shopName}`} className="flex items-center gap-4">
                          <img src={item.image} alt={item.name} className="h-14 w-14 rounded-xl bg-surface object-cover" />
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
            </section>
          </div>

          {/* Price Details */}
          <aside className="card p-5 sm:p-6 lg:sticky lg:top-24">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-ink">
              <Tag size={16} className="text-muted" /> Coupon
            </h3>
            {!appliedCoupon ? (
              <>
                <div className="mt-3 flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter code"
                    value={couponCode}
                    onChange={(e) => {
                      setCouponCode(e.target.value.toUpperCase());
                      setCouponError("");
                    }}
                    onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                    className={`input h-10 flex-1 uppercase placeholder:normal-case ${couponError ? "input-error" : ""}`}
                    aria-label="Coupon code"
                  />
                  <button onClick={handleApplyCoupon} className="btn btn-secondary">
                    Apply
                  </button>
                </div>
                {couponError && <p className="mt-1.5 text-xs font-medium text-red-600">{couponError}</p>}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {[
                    ["SAVE10", "10% off"],
                    ["FLAT50", "₹50 off"],
                    ["FIRST100", "₹100 off"],
                  ].map(([code, label]) => (
                    <button
                      key={code}
                      onClick={() => {
                        setCouponCode(code);
                        setCouponError("");
                      }}
                      className="rounded-lg border border-dashed border-brand-300 bg-brand-50/60 px-2.5 py-1 text-xs font-semibold text-brand-700 hover:bg-brand-50"
                      title={label}
                    >
                      {code} · <span className="font-medium">{label}</span>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="mt-3 flex items-center justify-between rounded-xl border border-green-200 bg-green-50 px-3.5 py-2.5">
                <div>
                  <p className="text-sm font-semibold text-green-800">{appliedCoupon.code} applied</p>
                  <p className="text-xs text-green-700">
                    {appliedCoupon.type === "percentage"
                      ? `${appliedCoupon.discount}% off`
                      : `₹${appliedCoupon.discount} off`}
                  </p>
                </div>
                <button onClick={handleRemoveCoupon} className="btn btn-ghost btn-sm btn-icon text-green-800" aria-label="Remove coupon">
                  <X size={16} />
                </button>
              </div>
            )}

            <dl className="mt-6 space-y-2.5 border-t border-line pt-5 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">Subtotal ({itemCount} items)</dt>
                <dd className="font-medium text-ink">{formatINR(calculateSubtotal())}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Delivery fee</dt>
                <dd className="font-medium text-ink">{formatINR(calculateDeliveryFee())}</dd>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-700">
                  <dt>Discount</dt>
                  <dd className="font-medium">−{formatINR(discount)}</dd>
                </div>
              )}
            </dl>
            <div className="mt-4 flex items-baseline justify-between border-t border-line pt-4">
              <span className="font-semibold text-ink">Total</span>
              <span className="text-2xl font-bold tracking-tight text-ink">{formatINR(calculateTotal())}</span>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={!selectedPayment || !addressOk}
              className="btn btn-primary btn-lg mt-5 w-full"
            >
              Place order · {formatINR(calculateTotal())}
            </button>
            {(!addressOk || !selectedPayment) && (
              <p className="mt-2 text-center text-xs text-muted">
                {!addressOk ? "Fill in your delivery address to continue" : "Choose a payment method to continue"}
              </p>
            )}
          </aside>
        </div>
      </Page>
    </div>
  );
}
