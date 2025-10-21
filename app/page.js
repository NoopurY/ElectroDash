import Link from "next/link";

export default function Home() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center"
      style={{ backgroundColor: "#EAF2FF" }}
    >
      <div className="text-center max-w-2xl px-4">
        <h1 className="text-5xl font-bold mb-4" style={{ color: "#5A8DEE" }}>
          Components in Minutes
        </h1>
        <p className="text-xl mb-8" style={{ color: "#6B6B6B" }}>
          Get your components delivered fast and fresh
        </p>

        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            href="/login"
            className="px-8 py-3 rounded-lg font-medium text-white hover:opacity-90 transition-opacity"
            style={{ backgroundColor: "#40E0D0" }}
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="px-8 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
            style={{
              backgroundColor: "#FFFFFF",
              color: "#5A8DEE",
              border: "2px solid #5A8DEE",
            }}
          >
            Sign Up
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            className="p-6 rounded-lg"
            style={{
              backgroundColor: "#FFFFFF",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
            }}
          >
            <h3 className="font-bold text-lg mb-2" style={{ color: "#212121" }}>
              For Customers
            </h3>
            <p style={{ color: "#6B6B6B" }}>Order components with ease</p>
          </div>
          <div
            className="p-6 rounded-lg"
            style={{
              backgroundColor: "#FFFFFF",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
            }}
          >
            <h3 className="font-bold text-lg mb-2" style={{ color: "#212121" }}>
              For Delivery Partners
            </h3>
            <p style={{ color: "#6B6B6B" }}>Earn by delivering components</p>
          </div>
          <div
            className="p-6 rounded-lg"
            style={{
              backgroundColor: "#FFFFFF",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
            }}
          >
            <h3 className="font-bold text-lg mb-2" style={{ color: "#212121" }}>
              For Admins
            </h3>
            <p style={{ color: "#6B6B6B" }}>Manage the entire platform</p>
          </div>
        </div>
      </div>
    </div>
  );
}
