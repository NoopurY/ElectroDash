"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Upload,
  FileText,
  Bot,
  X,
  Camera,
  CheckCircle,
  AlertCircle,
  Clock,
  ShoppingCart,
  ArrowLeft,
  Plus,
  Minus,
  Heart,
  MapPin,
  ChevronRight,
  Store,
  Zap,
} from "lucide-react";
import {
  Alert,
  AppHeader,
  EmptyState,
  Modal,
  Page,
  SectionTitle,
  Spinner,
} from "@/components/ui";

export default function UserHomePage() {
  const router = useRouter();
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [detectionResult, setDetectionResult] = useState(null);
  const [shopPageOpen, setShopPageOpen] = useState(false);
  const [selectedShop, setSelectedShop] = useState(null);
  const [cart, setCart] = useState([]);
  const [shops, setShops] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("Resistor");
  const [productQuantities, setProductQuantities] = useState({});
  const [favorites, setFavorites] = useState([]);
  const [simulationOpen, setSimulationOpen] = useState(false);
  const [simulationProduct, setSimulationProduct] = useState(null);
  const [simVoltage, setSimVoltage] = useState(5);
  const [simResistance, setSimResistance] = useState(1000);
  const [simOn, setSimOn] = useState(true);
  const [query, setQuery] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Check authentication and role
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (!token || !userData) {
      router.push("/login");
      return;
    }
    const user = JSON.parse(userData);
    if (user.role !== "user") {
      // Only allow users with role 'user'
      if (user.role === "admin") {
        router.push("/admin/dashboard");
      } else if (user.role === "delivery") {
        router.push("/delivery/dashboard");
      } else {
        router.push("/login");
      }
      return;
    }
    setCurrentUser(user);

    // Load cart from localStorage
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }

    // Load favorites from localStorage
    const savedFavorites = localStorage.getItem("favorites");
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, [router]);

  // Load initial shops and subscribe to real-time shop additions via SSE
  useEffect(() => {
    let mounted = true;

    // Helper: fallback default shops
    const defaultShops = [
      {
        name: "Gada Electronics",
        time: "23 mins",
        addr: "Shop no. 19, Lamington Road",
        id: "seed-gada",
      },
      {
        name: "Raju Electronics",
        time: "23 mins",
        addr: "Shop no. 29, Lamington Road",
        id: "seed-raju",
      },
      {
        name: "Nagraj Electronics",
        time: "28 mins",
        addr: "Shop no. 12, Lamington Road",
        id: "seed-nagraj",
      },
    ];

    // Fetch current shops from backend
    fetch("/api/shops")
      .then((res) => res.json())
      .then((data) => {
        if (!mounted) return;
        if (data?.shops) setShops(data.shops);
        else setShops(defaultShops);
      })
      .catch(() => {
        if (!mounted) return;
        setShops(defaultShops);
      });

    // Check for newly registered shops every 30 seconds.
    // (Polling works on serverless hosts like Vercel, unlike a live stream.)
    const poll = setInterval(() => {
      if (document.hidden) return; // don't poll while the tab is in the background
      fetch("/api/shops")
        .then((res) => res.json())
        .then((data) => {
          if (!mounted || !data?.shops) return;
          setShops((prev) => {
            // Only add shops we don't already show, so existing ETAs don't jump around
            const known = new Set(prev.map((s) => s.id || s.name));
            const added = data.shops.filter((s) => !known.has(s.id || s.name));
            return added.length ? [...added, ...prev] : prev;
          });
        })
        .catch(() => {});
    }, 30000);

    return () => {
      mounted = false;
      clearInterval(poll);
    };
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (cart.length > 0) {
      localStorage.setItem("cart", JSON.stringify(cart));
    } else {
      localStorage.removeItem("cart");
    }
  }, [cart]);

  // Sync productQuantities with cart when shop changes
  useEffect(() => {
    if (!selectedShop) return;

    const newQuantities = {};
    cart.forEach((item) => {
      if (item.shopName === selectedShop.name) {
        const key = `${item.id}_${item.shopName}`;
        newQuantities[key] = item.quantity;
      }
    });
    setProductQuantities(newQuantities);
  }, [selectedShop, cart]);

  // Profile icon click handler
  const handleProfileClick = () => {
    router.push("/user/dashboard");
  };

  // Handle photo upload modal open
  const handlePhotoUploadClick = () => {
    setPhotoModalOpen(true);
    setUploadedImage(null);
    setImagePreview(null);
    setDetectionResult(null);
  };

  // Handle photo upload modal close
  const handlePhotoModalClose = () => {
    setPhotoModalOpen(false);
    setUploadedImage(null);
    setImagePreview(null);
    setDetectionResult(null);
    setIsAnalyzing(false);
  };

  // Handle image file selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedImage(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle image analysis/detection
  const handleAnalyzeImage = async () => {
    if (!uploadedImage) return;

    setIsAnalyzing(true);

    // Simulate API call for product detection
    // In production, you would send the image to your backend API
    // which would use computer vision/AI to detect the hardware component
    setTimeout(() => {
      // Mock detection result
      const mockResults = [
        {
          detected: true,
          componentName: "Resistor 10kΩ",
          confidence: 95,
          available: true,
          price: 5,
          shops: ["Gada Electronics", "Raju Electronics"],
        },
        {
          detected: true,
          componentName: "Resistor 1kΩ",
          confidence: 85,
          available: true,
          price: 5,
          shops: ["Nagraj Electronics"],
        },
      ];

      setDetectionResult({
        success: true,
        results: mockResults,
      });
      setIsAnalyzing(false);
    }, 2000);
  };

  // Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      setUploadedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle shop click - open shopping page
  const handleShopClick = (shop) => {
    setSelectedShop(shop);
    setShopPageOpen(true);
    window.scrollTo({ top: 0 });
  };

  // Handle back from shop page
  const handleBackFromShop = () => {
    setShopPageOpen(false);
    setSelectedShop(null);
  };

  // Get quantity for a product in current shop
  const getProductQuantity = (productId) => {
    const key = `${productId}_${selectedShop?.name || "unknown"}`;
    return productQuantities[key] || 0;
  };

  // Increase product quantity and add to cart
  const increaseQuantity = (productId) => {
    const key = `${productId}_${selectedShop?.name || "unknown"}`;
    const newQuantity = (productQuantities[key] || 0) + 1;
    setProductQuantities((prev) => ({
      ...prev,
      [key]: newQuantity,
    }));

    // Find the product to add to cart
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    const existingItem = cart.find(
      (item) => item.id === productId && item.shopName === selectedShop?.name
    );
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.id === productId && item.shopName === selectedShop?.name
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([
        ...cart,
        {
          ...product,
          quantity: 1,
          shopName: selectedShop?.name || "Unknown Shop",
        },
      ]);
    }
  };

  // Decrease product quantity and update cart
  const decreaseQuantity = (productId) => {
    const key = `${productId}_${selectedShop?.name || "unknown"}`;
    const currentQuantity = productQuantities[key] || 0;
    if (currentQuantity === 0) return;

    const newQuantity = currentQuantity - 1;
    setProductQuantities((prev) => ({
      ...prev,
      [key]: newQuantity,
    }));

    // Update cart - decrease by 1 or remove if quantity becomes 0
    const existingItem = cart.find(
      (item) => item.id === productId && item.shopName === selectedShop?.name
    );
    if (existingItem) {
      if (existingItem.quantity > 1) {
        setCart(
          cart.map((item) =>
            item.id === productId && item.shopName === selectedShop?.name
              ? { ...item, quantity: item.quantity - 1 }
              : item
          )
        );
      } else {
        // Remove from cart if quantity becomes 0
        setCart(
          cart.filter(
            (item) =>
              !(item.id === productId && item.shopName === selectedShop?.name)
          )
        );
      }
    }
  };

  // Handle add to cart - adds current quantity to cart
  const handleAddToCart = (product) => {
    const quantity = getProductQuantity(product.id);
    if (quantity === 0) {
      // If quantity is 0, just increase it by 1 (same as clicking +)
      increaseQuantity(product.id);
      return;
    }

    const existingItem = cart.find(
      (item) => item.id === product.id && item.shopName === selectedShop?.name
    );
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.id === product.id && item.shopName === selectedShop?.name
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      );
    } else {
      setCart([
        ...cart,
        {
          ...product,
          quantity,
          shopName: selectedShop?.name || "Unknown Shop",
        },
      ]);
    }

    // Reset the product quantity after adding to cart
    setProductQuantities((prev) => ({
      ...prev,
      [product.id]: 0,
    }));
  };

  // Reset quantity to 0 and remove from cart
  const resetQuantity = (productId) => {
    const key = `${productId}_${selectedShop?.name || "unknown"}`;
    setProductQuantities((prev) => ({
      ...prev,
      [key]: 0,
    }));

    // Remove from cart
    setCart(
      cart.filter(
        (item) =>
          !(item.id === productId && item.shopName === selectedShop?.name)
      )
    );
  };

  // Handle cart click - navigate to cart page
  const handleCartClick = () => {
    router.push("/user/cart");
  };

  // Open simulation modal for a product
  const openSimulation = (product) => {
    setSimulationProduct(product);
    // preset values based on type
    if (product.category === "Resistor") {
      setSimResistance(1000);
      setSimVoltage(5);
    } else if (product.category === "Transistors") {
      setSimVoltage(5);
    } else {
      setSimVoltage(5);
    }
    setSimulationOpen(true);
  };

  const closeSimulation = () => {
    setSimulationOpen(false);
    setSimulationProduct(null);
  };

  // Check if product is favorited
  const isFavorite = (productId) => {
    return favorites.some(
      (fav) => fav.id === productId && fav.shopName === selectedShop?.name
    );
  };

  // Toggle favorite
  const toggleFavorite = (product) => {
    const productWithShop = {
      ...product,
      shopName: selectedShop?.name,
      image: product.image,
    };

    const isFav = isFavorite(product.id);

    let updatedFavorites;
    if (isFav) {
      // Remove from favorites
      updatedFavorites = favorites.filter(
        (fav) => !(fav.id === product.id && fav.shopName === selectedShop?.name)
      );
    } else {
      // Add to favorites
      updatedFavorites = [...favorites, productWithShop];
    }

    setFavorites(updatedFavorites);
    localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
  };

  // Mock products data
  const products = [
    {
      id: 1,
      name: "109 kΩ ±1% Resistor",
      image: "/resistors.png",
      specs: "1/4W, 1% Tolerance, Through-Hole",
      time: "20 mins",
      price: 24,
      category: "Resistor",
    },
    {
      id: 2,
      name: "220 kΩ ±1% Resistor",
      image: "/resistors.png",
      specs: "1/4W, 1% Tolerance, Through-Hole",
      time: "20 mins",
      price: 24,
      category: "Resistor",
    },
    {
      id: 3,
      name: "BC547 Transistor",
      image: "/transistors.png",
      specs: "NPN, 45V, 100mA",
      time: "20 mins",
      price: 15,
      category: "Transistors",
    },
    {
      id: 4,
      name: "Arduino Uno Board",
      image: "/arduino.png",
      specs: "ATmega328P, USB Interface",
      time: "25 mins",
      price: 450,
      category: "Boards",
    },
  ];

  const filteredProducts = products.filter(
    (product) => product.category === selectedCategory
  );

  const CATEGORIES = [
    { key: "Resistor", label: "Resistors", image: "/resistors.png" },
    { key: "Transistors", label: "Transistors", image: "/transistors.png" },
    { key: "Boards", label: "Boards", image: "/arduino.png" },
  ];

  const q = query.trim().toLowerCase();
  const visibleShops = q
    ? shops.filter((s) => `${s.name} ${s.addr}`.toLowerCase().includes(q))
    : shops;
  const visibleProducts = q
    ? products.filter((p) => `${p.name} ${p.specs} ${p.category}`.toLowerCase().includes(q))
    : filteredProducts;

  const cartItems = cart.reduce((n, i) => n + (i.quantity || 0), 0);
  const cartTotal = cart.reduce((n, i) => n + (i.price || 0) * (i.quantity || 0), 0);
  const firstName = (currentUser?.name || "").split(" ")[0];

  const openCategory = (key) => {
    setSelectedCategory(key);
    if (shops.length > 0) handleShopClick(shops[0]);
  };

  return (
    <div className="min-h-screen bg-surface pb-28">
      <AppHeader role="user" cartCount={cartItems} />

      {!shopPageOpen ? (
        <Page>
          {/* ---------- WELCOME + SEARCH ---------- */}
          <section className="relative overflow-hidden rounded-3xl bg-brand-900 px-5 py-7 text-white sm:px-8 sm:py-9">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(55% 80% at 100% 0%, rgb(20 184 166 / .45), transparent 70%), radial-gradient(50% 70% at 0% 100%, rgb(59 111 230 / .6), transparent 70%)",
              }}
            />
            <div className="relative">
              <p className="flex items-center gap-1.5 text-sm text-brand-100">
                <MapPin size={15} /> Delivering to VIT, Sangam Nagar, Wadala
              </p>
              <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
                {firstName ? `Hi ${firstName}, what are you building today?` : "What are you building today?"}
              </h1>
              <div className="mt-5 flex max-w-2xl items-center gap-3 rounded-2xl bg-white px-4 shadow-lift ring-1 ring-black/5">
                <Search size={20} className="shrink-0 text-muted" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search shops or parts, e.g. resistor"
                  className="h-13 w-full bg-transparent text-[15px] text-ink outline-none placeholder:text-slate-400"
                  aria-label="Search shops or parts"
                />
                {query && (
                  <button onClick={() => setQuery("")} className="text-muted hover:text-ink" aria-label="Clear search">
                    <X size={18} />
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* ---------- QUICK ACTIONS ---------- */}
          <section className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <QuickAction
              icon={Camera}
              title="Identify by photo"
              text="Snap a part and find who stocks it"
              onClick={handlePhotoUploadClick}
            />
            <QuickAction
              icon={Bot}
              title="Ask the AI assistant"
              text="Specs, alternatives and project help"
              onClick={() => router.push("/ai-chatbot")}
            />
            <QuickAction icon={FileText} title="Upload a parts list" text="Order a whole BOM at once" soon />
          </section>

          {/* ---------- CATEGORIES ---------- */}
          <section className="mt-10">
            <SectionTitle>Shop by category</SectionTitle>
            <div className="grid grid-cols-3 gap-3 sm:max-w-xl">
              {CATEGORIES.map((c) => (
                <button
                  key={c.key}
                  onClick={() => openCategory(c.key)}
                  className="card card-hover group flex flex-col items-center gap-3 p-4 text-center"
                >
                  <span className="grid h-16 w-16 place-items-center overflow-hidden rounded-2xl bg-surface">
                    <img src={c.image} alt="" className="h-full w-full object-cover transition group-hover:scale-105" />
                  </span>
                  <span className="text-sm font-semibold text-ink">{c.label}</span>
                </button>
              ))}
            </div>
          </section>

          {/* ---------- NEARBY SHOPS ---------- */}
          <section className="mt-10">
            <SectionTitle
              action={<span className="text-sm text-muted">{visibleShops.length} open now</span>}
            >
              Nearby shops
            </SectionTitle>
            {visibleShops.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {visibleShops.map((shop) => (
                  <button
                    key={shop.id || shop.name}
                    onClick={() => handleShopClick(shop)}
                    className="card card-hover group flex items-center gap-4 p-4 text-left"
                  >
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-lg font-bold text-white">
                      {shop.name?.[0] || "S"}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold text-ink">{shop.name}</span>
                      <span className="mt-0.5 block truncate text-xs text-muted">{shop.addr || "Address not added"}</span>
                      <span className="badge mt-2 h-6 bg-accent-50 text-accent-700">
                        <Clock size={12} /> {shop.time}
                      </span>
                    </span>
                    <ChevronRight size={18} className="shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-brand-500" />
                  </button>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Store}
                title={q ? "No shops match your search" : "No shops yet"}
                text={q ? "Try a different name." : "New shops will appear here as soon as they join."}
              />
            )}
          </section>
        </Page>
      ) : (
        /* ---------- SHOP PAGE ---------- */
        <Page>
          <div className="card mb-6 flex flex-wrap items-center gap-4 p-4 sm:p-5">
            <button onClick={handleBackFromShop} className="btn btn-secondary btn-icon shrink-0" aria-label="Back to shops">
              <ArrowLeft size={18} />
            </button>
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-lg font-bold text-white">
              {selectedShop?.name?.[0] || "S"}
            </span>
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-xl font-bold tracking-tight text-ink">{selectedShop?.name}</h1>
              <p className="truncate text-sm text-muted">{selectedShop?.addr}</p>
            </div>
            <span className="badge h-7 bg-accent-50 px-3 text-accent-700">
              <Clock size={14} /> Delivery in {selectedShop?.time}
            </span>
          </div>

          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
              {CATEGORIES.map((c) => {
                const active = !q && selectedCategory === c.key;
                return (
                  <button
                    key={c.key}
                    onClick={() => {
                      setQuery("");
                      setSelectedCategory(c.key);
                    }}
                    className={`flex h-11 shrink-0 items-center gap-2 rounded-full border pl-1.5 pr-4 text-sm font-semibold transition ${
                      active
                        ? "border-brand-600 bg-brand-600 text-white"
                        : "border-line bg-white text-ink-soft hover:border-slate-300"
                    }`}
                  >
                    <img src={c.image} alt="" className="h-8 w-8 rounded-full object-cover" />
                    {c.label}
                  </button>
                );
              })}
            </div>
            <div className="flex h-11 items-center gap-2 rounded-xl border border-line bg-white px-3 sm:w-72">
              <Search size={18} className="text-muted" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search in this shop"
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                aria-label="Search in this shop"
              />
            </div>
          </div>

          {visibleProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
              {visibleProducts.map((product) => {
                const qty = getProductQuantity(product.id);
                const fav = isFavorite(product.id);
                return (
                  <div key={product.id} className="card card-hover flex flex-col overflow-hidden">
                    <div className="relative aspect-[4/3] bg-surface">
                      <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                      <button
                        onClick={() => toggleFavorite(product)}
                        className="absolute right-2.5 top-2.5 grid h-9 w-9 place-items-center rounded-full bg-white/95 shadow-card transition hover:scale-105"
                        aria-label={fav ? "Remove from favourites" : "Add to favourites"}
                        aria-pressed={fav}
                      >
                        <Heart size={17} className={fav ? "text-red-500" : "text-slate-400"} fill={fav ? "currentColor" : "none"} />
                      </button>
                      <span className="badge absolute bottom-2.5 left-2.5 bg-white/95 text-ink-soft shadow-card">
                        <Clock size={12} /> {product.time}
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col p-3.5 sm:p-4">
                      <h3 className="text-sm font-semibold leading-snug text-ink">{product.name}</h3>
                      <p className="mt-1 line-clamp-2 text-xs text-muted">{product.specs}</p>
                      <div className="mt-auto flex items-center justify-between gap-2 pt-4">
                        <span className="text-lg font-bold text-ink">₹{product.price}</span>
                        {qty === 0 ? (
                          <button onClick={() => increaseQuantity(product.id)} className="btn btn-soft btn-sm px-4">
                            <Plus size={15} /> Add
                          </button>
                        ) : (
                          <div className="flex h-8 items-center rounded-[10px] bg-brand-600 text-white">
                            <button
                              onClick={() => decreaseQuantity(product.id)}
                              className="grid h-8 w-8 place-items-center rounded-l-[10px] hover:bg-brand-700"
                              aria-label={`Remove one ${product.name}`}
                            >
                              <Minus size={15} />
                            </button>
                            <span className="w-6 text-center text-sm font-bold tabular-nums" aria-live="polite">
                              {qty}
                            </span>
                            <button
                              onClick={() => increaseQuantity(product.id)}
                              className="grid h-8 w-8 place-items-center rounded-r-[10px] hover:bg-brand-700"
                              aria-label={`Add one ${product.name}`}
                            >
                              <Plus size={15} />
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
                        <button
                          onClick={() => openSimulation(product)}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700"
                        >
                          <Zap size={14} /> Try simulation
                        </button>
                        {qty > 0 && (
                          <button
                            onClick={() => resetQuantity(product.id)}
                            className="text-xs font-medium text-muted hover:text-red-600"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState icon={Search} title="No parts match your search" text="Try a different part name or value." />
          )}
        </Page>
      )}

      {/* ---------- FLOATING CART BAR ---------- */}
      {cartItems > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-30 px-4 pb-4 sm:pb-6">
          <button
            onClick={handleCartClick}
            className="mx-auto flex w-full max-w-xl animate-fade-up items-center gap-3 rounded-2xl bg-ink px-4 py-3 text-left text-white shadow-pop transition hover:bg-slate-800"
          >
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/10">
              <ShoppingCart size={20} />
            </span>
            <span className="flex-1">
              <span className="block text-sm font-semibold">
                {cartItems} item{cartItems === 1 ? "" : "s"} · ₹{cartTotal}
              </span>
              <span className="hidden text-xs text-slate-300 sm:block">Delivery fee added at checkout</span>
            </span>
            <span className="inline-flex items-center gap-1 text-sm font-semibold">
              View cart <ChevronRight size={18} />
            </span>
          </button>
        </div>
      )}

      {/* ---------- PHOTO UPLOAD MODAL ---------- */}
      <Modal open={photoModalOpen} onClose={handlePhotoModalClose} title="Identify a part by photo" icon={Camera} maxWidth="max-w-md">
        {!imagePreview ? (
          <div
            className="cursor-pointer rounded-2xl border-2 border-dashed border-brand-200 bg-brand-50/50 px-6 py-10 text-center transition hover:border-brand-400 hover:bg-brand-50"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => document.getElementById("photo-upload-input").click()}
            role="button"
            tabIndex={0}
          >
            <span className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-white text-brand-600 shadow-card">
              <Upload size={26} />
            </span>
            <p className="font-semibold text-ink">Click or drag a photo here</p>
            <p className="mt-1 text-sm text-muted">JPG or PNG of a single component works best</p>
            <input id="photo-upload-input" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
          </div>
        ) : (
          <div>
            <div className="relative overflow-hidden rounded-2xl bg-surface">
              <img src={imagePreview} alt="Uploaded component" className="h-60 w-full object-cover" />
              <button
                onClick={() => {
                  setImagePreview(null);
                  setUploadedImage(null);
                  setDetectionResult(null);
                }}
                className="absolute right-2.5 top-2.5 grid h-9 w-9 place-items-center rounded-full bg-white/95 text-ink shadow-card hover:text-red-600"
                aria-label="Remove photo"
              >
                <X size={18} />
              </button>
            </div>

            {!detectionResult && (
              <button onClick={handleAnalyzeImage} disabled={isAnalyzing} className="btn btn-primary btn-lg mt-4 w-full">
                {isAnalyzing ? (
                  <>
                    <Spinner size={16} /> Analyzing photo…
                  </>
                ) : (
                  "Detect component"
                )}
              </button>
            )}

            {detectionResult && detectionResult.success && (
              <div className="mt-5 space-y-3">
                <p className="flex items-center gap-2 text-sm font-semibold text-green-700">
                  <CheckCircle size={18} /> We found {detectionResult.results.length} possible matches
                </p>
                {detectionResult.results.map((result, idx) => (
                  <div key={idx} className="rounded-2xl border border-line p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-ink">{result.componentName}</p>
                        <div className="mt-1.5 flex items-center gap-2">
                          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-100">
                            <div className="h-full rounded-full bg-accent-500" style={{ width: `${result.confidence}%` }} />
                          </div>
                          <span className="text-xs text-muted">{result.confidence}% match</span>
                        </div>
                      </div>
                      <span className="text-base font-bold text-ink">₹{result.price}</span>
                    </div>
                    {result.available ? (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {result.shops.map((shop, i) => (
                          <span key={i} className="badge bg-green-50 text-green-700">
                            <Store size={12} /> {shop}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-3 flex items-center gap-1 text-sm text-red-600">
                        <AlertCircle size={16} /> Not available nearby
                      </p>
                    )}
                  </div>
                ))}
                <button onClick={handlePhotoModalClose} className="btn btn-primary btn-lg w-full">
                  Browse shops
                </button>
              </div>
            )}

            {detectionResult && !detectionResult.success && (
              <div className="mt-4">
                <Alert>Could not detect any components. Please try another photo.</Alert>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* ---------- SIMULATION MODAL ---------- */}
      <Modal
        open={simulationOpen && !!simulationProduct}
        onClose={closeSimulation}
        title={simulationProduct ? `Simulate: ${simulationProduct.name}` : ""}
        icon={Zap}
        maxWidth="max-w-2xl"
      >
        {simulationProduct && (
          <div className="grid gap-6 md:grid-cols-[1fr_1.2fr]">
            <div className="space-y-5">
              <div>
                <div className="flex items-center justify-between">
                  <label className="field-label mb-0" htmlFor="sim-voltage">Voltage</label>
                  <span className="text-sm font-semibold tabular-nums text-ink">{simVoltage} V</span>
                </div>
                <input
                  id="sim-voltage"
                  type="range"
                  min={0}
                  max={12}
                  value={simVoltage}
                  onChange={(e) => setSimVoltage(Number(e.target.value))}
                  className="mt-2 w-full accent-brand-600"
                />
              </div>

              {simulationProduct.category === "Resistor" && (
                <div>
                  <div className="flex items-center justify-between">
                    <label className="field-label mb-0" htmlFor="sim-resistance">Resistance</label>
                    <span className="text-sm font-semibold tabular-nums text-ink">{simResistance.toLocaleString()} Ω</span>
                  </div>
                  <input
                    id="sim-resistance"
                    type="range"
                    min={10}
                    max={100000}
                    step={10}
                    value={simResistance}
                    onChange={(e) => setSimResistance(Number(e.target.value))}
                    className="mt-2 w-full accent-brand-600"
                  />
                </div>
              )}

              <label className="flex cursor-pointer items-center justify-between rounded-xl border border-line px-4 py-3">
                <span className="text-sm font-semibold text-ink">Power</span>
                <span className="relative inline-flex">
                  <input type="checkbox" checked={simOn} onChange={(e) => setSimOn(e.target.checked)} className="peer sr-only" />
                  <span className="h-6 w-11 rounded-full bg-slate-200 transition peer-checked:bg-accent-500" />
                  <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition peer-checked:translate-x-5" />
                </span>
              </label>

              <p className="text-sm text-muted">
                Category: <span className="font-medium text-ink">{simulationProduct.category}</span>. Change the values and toggle
                power to see how the LED responds.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-900 p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Breadboard preview</p>
              <svg viewBox="0 0 260 120" className="w-full" xmlns="http://www.w3.org/2000/svg">
                <rect x="10" y="10" width="240" height="100" rx="8" fill="#f8fafc" stroke="#e5e7eb" />
                <rect x="18" y="20" width="8" height="80" fill="#fde68a" />
                <rect x="234" y="20" width="8" height="80" fill="#bfdbfe" />
                {(() => {
                  let brightness = 0;
                  if (simOn) {
                    if (simulationProduct.category === "Resistor") {
                      const r = Math.max(1, simResistance);
                      brightness = Math.min(1, simVoltage / (r / 1000 + simVoltage));
                    } else if (simulationProduct.category === "Transistors") {
                      brightness = simVoltage > 1.5 ? 1 : 0.1;
                    } else {
                      brightness = simVoltage > 0 ? 0.7 : 0;
                    }
                  }
                  const fill = `rgba(255,99,71,${0.2 + 0.8 * brightness})`;
                  return (
                    <g>
                      {brightness > 0.3 && <circle cx="130" cy="60" r={26 + 10 * brightness} fill={`rgba(255,99,71,${0.25 * brightness})`} />}
                      <circle cx="130" cy="60" r="18" fill={fill} stroke="#ef4444" strokeWidth="2" />
                      <line x1="130" y1="78" x2="130" y2="98" stroke="#374151" strokeWidth="2" />
                      <text x="130" y="30" fontSize="11" textAnchor="middle" fill="#374151">LED</text>
                    </g>
                  );
                })()}
              </svg>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function QuickAction({ icon: Icon, title, text, onClick, soon }) {
  return (
    <button
      onClick={onClick}
      disabled={soon}
      className={`card flex items-center gap-4 p-4 text-left ${soon ? "cursor-default opacity-70" : "card-hover"}`}
    >
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
        <Icon size={22} />
      </span>
      <span className="min-w-0">
        <span className="flex items-center gap-2 text-sm font-semibold text-ink">
          {title}
          {soon && <span className="badge h-5 bg-slate-100 px-2 text-[10px] text-muted">Soon</span>}
        </span>
        <span className="mt-0.5 block text-xs text-muted">{text}</span>
      </span>
    </button>
  );
}
