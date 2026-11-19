"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Bot,
  ChevronDown,
  ClipboardList,
  LogOut,
  Package,
  ShoppingCart,
  Store,
  Truck,
  User,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Brand                                                               */
/* ------------------------------------------------------------------ */

export function Logo({ size = 32, light = false, showText = true }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <span
        className="grid place-items-center rounded-xl bg-white ring-1 ring-black/5 shadow-sm"
        style={{ width: size, height: size }}
      >
        <img src="/ElectroDash.png" alt="" width={size - 8} height={size - 8} />
      </span>
      {showText && (
        <span className={`text-[17px] font-bold tracking-tight ${light ? "text-white" : "text-ink"}`}>
          Electro<span className={light ? "text-accent-100" : "text-brand-600"}>Dash</span>
        </span>
      )}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* App header with role-based navigation                               */
/* ------------------------------------------------------------------ */

const NAV = {
  user: [
    { href: "/user", label: "Shop", icon: Store },
    { href: "/user/dashboard", label: "My orders", icon: Package },
    { href: "/ai-chatbot", label: "AI assistant", icon: Bot },
  ],
  admin: [{ href: "/admin/dashboard", label: "Orders", icon: ClipboardList }],
  delivery: [{ href: "/delivery/dashboard", label: "Deliveries", icon: Truck }],
};

const ROLE_LABEL = { user: "Customer", admin: "Vendor", delivery: "Delivery partner" };

function readUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

function readCartCount() {
  try {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    return cart.reduce((n, i) => n + (i.quantity || 1), 0);
  } catch {
    return 0;
  }
}

export function logout(router) {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  router.push("/login");
}

/**
 * Sticky top bar used on every signed-in page.
 * - role: "user" | "admin" | "delivery" (defaults to the stored user's role)
 * - cartCount: pass it when the page owns live cart state; otherwise read from storage
 * - onLogout: optional custom logout handler
 */
export function AppHeader({ role, cartCount, onLogout }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [storedCart, setStoredCart] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    setUser(readUser());
    setStoredCart(readCartCount());
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [menuOpen]);

  const r = role || user?.role || "user";
  const links = NAV[r] || [];
  const count = typeof cartCount === "number" ? cartCount : storedCart;
  const name = user?.name || user?.shopName || user?.email || "";
  const initials = (name || "?")
    .split(/[\s@]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");

  const doLogout = () => (onLogout ? onLogout() : logout(router));
  const isActive = (href) =>
    href === "/user" ? pathname === "/user" : pathname === href || pathname.startsWith(href + "/");

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:px-6">
        <Link href={links[0]?.href || "/"} className="shrink-0" aria-label="ElectroDash home">
          <Logo />
        </Link>

        <nav className="ml-4 hidden items-center gap-1 md:flex">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`inline-flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-medium transition ${
                isActive(href)
                  ? "bg-brand-50 text-brand-700"
                  : "text-ink-soft hover:bg-slate-100 hover:text-ink"
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {r === "user" && (
            <Link
              href="/user/cart"
              className="btn btn-secondary relative"
              aria-label={`Cart, ${count} item${count === 1 ? "" : "s"}`}
            >
              <ShoppingCart size={18} />
              <span className="hidden sm:inline">Cart</span>
              {count > 0 && (
                <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-brand-600 px-1 text-[11px] font-bold text-white ring-2 ring-white">
                  {count}
                </span>
              )}
            </Link>
          )}

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="flex h-10 items-center gap-2 rounded-xl pl-1 pr-2 transition hover:bg-slate-100"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
            >
              <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-accent-500 text-xs font-bold text-white">
                {initials || <User size={16} />}
              </span>
              <span className="hidden max-w-[140px] truncate text-sm font-medium text-ink lg:inline">
                {user?.name || user?.shopName || "Account"}
              </span>
              <ChevronDown size={16} className="text-muted" />
            </button>

            {menuOpen && (
              <div
                role="menu"
                className="absolute right-0 mt-2 w-64 animate-fade-up overflow-hidden rounded-2xl border border-line bg-white shadow-lift"
              >
                <div className="border-b border-line px-4 py-3">
                  <p className="truncate text-sm font-semibold text-ink">{name || "Signed in"}</p>
                  <p className="truncate text-xs text-muted">{user?.email}</p>
                  <span className="badge mt-2 bg-brand-50 text-brand-700">{ROLE_LABEL[r]}</span>
                </div>
                <div className="p-1.5">
                  {/* Mobile: show nav links inside the menu */}
                  <div className="md:hidden">
                    {links.map(({ href, label, icon: Icon }) => (
                      <MenuLink key={href} href={href} icon={Icon} onClick={() => setMenuOpen(false)}>
                        {label}
                      </MenuLink>
                    ))}
                  </div>
                  {r === "user" && (
                    <MenuLink href="/user/profile" icon={User} onClick={() => setMenuOpen(false)}>
                      Profile & settings
                    </MenuLink>
                  )}
                  <button
                    role="menuitem"
                    onClick={doLogout}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    <LogOut size={16} />
                    Log out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

function MenuLink({ href, icon: Icon, children, onClick }) {
  return (
    <Link
      role="menuitem"
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-ink-soft hover:bg-slate-100 hover:text-ink"
    >
      <Icon size={16} />
      {children}
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/* Page scaffolding                                                    */
/* ------------------------------------------------------------------ */

export function Page({ children, className = "" }) {
  return <main className={`mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 ${className}`}>{children}</main>;
}

export function PageTitle({ title, subtitle, back, actions }) {
  const router = useRouter();
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="flex items-start gap-3">
        {back && (
          <button
            onClick={() => (typeof back === "string" ? router.push(back) : router.back())}
            className="btn btn-secondary btn-icon mt-0.5 shrink-0"
            aria-label="Go back"
          >
            <ArrowLeft size={18} />
          </button>
        )}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-[28px]">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function SectionTitle({ children, action }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <h2 className="text-base font-semibold text-ink">{children}</h2>
      {action}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Small building blocks                                               */
/* ------------------------------------------------------------------ */

const STATUS_STYLE = {
  Pending: "bg-amber-50 text-amber-700 ring-amber-200",
  Accepted: "bg-brand-50 text-brand-700 ring-brand-200",
  Confirmed: "bg-brand-50 text-brand-700 ring-brand-200",
  Preparing: "bg-violet-50 text-violet-700 ring-violet-200",
  Ready: "bg-accent-50 text-accent-700 ring-accent-100",
  Assigned: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  "Picked Up": "bg-sky-50 text-sky-700 ring-sky-200",
  "On the Way": "bg-orange-50 text-orange-700 ring-orange-200",
  Delivered: "bg-green-50 text-green-700 ring-green-200",
  Rejected: "bg-red-50 text-red-700 ring-red-200",
  Cancelled: "bg-red-50 text-red-700 ring-red-200",
};

const STATUS_DOT = {
  Pending: "bg-amber-500",
  Accepted: "bg-brand-500",
  Confirmed: "bg-brand-500",
  Preparing: "bg-violet-500",
  Ready: "bg-accent-500",
  Assigned: "bg-indigo-500",
  "Picked Up": "bg-sky-500",
  "On the Way": "bg-orange-500",
  Delivered: "bg-green-500",
  Rejected: "bg-red-500",
  Cancelled: "bg-red-500",
};

export function StatusBadge({ status }) {
  return (
    <span className={`badge ring-1 ring-inset ${STATUS_STYLE[status] || "bg-slate-100 text-slate-700 ring-slate-200"}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[status] || "bg-slate-400"}`} />
      {status}
    </span>
  );
}

export function StatCard({ label, value, icon: Icon, tone = "brand", hint }) {
  const tones = {
    brand: "bg-brand-50 text-brand-600",
    accent: "bg-accent-50 text-accent-600",
    amber: "bg-amber-50 text-amber-600",
    green: "bg-green-50 text-green-600",
    violet: "bg-violet-50 text-violet-600",
  };
  return (
    <div className="card p-3.5 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-muted sm:text-[13px]">{label}</p>
          <p className="mt-1 truncate text-lg font-bold tracking-tight text-ink sm:text-2xl">{value}</p>
          {hint && <p className="mt-0.5 hidden text-xs text-muted sm:block">{hint}</p>}
        </div>
        {Icon && (
          <span className={`hidden h-10 w-10 shrink-0 place-items-center rounded-xl sm:grid ${tones[tone]}`}>
            <Icon size={20} />
          </span>
        )}
      </div>
    </div>
  );
}

export function EmptyState({ icon: Icon = Package, title, text, action }) {
  return (
    <div className="card flex flex-col items-center px-6 py-14 text-center">
      <span className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-500">
        <Icon size={26} />
      </span>
      <p className="text-base font-semibold text-ink">{title}</p>
      {text && <p className="mt-1 max-w-sm text-sm text-muted">{text}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Spinner({ size = 20, className = "" }) {
  return (
    <span
      className={`inline-block animate-spin rounded-full border-2 border-current border-r-transparent ${className}`}
      style={{ width: size, height: size }}
      role="status"
      aria-label="Loading"
    />
  );
}

export function PageLoader({ label = "Loading…" }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-muted">
      <Spinner size={28} className="text-brand-500" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

export function Alert({ tone = "error", children }) {
  const tones = {
    error: "border-red-200 bg-red-50 text-red-700",
    success: "border-green-200 bg-green-50 text-green-700",
    info: "border-brand-200 bg-brand-50 text-brand-700",
  };
  return <div className={`rounded-xl border px-4 py-3 text-sm ${tones[tone]}`}>{children}</div>;
}

export function Field({ label, htmlFor, error, hint, children }) {
  return (
    <div>
      {label && (
        <label htmlFor={htmlFor} className="field-label">
          {label}
        </label>
      )}
      {children}
      {error ? (
        <p className="mt-1.5 text-xs font-medium text-red-600">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-muted">{hint}</p>
      ) : null}
    </div>
  );
}

export function Modal({ open, onClose, title, icon: Icon, children, maxWidth = "max-w-lg" }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-0 backdrop-blur-sm sm:items-center sm:p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        className={`w-full ${maxWidth} max-h-[92vh] animate-fade-up overflow-y-auto rounded-t-3xl bg-white shadow-pop sm:rounded-3xl`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-line bg-white/95 px-5 py-4 backdrop-blur">
          <h3 className="flex items-center gap-2.5 text-base font-semibold text-ink">
            {Icon && (
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-50 text-brand-600">
                <Icon size={18} />
              </span>
            )}
            {title}
          </h3>
          <button onClick={onClose} className="btn btn-ghost btn-icon btn-sm" aria-label="Close">
            <span aria-hidden className="text-xl leading-none">×</span>
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

export const formatINR = (n) =>
  `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
