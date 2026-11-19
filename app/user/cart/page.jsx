"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Minus, Plus, ShoppingCart, Store, Trash2 } from "lucide-react";
import { AppHeader, EmptyState, Page, PageTitle, formatINR } from "@/components/ui";

// The same product can be in the cart from different shops, so match on both
const sameItem = (a, id, shopName) => a.id === id && (a.shopName || "Unknown Shop") === shopName;

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

  const saveCart = (updatedCart) => {
    setCart(updatedCart);
    if (updatedCart.length) localStorage.setItem("cart", JSON.stringify(updatedCart));
    else localStorage.removeItem("cart");
  };

  const handleIncreaseQuantity = (itemId, shopName) => {
    saveCart(cart.map((item) => (sameItem(item, itemId, shopName) ? { ...item, quantity: item.quantity + 1 } : item)));
  };

  const handleDecreaseQuantity = (itemId, shopName) => {
    saveCart(
      cart
        .map((item) =>
          sameItem(item, itemId, shopName) ? { ...item, quantity: Math.max(0, item.quantity - 1) } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const handleRemoveItem = (itemId, shopName) => {
    saveCart(cart.filter((item) => !sameItem(item, itemId, shopName)));
  };

  // Calculate totals
  const calculateTotal = () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = cart.reduce((n, i) => n + i.quantity, 0);

  // Group items by shop
  const groupedCart = cart.reduce((grouped, item) => {
    const shopName = item.shopName || "Unknown Shop";
    (grouped[shopName] ||= []).push(item);
    return grouped;
  }, {});
  const deliveryFee = Object.keys(groupedCart).length * 20; // same rule as checkout

  const handleCheckout = () => {
    if (cart.length === 0) return;
    router.push("/user/checkout");
  };

  return (
    <div className="min-h-screen bg-surface">
      <AppHeader role="user" cartCount={itemCount} />
      <Page>
        <PageTitle
          back="/user"
          title="Your cart"
          subtitle={cart.length ? `${itemCount} item${itemCount === 1 ? "" : "s"} from ${Object.keys(groupedCart).length} shop${Object.keys(groupedCart).length === 1 ? "" : "s"}` : undefined}
        />

        {cart.length === 0 ? (
          <EmptyState
            icon={ShoppingCart}
            title="Your cart is empty"
            text="Browse nearby shops and add the components you need."
            action={
              <button onClick={() => router.push("/user")} className="btn btn-primary">
                Start shopping
              </button>
            }
          />
        ) : (
          <div className="grid items-start gap-6 lg:grid-cols-[1fr_360px]">
            <div className="space-y-4">
              {Object.entries(groupedCart).map(([shopName, items]) => (
                <section key={shopName} className="card overflow-hidden">
                  <div className="flex items-center gap-3 border-b border-line px-5 py-3.5">
                    <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-50 text-brand-600">
                      <Store size={16} />
                    </span>
                    <h2 className="font-semibold text-ink">{shopName}</h2>
                  </div>

                  <ul className="divide-y divide-line">
                    {items.map((item) => (
                      <li key={`${item.id}_${shopName}`} className="flex gap-4 p-4 sm:p-5">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-20 w-20 shrink-0 rounded-xl bg-surface object-cover"
                        />
                        <div className="flex min-w-0 flex-1 flex-col">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <h3 className="font-semibold leading-snug text-ink">{item.name}</h3>
                              <p className="mt-0.5 truncate text-xs text-muted">{item.specs}</p>
                            </div>
                            <p className="shrink-0 font-bold text-ink">{formatINR(item.price * item.quantity)}</p>
                          </div>
                          <div className="mt-auto flex items-center justify-between gap-3 pt-3">
                            <div className="flex h-9 items-center rounded-xl border border-line">
                              <button
                                onClick={() => handleDecreaseQuantity(item.id, shopName)}
                                className="grid h-9 w-9 place-items-center rounded-l-xl text-ink-soft hover:bg-surface"
                                aria-label={`Remove one ${item.name}`}
                              >
                                <Minus size={15} />
                              </button>
                              <span className="w-8 text-center text-sm font-semibold tabular-nums">{item.quantity}</span>
                              <button
                                onClick={() => handleIncreaseQuantity(item.id, shopName)}
                                className="grid h-9 w-9 place-items-center rounded-r-xl text-ink-soft hover:bg-surface"
                                aria-label={`Add one ${item.name}`}
                              >
                                <Plus size={15} />
                              </button>
                            </div>
                            <span className="hidden text-xs text-muted sm:inline">{formatINR(item.price)} each</span>
                            <button
                              onClick={() => handleRemoveItem(item.id, shopName)}
                              className="btn btn-ghost btn-sm text-muted hover:text-red-600"
                            >
                              <Trash2 size={15} /> Remove
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>

            {/* Summary */}
            <aside className="card p-5 lg:sticky lg:top-24">
              <h2 className="font-semibold text-ink">Order summary</h2>
              <dl className="mt-4 space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted">Items ({itemCount})</dt>
                  <dd className="font-medium text-ink">{formatINR(calculateTotal())}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted">Delivery (₹20 per shop)</dt>
                  <dd className="font-medium text-ink">{formatINR(deliveryFee)}</dd>
                </div>
              </dl>
              <div className="mt-4 flex items-baseline justify-between border-t border-line pt-4">
                <span className="font-semibold text-ink">Total</span>
                <span className="text-2xl font-bold tracking-tight text-ink">
                  {formatINR(calculateTotal() + deliveryFee)}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted">Have a coupon? Apply it at checkout.</p>
              <button onClick={handleCheckout} className="btn btn-primary btn-lg mt-5 w-full">
                Proceed to checkout <ArrowRight size={18} />
              </button>
              <button onClick={() => router.push("/user")} className="btn btn-ghost mt-2 w-full">
                Continue shopping
              </button>
            </aside>
          </div>
        )}
      </Page>
    </div>
  );
}
