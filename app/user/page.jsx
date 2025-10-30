"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  User,
  Upload,
  FileText,
  Bot,
  X,
  Camera,
  CheckCircle,
  AlertCircle,
  Mic,
  Filter,
  ArrowUpDown,
  Clock,
  ShoppingCart,
  ArrowLeft,
  Plus,
  Minus,
  Heart,
} from "lucide-react";

export default function Page() {
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

    // Subscribe to Server-Sent Events for live additions
    const es = new EventSource("/api/shops/stream");
    es.onmessage = (e) => {
      try {
        const d = JSON.parse(e.data);
        // Ignore connection acknowledgements
        if (!d || !d.name) return;

        setShops((prev) => {
          // avoid duplicates by id or name
          if (d.id && prev.some((s) => s.id === d.id)) return prev;
          if (!d.id && prev.some((s) => s.name === d.name)) return prev;
          return [
            { name: d.name, addr: d.addr || "", time: d.time || "Just now", id: d.id },
            ...prev,
          ];
        });
      } catch (err) {
        // ignore parse errors
      }
    };

    es.onerror = () => {
      // If SSE fails, we'll keep the fetched list. EventSource auto-reconnects.
    };

    return () => {
      mounted = false;
      try {
        es.close();
      } catch (e) {}
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

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center font-sans pb-10">
      {/* Conditionally render main page or shop page */}
      {!shopPageOpen ? (
        <>
          {/* ---------- HEADER ---------- */}
          <header className="w-full bg-[#5A8DEE] text-white px-5 py-4 rounded-b-3xl shadow-md">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-lg font-semibold flex items-center gap-2">
                  <img
                    src="/ElectroDash.png"
                    alt="ElectroDash"
                    className="w-6 h-6"
                  />
                  ElectroDash
                </h1>
                <p className="text-sm opacity-90">23 minutes</p>
                <p className="text-xs opacity-80">
                  HOME – VIT, Sangam Nagar, Wadala (Raj)
                </p>
              </div>
              <div
                className="bg-white/20 p-2 rounded-full cursor-pointer"
                onClick={handleProfileClick}
              >
                <User size={22} />
              </div>
            </div>

            {/* ---------- SEARCH BAR ---------- */}
            <div className="mt-4">
              <div className="flex items-center bg-white text-gray-700 rounded-xl px-4 py-2 shadow-md">
                <Search size={18} className="text-gray-500" />
                <input
                  type="text"
                  placeholder='Search "resistor"'
                  className="w-full ml-3 outline-none text-sm bg-transparent"
                />
              </div>
            </div>
          </header>

          {/* ---------- UPLOAD OPTIONS ---------- */}
          <div className="flex justify-center gap-4 mt-6">
            <button
              className="bg-white shadow-md p-4 rounded-2xl flex flex-col items-center w-24 hover:scale-105 transition"
              onClick={handlePhotoUploadClick}
            >
              <Upload className="text-[#5A8DEE]" size={24} />
              <span className="text-xs mt-2 font-medium text-gray-700 text-center hover:pointer">
                Upload Photos
              </span>
            </button>

            <button className="bg-white shadow-md p-4 rounded-2xl flex flex-col items-center w-24 hover:scale-105 transition">
              <FileText className="text-[#5A8DEE]" size={24} />
              <span className="text-xs mt-2 font-medium text-gray-700 text-center hover:pointer">
                Upload List
              </span>
            </button>

            <button
              className="bg-white shadow-md p-4 rounded-2xl flex flex-col items-center w-24 hover:scale-105 transition"
              onClick={() => router.push("/ai-chatbot")}
            >
              <Bot className="text-[#5A8DEE]" size={24} />
              <span className="text-xs mt-2 font-medium text-gray-700 text-center hover:pointer">
                AI Chatbot
              </span>
            </button>
          </div>

          {/* ---------- TOP CATEGORIES ---------- */}
          <section className="w-full px-5 mt-8">
            <h2 className="text-lg font-semibold mb-3 text-gray-800">
              Top Categories
            </h2>
            <div className="flex justify-start gap-4 overflow-x-auto">
              <div className="bg-[#D9F3F0] rounded-2xl shadow-md px-4 py-3 min-w-[100px] flex flex-col items-center">
                <img
                  src="/resistors.png"
                  alt="Resistor"
                  className="w-15 h-15 rounded-xl"
                />
                <span className="text-sm font-medium mt-2">Resistors</span>
              </div>
              <div className="bg-[#D9F3F0] rounded-2xl shadow-md px-4 py-3 min-w-[100px] flex flex-col items-center">
                <img
                  src="/transistors.png"
                  alt="Transistor"
                  className="w-15 h-15 rounded-xl"
                />
                <span className="text-sm font-medium mt-2">Transistors</span>
              </div>
              <div className="bg-[#D9F3F0] rounded-2xl shadow-md px-4 py-3 min-w-[100px] flex flex-col items-center">
                <img
                  src="/arduino.png"
                  alt="Boards"
                  className="w-15 h-15 rounded-xl"
                />
                <span className="text-sm font-medium mt-2">Boards</span>
              </div>
            </div>
          </section>

          {/* ---------- NEARBY SHOPS ---------- */}
          <section className="w-full px-5 mt-8">
            <h2 className="text-lg font-semibold mb-3 text-gray-800">
              Nearby Shops
            </h2>
            <div className="space-y-4">
              {shops && shops.length > 0 ? (
                shops.map((shop) => (
                  <div
                    key={shop.id || shop.name}
                    className="bg-white shadow-md rounded-2xl p-4 flex justify-between items-center hover:scale-[1.01] transition cursor-pointer"
                    onClick={() => handleShopClick(shop)}
                  >
                    <div>
                      <p className="font-semibold text-gray-800">{shop.name}</p>
                      <p className="text-xs text-gray-500">{shop.addr}</p>
                    </div>
                    <span className="bg-[#40E0D0] text-white text-xs font-semibold px-3 py-1 rounded-full">
                      {shop.time}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No shops available</p>
              )}
            </div>
          </section>
        </>
      ) : (
        /* ---------- SHOP SHOPPING PAGE ---------- */
        <div className="w-full min-h-screen bg-[#5A8DEE]">
          {/* Header with back button */}
          <div className="px-5 py-4 flex items-center gap-3 text-white">
            <button
              onClick={handleBackFromShop}
              className="hover:bg-white/20 rounded-full p-2 transition"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-lg font-semibold">{selectedShop?.name}</h1>
              <p className="text-xs opacity-80">{selectedShop?.addr}</p>
            </div>
            <div
              className="ml-auto relative cursor-pointer hover:bg-white/20 rounded-full p-2 transition"
              onClick={handleCartClick}
            >
              <ShoppingCart size={24} />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {cart.length}
                </span>
              )}
            </div>
          </div>

          {/* Search bar with voice */}
          <div className="px-5 pb-4">
            <div className="flex items-center bg-white text-gray-700 rounded-xl px-4 py-3 shadow-md">
              <Search size={18} className="text-gray-500" />
              <input
                type="text"
                placeholder='Search "resistor"'
                className="w-full ml-3 outline-none text-sm bg-transparent"
              />
              <Mic
                size={20}
                className="text-gray-500 cursor-pointer hover:text-[#5A8DEE]"
              />
            </div>
          </div>

          {/* Main content area */}
          <div className="bg-white rounded-t-3xl min-h-screen px-5 pt-5">
            {/* Top Categories */}
            <div className="flex justify-start gap-3 overflow-x-auto mb-5 pb-2">
              <div
                className={`rounded-2xl shadow-md px-6 py-4 min-w-[120px] flex flex-col items-center cursor-pointer transition ${
                  selectedCategory === "Resistor"
                    ? "bg-[#A8E6A1] border-2 border-green-600"
                    : "bg-[#D9F3F0]"
                }`}
                onClick={() => setSelectedCategory("Resistor")}
              >
                <img
                  src="/resistors.png"
                  alt="Resistor"
                  className="w-12 h-12"
                />
                <span className="text-sm font-bold mt-2">Resistor</span>
              </div>
              <div
                className={`rounded-2xl shadow-md px-6 py-4 min-w-[120px] flex flex-col items-center cursor-pointer transition ${
                  selectedCategory === "Transistors"
                    ? "bg-[#D9E8F5] border-2 border-blue-600"
                    : "bg-[#D9F3F0]"
                }`}
                onClick={() => setSelectedCategory("Transistors")}
              >
                <img
                  src="/transistors.png"
                  alt="Transistor"
                  className="w-12 h-12"
                />
                <span className="text-sm font-bold mt-2">Transistors</span>
              </div>
              <div
                className={`rounded-2xl shadow-md px-6 py-4 min-w-[120px] flex flex-col items-center cursor-pointer transition ${
                  selectedCategory === "Boards"
                    ? "bg-[#F5E8D9] border-2 border-orange-600"
                    : "bg-[#D9F3F0]"
                }`}
                onClick={() => setSelectedCategory("Boards")}
              >
                <img
                  src="https://cdn-icons-png.flaticon.com/512/2521/2521673.png"
                  alt="Boards"
                  className="w-12 h-12"
                />
                <span className="text-sm font-bold mt-2">Boards</span>
              </div>
            </div>

            {/* Filters and Sort */}
            <div className="flex gap-3 mb-5">
              <button className="flex items-center gap-2 border-2 border-[#5A8DEE] text-[#5A8DEE] px-4 py-2 rounded-xl font-semibold hover:bg-[#5A8DEE] hover:text-white transition">
                <Filter size={18} />
                Filters
              </button>
              <button className="flex items-center gap-2 border-2 border-[#5A8DEE] text-[#5A8DEE] px-4 py-2 rounded-xl font-semibold hover:bg-[#5A8DEE] hover:text-white transition">
                <ArrowUpDown size={18} />
                Sort by
              </button>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-2 gap-4 pb-6">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white border-2 border-gray-200 rounded-2xl p-4 shadow-md hover:shadow-xl transition relative"
                >
                  {/* Favorite Heart Icon */}
                  <button
                    onClick={() => toggleFavorite(product)}
                    className="absolute top-3 right-3 bg-white/90 hover:bg-white rounded-full p-2 shadow-md transition z-10"
                  >
                    <Heart
                      size={18}
                      className={
                        isFavorite(product.id)
                          ? "text-red-500"
                          : "text-gray-400"
                      }
                      fill={isFavorite(product.id) ? "currentColor" : "none"}
                    />
                  </button>

                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-32 object-contain mb-3"
                  />
                  <h3 className="font-bold text-sm text-gray-800 mb-1">
                    {product.name}
                  </h3>
                  <p className="text-xs text-gray-600 mb-2">{product.specs}</p>
                  <div className="flex items-center gap-1 text-xs text-gray-600 mb-3">
                    <Clock size={14} />
                    <span>{product.time}</span>
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[#5A8DEE] font-bold text-lg">
                      ₹{product.price}
                    </span>
                  </div>
                  {/* Quantity Controls */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 border-2 border-gray-300 rounded-lg p-1">
                      <button
                        onClick={() => decreaseQuantity(product.id)}
                        className="bg-gray-200 hover:bg-gray-300 rounded p-1 transition"
                        disabled={getProductQuantity(product.id) === 0}
                      >
                        <Minus size={16} />
                      </button>
                      <span className="font-semibold text-lg w-8 text-center">
                        {getProductQuantity(product.id)}
                      </span>
                      <button
                        onClick={() => increaseQuantity(product.id)}
                        className="bg-[#5A8DEE] hover:bg-[#4A7DDE] text-white rounded p-1 transition"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    {getProductQuantity(product.id) > 0 && (
                      <button
                        onClick={() => resetQuantity(product.id)}
                        className="bg-red-500 text-white font-bold px-3 py-2 rounded-lg hover:bg-red-600 transition text-sm"
                      >
                        RESET
                      </button>
                    )}
                  </div>
                  {/* Show Simulation Button */}
                  <div className="mt-3">
                    <button
                      onClick={() => openSimulation(product)}
                      className="w-full mt-2 border-2 border-[#5A8DEE] text-[#5A8DEE] px-3 py-2 rounded-lg font-semibold hover:bg-[#5A8DEE] hover:text-white transition text-sm"
                    >
                      Show Simulation
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ---------- PHOTO UPLOAD MODAL ---------- */}
      {photoModalOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-linear-to-r from-[#5A8DEE] to-[#40E0D0] text-white px-6 py-4 rounded-t-3xl flex justify-between items-center">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Camera size={24} />
                Upload Component Photo
              </h3>
              <button
                onClick={handlePhotoModalClose}
                className="hover:bg-white/20 rounded-full p-1 transition"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Upload Area */}
              {!imagePreview ? (
                <div
                  className="border-3 border-dashed border-[#5A8DEE] rounded-2xl p-8 text-center bg-linear-to-br from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 transition cursor-pointer"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() =>
                    document.getElementById("photo-upload-input").click()
                  }
                >
                  <Upload className="mx-auto text-[#5A8DEE] mb-4" size={48} />
                  <p className="text-gray-700 font-semibold mb-2">
                    Click or drag to upload
                  </p>
                  <p className="text-sm text-gray-500">
                    Upload a photo of your hardware component
                  </p>
                  <input
                    id="photo-upload-input"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>
              ) : (
                <div>
                  {/* Image Preview */}
                  <div className="relative rounded-2xl overflow-hidden shadow-lg mb-4">
                    <img
                      src={imagePreview}
                      alt="Uploaded component"
                      className="w-full h-64 object-cover"
                    />
                    <button
                      onClick={() => {
                        setImagePreview(null);
                        setUploadedImage(null);
                        setDetectionResult(null);
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* Analyze Button */}
                  {!detectionResult && (
                    <button
                      onClick={handleAnalyzeImage}
                      disabled={isAnalyzing}
                      className="w-full bg-linear-to-r from-[#5A8DEE] to-[#40E0D0] text-white py-3 rounded-xl font-semibold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isAnalyzing ? (
                        <span className="flex items-center justify-center gap-2">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          Analyzing...
                        </span>
                      ) : (
                        "Detect Component"
                      )}
                    </button>
                  )}

                  {/* Detection Results */}
                  {detectionResult && detectionResult.success && (
                    <div className="mt-4 space-y-3">
                      <div className="flex items-center gap-2 text-green-600 font-semibold mb-3">
                        <CheckCircle size={24} />
                        <span>Components Detected!</span>
                      </div>

                      {detectionResult.results.map((result, idx) => (
                        <div
                          key={idx}
                          className="bg-linear-to-r from-green-50 to-cyan-50 rounded-xl p-4 border border-green-200"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-bold text-gray-800">
                                {result.componentName}
                              </h4>
                              <p className="text-sm text-gray-600">
                                Confidence: {result.confidence}%
                              </p>
                            </div>
                            <span className="bg-[#40E0D0] text-white text-xs font-bold px-3 py-1 rounded-full">
                              ₹{result.price}
                            </span>
                          </div>

                          {result.available ? (
                            <div>
                              <p className="text-sm text-green-700 font-semibold mb-1">
                                Available at:
                              </p>
                              <ul className="text-sm text-gray-700 space-y-1">
                                {result.shops.map((shop, i) => (
                                  <li
                                    key={i}
                                    className="flex items-center gap-2"
                                  >
                                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                    {shop}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ) : (
                            <p className="text-sm text-red-600 flex items-center gap-1">
                              <AlertCircle size={16} />
                              Not available
                            </p>
                          )}
                        </div>
                      ))}

                      <button
                        onClick={handlePhotoModalClose}
                        className="w-full bg-linear-to-r from-[#5A8DEE] to-[#40E0D0] text-white py-3 rounded-xl font-semibold hover:shadow-lg transition mt-4"
                      >
                        Browse Shops
                      </button>
                    </div>
                  )}

                  {detectionResult && !detectionResult.success && (
                    <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-2 text-red-700">
                      <AlertCircle size={20} />
                      <p>
                        Could not detect any components. Please try another
                        image.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ---------- SIMULATION MODAL ---------- */}
      {simulationOpen && simulationProduct && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">
                Simulation: {simulationProduct.name}
              </h3>
              <button
                onClick={closeSimulation}
                className="rounded-full p-2 hover:bg-gray-100"
              >
                <X />
              </button>
            </div>

            {/* Controls */}
            <div className="mb-4 grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Voltage (V)</label>
                <input
                  type="range"
                  min={0}
                  max={12}
                  value={simVoltage}
                  onChange={(e) => setSimVoltage(Number(e.target.value))}
                  className="w-full mt-2"
                />
                <div className="text-sm mt-1">{simVoltage} V</div>
              </div>

              {simulationProduct.category === "Resistor" && (
                <div>
                  <label className="text-sm font-medium">Resistance (Ω)</label>
                  <input
                    type="range"
                    min={10}
                    max={100000}
                    step={10}
                    value={simResistance}
                    onChange={(e) => setSimResistance(Number(e.target.value))}
                    className="w-full mt-2"
                  />
                  <div className="text-sm mt-1">
                    {simResistance.toLocaleString()} Ω
                  </div>
                </div>
              )}
            </div>

            {/* Circuit switch and visualization */}
            <div className="flex gap-6 items-start">
              <div className="w-1/3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={simOn}
                    onChange={(e) => setSimOn(e.target.checked)}
                  />
                  <span className="text-sm">Power</span>
                </label>

                <div className="mt-4 text-sm text-gray-600">
                  <p>Category: {simulationProduct.category}</p>
                  <p className="mt-2">
                    Toggle power to see the effect on the component.
                  </p>
                </div>
              </div>

              <div className="flex-1">
                {/* Simple visual: LED that changes brightness based on voltage and resistance */}
                <div className="flex flex-col items-center gap-4">
                  <div className="w-full bg-gray-100 rounded-lg p-4 flex flex-col items-center">
                    <div className="mb-3 text-sm text-gray-700">
                      Breadboard Preview
                    </div>
                    <svg
                      width="260"
                      height="120"
                      viewBox="0 0 260 120"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <rect
                        x="10"
                        y="10"
                        width="240"
                        height="100"
                        rx="8"
                        fill="#f8fafc"
                        stroke="#e5e7eb"
                      />
                      {/* Power rails */}
                      <rect
                        x="18"
                        y="20"
                        width="8"
                        height="80"
                        fill="#fde68a"
                      />
                      <rect
                        x="234"
                        y="20"
                        width="8"
                        height="80"
                        fill="#bfdbfe"
                      />

                      {/* LED simulation - a circle whose fill opacity represents brightness */}
                      {(() => {
                        const on = simOn;
                        let brightness = 0;
                        if (on) {
                          if (simulationProduct.category === "Resistor") {
                            // simple inverse relation to resistance
                            const r = Math.max(1, simResistance);
                            brightness = Math.min(
                              1,
                              simVoltage / (r / 1000 + simVoltage)
                            );
                          } else if (
                            simulationProduct.category === "Transistors"
                          ) {
                            // transistor: quick on/off depending on voltage
                            brightness = simVoltage > 1.5 ? 1 : 0.1;
                          } else {
                            // boards or others: show moderate indicator
                            brightness = simVoltage > 0 ? 0.7 : 0;
                          }
                        } else {
                          brightness = 0;
                        }

                        const fill = `rgba(255,99,71,${
                          0.2 + 0.8 * brightness
                        })`;
                        return (
                          <g>
                            <circle
                              cx="130"
                              cy="60"
                              r="18"
                              fill={fill}
                              stroke="#ef4444"
                              strokeWidth="2"
                            />
                            <line
                              x1="130"
                              y1="78"
                              x2="130"
                              y2="98"
                              stroke="#374151"
                              strokeWidth="2"
                            />
                            <text
                              x="130"
                              y="20"
                              fontSize="12"
                              textAnchor="middle"
                              fill="#374151"
                            >
                              LED
                            </text>
                          </g>
                        );
                      })()}
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
