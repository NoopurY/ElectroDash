import Link from "next/link";
import { Clock, ShieldCheck, Store } from "lucide-react";
import { Logo } from "./ui";

const POINTS = [
  { icon: Clock, title: "Delivered in minutes", text: "From shops on Lamington Road to your bench." },
  { icon: Store, title: "Trusted local shops", text: "Real stock from electronics stores near you." },
  { icon: ShieldCheck, title: "Track every order", text: "Live status from the shop to your door." },
];

/** Two-column layout for login / signup: brand panel on the left, form on the right. */
export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="grid min-h-screen bg-white lg:grid-cols-[1fr_1.05fr]">
      {/* Brand panel */}
      <aside className="relative hidden overflow-hidden bg-brand-900 lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:justify-between lg:p-12">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-90"
          style={{
            background:
              "radial-gradient(60% 50% at 15% 10%, rgb(59 111 230 / .55), transparent 70%), radial-gradient(50% 45% at 90% 85%, rgb(20 184 166 / .45), transparent 70%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "36px 36px",
          }}
        />

        <Link href="/" className="relative">
          <Logo light />
        </Link>

        <div className="relative max-w-md">
          <h2 className="text-4xl font-bold leading-tight tracking-tight text-white">
            Get your components before your soldering iron cools.
          </h2>
          <ul className="mt-10 space-y-5">
            {POINTS.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex gap-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/10 text-accent-100 ring-1 ring-white/15">
                  <Icon size={20} />
                </span>
                <div>
                  <p className="font-semibold text-white">{title}</p>
                  <p className="text-sm text-brand-100/80">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative flex items-end gap-3">
          {["/arduino.png", "/resistors.png", "/transistors.png"].map((src, i) => (
            <div
              key={src}
              className="grid h-20 w-20 place-items-center rounded-2xl bg-white/95 p-3 shadow-lg"
              style={{ transform: `rotate(${[-6, 3, -2][i]}deg) translateY(${[0, -8, 0][i]}px)` }}
            >
              <img src={src} alt="" className="max-h-full max-w-full object-contain" />
            </div>
          ))}
        </div>
      </aside>

      {/* Form */}
      <main className="flex items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-[420px] animate-fade-up">
          <Link href="/" className="mb-8 inline-block lg:hidden">
            <Logo />
          </Link>
          <h1 className="text-[28px] font-bold tracking-tight text-ink">{title}</h1>
          {subtitle && <p className="mt-1.5 text-[15px] text-muted">{subtitle}</p>}
          <div className="mt-8">{children}</div>
          {footer && <div className="mt-8 text-center text-sm text-muted">{footer}</div>}
        </div>
      </main>
    </div>
  );
}
