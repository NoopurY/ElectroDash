"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Bike, CheckCircle2, Clock, ShoppingBag, Store, Zap } from "lucide-react";
import { Logo } from "@/components/ui";

const ROLES = [
  {
    icon: ShoppingBag,
    tone: "bg-brand-50 text-brand-600",
    title: "Customers",
    join: "customer",
    text: "Browse nearby shops, add parts to your cart and track your order live.",
    points: ["Shop by category", "AI parts assistant", "Live order tracking"],
  },
  {
    icon: Store,
    tone: "bg-accent-50 text-accent-600",
    title: "Shop owners",
    join: "vendor",
    text: "Get orders from customers nearby and hand them to a delivery partner.",
    points: ["Accept or reject orders", "Track preparation", "Assign delivery partners"],
  },
  {
    icon: Bike,
    tone: "bg-amber-50 text-amber-600",
    title: "Delivery partners",
    join: "delivery partner",
    text: "Go online when you are free and earn on every delivery you complete.",
    points: ["Toggle availability", "Pickup and drop details", "Earnings at a glance"],
  },
];

const STEPS = [
  ["Pick a shop", "Choose from electronics stores near you and add the parts you need."],
  ["Shop packs it", "The vendor accepts your order and gets it ready for pickup."],
  ["Rider delivers", "A delivery partner brings it to you. Track every step live."],
];

export default function Home() {
  const router = useRouter();
  const [shouldRenderLanding, setShouldRenderLanding] = useState(false);

  // On first load of "/", if a logged-in user exists in localStorage,
  // immediately redirect them to their role-specific area.
  useEffect(() => {
    try {
      const token =
        typeof window !== "undefined" && localStorage.getItem("token");
      const raw = typeof window !== "undefined" && localStorage.getItem("user");
      const user = raw ? JSON.parse(raw) : null;

      const roleToPath = {
        admin: "/admin/dashboard",
        delivery: "/delivery/dashboard",
        user: "/user",
      };

      if (token && user?.role && roleToPath[user.role]) {
        router.replace(roleToPath[user.role]);
        return; // Do not render landing while redirecting
      }
    } catch (e) {
      // If parsing fails, fall back to showing landing
    }
    setShouldRenderLanding(true);
  }, [router]);

  if (!shouldRenderLanding) return null;

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-line/70 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Logo />
          <div className="flex items-center gap-2">
            <Link href="/login" className="btn btn-ghost">
              Log in
            </Link>
            <Link href="/signup" className="btn btn-primary">
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(50% 60% at 85% 20%, rgb(191 211 254 / .55), transparent 70%), radial-gradient(40% 50% at 10% 90%, rgb(207 250 240 / .7), transparent 70%)",
          }}
        />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:py-24">
          <div className="animate-fade-up">
            <span className="badge h-7 bg-white px-3 text-brand-700 ring-1 ring-brand-200">
              <Zap size={14} className="text-accent-600" /> Components in about 20 minutes
            </span>
            <h1 className="mt-6 text-4xl font-bold leading-[1.08] tracking-tight text-ink sm:text-5xl lg:text-[56px]">
              Electronic parts, delivered before your{" "}
              <span className="bg-gradient-to-r from-brand-600 to-accent-500 bg-clip-text text-transparent">
                soldering iron cools.
              </span>
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-muted">
              Order resistors, transistors, Arduino boards and more from trusted electronics shops near you, and
              track every order to your door.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/signup" className="btn btn-primary btn-lg px-6">
                Start shopping <ArrowRight size={18} />
              </Link>
              <Link href="/login" className="btn btn-secondary btn-lg px-6">
                I have an account
              </Link>
            </div>
            <dl className="mt-10 flex flex-wrap gap-x-10 gap-y-4">
              {[
                ["~20 min", "average delivery"],
                ["3 roles", "customer, vendor, rider"],
                ["Live", "order tracking"],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="text-xl font-bold text-ink">{k}</dt>
                  <dd className="text-sm text-muted">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Order preview */}
          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="card relative overflow-hidden p-5 pb-6 shadow-lift sm:pb-16">
              <div className="flex items-center justify-between">
                <div>
                  <p className="eyebrow">Order #ED1001</p>
                  <p className="mt-1 font-semibold text-ink">Gada Electronics</p>
                </div>
                <span className="badge bg-orange-50 text-orange-700 ring-1 ring-inset ring-orange-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-orange-500" /> On the way
                </span>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-3">
                {[
                  ["/arduino.png", "Arduino Uno", "₹650"],
                  ["/resistors.png", "10kΩ ×20", "₹40"],
                  ["/transistors.png", "BC547 ×10", "₹60"],
                ].map(([src, n, p]) => (
                  <div key={n} className="rounded-xl bg-surface p-3 text-center">
                    <img src={src} alt="" className="mx-auto h-16 w-16 object-contain" />
                    <p className="mt-2 truncate text-xs font-medium text-ink">{n}</p>
                    <p className="text-xs text-muted">{p}</p>
                  </div>
                ))}
              </div>
              <ol className="mt-6 grid grid-cols-4 gap-2">
                {["Placed", "Packed", "Picked up", "Delivered"].map((step, i) => (
                  <li key={step}>
                    <div className={`h-1.5 rounded-full ${i < 3 ? "bg-brand-500" : "bg-slate-200"}`} />
                    <p className={`mt-2 text-[11px] font-medium ${i < 3 ? "text-ink" : "text-muted"}`}>{step}</p>
                  </li>
                ))}
              </ol>
            </div>
            <div className="card absolute -bottom-6 -left-4 hidden items-center gap-3 px-4 py-3 shadow-lift sm:flex">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent-50 text-accent-600">
                <Clock size={20} />
              </span>
              <div>
                <p className="text-xs text-muted">Arriving in</p>
                <p className="font-semibold text-ink">12 minutes</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Roles */}
      <section className="border-t border-line bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
          <p className="eyebrow text-center">One platform, three roles</p>
          <h2 className="mx-auto mt-2 max-w-2xl text-center text-3xl font-bold tracking-tight text-ink">
            Built for everyone who gets parts to your bench
          </h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {ROLES.map(({ icon: Icon, tone, title, join, text, points }) => (
              <div key={title} className="card card-hover flex flex-col p-6">
                <span className={`grid h-12 w-12 place-items-center rounded-2xl ${tone}`}>
                  <Icon size={24} />
                </span>
                <h3 className="mt-5 text-lg font-semibold text-ink">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{text}</p>
                <ul className="mt-5 space-y-2.5">
                  {points.map((pt) => (
                    <li key={pt} className="flex items-center gap-2.5 text-sm text-ink-soft">
                      <CheckCircle2 size={16} className="shrink-0 text-accent-600" />
                      {pt}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className="mt-auto inline-flex items-center gap-1.5 pt-6 text-sm font-semibold text-brand-600 hover:text-brand-700"
                >
                  Join as {join} <ArrowRight size={15} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
        <h2 className="text-center text-3xl font-bold tracking-tight text-ink">How it works</h2>
        <div className="mt-10 grid gap-8 md:grid-cols-3">
          {STEPS.map(([t, d], i) => (
            <div key={t} className="text-center">
              <span className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-brand-600 text-base font-bold text-white shadow-lift">
                {i + 1}
              </span>
              <h3 className="mt-4 font-semibold text-ink">{t}</h3>
              <p className="mx-auto mt-1.5 max-w-xs text-sm text-muted">{d}</p>
            </div>
          ))}
        </div>
        <div className="mt-14 flex justify-center">
          <Link href="/signup" className="btn btn-primary btn-lg px-6">
            Create your free account <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-6 text-sm text-muted sm:px-6">
          <Logo size={28} />
          <p>© {new Date().getFullYear()} ElectroDash</p>
        </div>
      </footer>
    </div>
  );
}
