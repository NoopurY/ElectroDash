"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit2,
  Save,
  X,
  Camera,
  Shield,
  LogOut,
} from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    avatar: "",
  });
  const [originalData, setOriginalData] = useState({});
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    
    if (!token || !userData) {
      router.push("/login");
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== "user") {
      router.push("/login");
      return;
    }

    setUser(parsedUser);
    const data = {
      name: parsedUser.name || "",
      email: parsedUser.email || "",
      phone: parsedUser.phone || "",
      avatar: parsedUser.avatar || "",
    };
    setProfileData(data);
    setOriginalData(data);
  }, [router]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setProfileData(originalData);
    setIsEditing(false);
  };

  const handleSave = () => {
    // Update user data in localStorage
    const updatedUser = {
      ...user,
      ...profileData,
    };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);
    setOriginalData(profileData);
    setIsEditing(false);
    setSaveSuccess(true);
    
    // Hide success message after 3 seconds
    setTimeout(() => {
      setSaveSuccess(false);
    }, 3000);
  };

  const handleInputChange = (field, value) => {
    setProfileData({
      ...profileData,
      [field]: value,
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const getJoinDate = () => {
    // Mock join date - you can store this in user data
    return "October 2024";
  };

  const getOrderStats = () => {
    const orderHistory = JSON.parse(localStorage.getItem("orderHistory") || "[]");
    return {
      totalOrders: orderHistory.length,
      totalSpent: orderHistory.reduce((sum, order) => sum + (order.total || 0), 0),
    };
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-4 border-[#5A8DEE] border-t-transparent rounded-full animate-spin"></div>
          <div className="text-xl text-[#5A8DEE] font-semibold">Loading profile...</div>
        </div>
      </div>
    );
  }

  const stats = getOrderStats();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#5A8DEE] to-[#40E0D0] shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/user/dashboard")}
                className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition"
              >
                <ArrowLeft className="text-white" size={24} />
              </button>
              <div className="flex items-center gap-3">
                <Image src="/ElectroDash.png" alt="ElectroDash" width={40} height={40} className="rounded-lg" />
                <div>
                  <h1 className="text-2xl font-bold text-white">My Profile</h1>
                  <p className="text-white/80 text-sm">Manage your account</p>
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Success Message */}
        {saveSuccess && (
          <div className="mb-6 bg-green-50 border-2 border-green-500 rounded-xl p-4 flex items-center gap-3 animate-fade-in">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <Save className="text-white" size={18} />
            </div>
            <div>
              <p className="font-semibold text-green-800">Profile Updated Successfully!</p>
              <p className="text-sm text-green-600">Your changes have been saved.</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 text-center">
              {/* Avatar */}
              <div className="relative inline-block mb-4">
                <div className="w-32 h-32 bg-gradient-to-br from-[#5A8DEE] to-[#40E0D0] rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                  {profileData.avatar ? (
                    <img src={profileData.avatar} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    profileData.name?.charAt(0).toUpperCase() || "U"
                  )}
                </div>
                {isEditing && (
                  <button className="absolute bottom-0 right-0 bg-[#5A8DEE] hover:bg-[#4A7DDE] text-white p-2 rounded-full shadow-lg transition">
                    <Camera size={18} />
                  </button>
                )}
              </div>

              <h2 className="text-2xl font-bold text-gray-800 mb-1">{profileData.name || "User"}</h2>
              <p className="text-gray-600 mb-4">{profileData.email}</p>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-2xl font-bold text-[#5A8DEE]">{stats.totalOrders}</p>
                  <p className="text-xs text-gray-600">Total Orders</p>
                </div>
                <div className="bg-green-50 rounded-lg p-3">
                  <p className="text-2xl font-bold text-green-600">₹{stats.totalSpent}</p>
                  <p className="text-xs text-gray-600">Total Spent</p>
                </div>
              </div>

              {/* Member Since */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-center gap-2 text-gray-700">
                  <Calendar size={16} />
                  <span className="text-sm">Member since {getJoinDate()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Profile Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <User size={20} className="text-[#5A8DEE]" />
                  Personal Information
                </h3>
                {!isEditing ? (
                  <button
                    onClick={handleEdit}
                    className="flex items-center gap-2 px-4 py-2 bg-[#5A8DEE] hover:bg-[#4A7DDE] text-white rounded-lg transition"
                  >
                    <Edit2 size={16} />
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleCancel}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition"
                    >
                      <X size={16} />
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition"
                    >
                      <Save size={16} />
                      Save
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <User size={16} />
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#5A8DEE] focus:outline-none transition"
                      placeholder="Enter your name"
                    />
                  ) : (
                    <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-800">
                      {profileData.name || "Not set"}
                    </div>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Mail size={16} />
                    Email Address
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#5A8DEE] focus:outline-none transition"
                      placeholder="Enter your email"
                    />
                  ) : (
                    <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-800">
                      {profileData.email || "Not set"}
                    </div>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Phone size={16} />
                    Phone Number
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#5A8DEE] focus:outline-none transition"
                      placeholder="Enter your phone number"
                    />
                  ) : (
                    <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-800">
                      {profileData.phone || "Not set"}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Account Settings */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Shield size={20} className="text-[#5A8DEE]" />
                Account Settings
              </h3>
              
              <div className="space-y-3">
                <button 
                  onClick={() => router.push("/user/change-password")}
                  className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition">
                      <Shield size={20} className="text-blue-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-gray-800">Change Password</p>
                      <p className="text-xs text-gray-500">Update your password</p>
                    </div>
                  </div>
                  <ArrowLeft className="text-gray-400 rotate-180" size={20} />
                </button>

                <button 
                  onClick={() => router.push("/user/dashboard")}
                  className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition">
                      <MapPin size={20} className="text-purple-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-gray-800">Saved Addresses</p>
                      <p className="text-xs text-gray-500">Manage delivery addresses</p>
                    </div>
                  </div>
                  <ArrowLeft className="text-gray-400 rotate-180" size={20} />
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-between p-4 bg-red-50 hover:bg-red-100 rounded-lg transition group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center group-hover:bg-red-200 transition">
                      <LogOut size={20} className="text-red-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-red-600">Logout</p>
                      <p className="text-xs text-red-500">Sign out of your account</p>
                    </div>
                  </div>
                  <ArrowLeft className="text-red-400 rotate-180" size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
