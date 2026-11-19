"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, CheckCircle, Shield } from "lucide-react";
import { Alert, AppHeader, Field, Page, PageLoader, PageTitle, Spinner } from "@/components/ui";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

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
  }, [router]);

  const handleInputChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });
    // Clear error for this field
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: "",
      });
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords({
      ...showPasswords,
      [field]: !showPasswords[field],
    });
  };

  const validateForm = () => {
    const newErrors = {};

    // Check if current password is entered
    if (!formData.currentPassword) {
      newErrors.currentPassword = "Current password is required";
    }

    // Check if new password is entered
    if (!formData.newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters";
    }

    // Check if passwords match
    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    // Check if new password is different from current
    if (formData.currentPassword === formData.newPassword) {
      newErrors.newPassword =
        "New password must be different from current password";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        setErrors({ [data.field || "newPassword"]: data.error || "Could not change password" });
        return;
      }

      setSuccess(true);

      // Reset form
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push("/user/profile");
      }, 2000);
    } catch (err) {
      setErrors({ newPassword: "Network error, please try again" });
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: "", color: "" };

    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    if (strength <= 2) return { strength, label: "Weak", color: "bg-red-500" };
    if (strength <= 3)
      return { strength, label: "Medium", color: "bg-yellow-500" };
    return { strength, label: "Strong", color: "bg-green-500" };
  };

  const passwordStrength = getPasswordStrength(formData.newPassword);

  if (!user) {
    return (
      <div className="min-h-screen bg-surface">
        <AppHeader role="user" />
        <PageLoader />
      </div>
    );
  }

  const PasswordInput = ({ field, label, id, autoComplete, children }) => (
    <Field label={label} htmlFor={id} error={errors[field]}>
      <div className="relative">
        <input
          id={id}
          type={showPasswords[field === "currentPassword" ? "current" : field === "newPassword" ? "new" : "confirm"] ? "text" : "password"}
          autoComplete={autoComplete}
          value={formData[field]}
          onChange={(e) => handleInputChange(field, e.target.value)}
          className={`input pr-11 ${errors[field] ? "input-error" : ""}`}
          disabled={success || loading}
        />
        <button
          type="button"
          onClick={() =>
            togglePasswordVisibility(field === "currentPassword" ? "current" : field === "newPassword" ? "new" : "confirm")
          }
          className="absolute inset-y-0 right-0 grid w-11 place-items-center text-muted hover:text-ink"
          aria-label="Show or hide password"
        >
          {showPasswords[field === "currentPassword" ? "current" : field === "newPassword" ? "new" : "confirm"] ? (
            <EyeOff size={18} />
          ) : (
            <Eye size={18} />
          )}
        </button>
      </div>
      {children}
    </Field>
  );

  const strengthTone =
    passwordStrength.label === "Weak"
      ? "text-red-600"
      : passwordStrength.label === "Medium"
      ? "text-amber-600"
      : "text-green-600";

  return (
    <div className="min-h-screen bg-surface">
      <AppHeader role="user" />
      <Page className="max-w-2xl">
        <PageTitle back="/user/profile" title="Change password" subtitle="Choose a strong password you don’t use anywhere else." />

        {success && (
          <div className="mb-5 animate-fade-up">
            <Alert tone="success">
              <span className="flex items-center gap-2 font-semibold">
                <CheckCircle size={18} /> Password changed. Taking you back to your profile…
              </span>
            </Alert>
          </div>
        )}

        <form onSubmit={handleSubmit} className="card space-y-5 p-5 sm:p-6">
          {PasswordInput({ field: "currentPassword", label: "Current password", id: "pw-current", autoComplete: "current-password" })}

          {PasswordInput({
            field: "newPassword",
            label: "New password",
            id: "pw-new",
            autoComplete: "new-password",
            children: formData.newPassword ? (
              <div className="mt-2.5">
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <span
                      key={n}
                      className={`h-1.5 flex-1 rounded-full transition ${
                        n <= passwordStrength.strength ? passwordStrength.color : "bg-slate-200"
                      }`}
                    />
                  ))}
                </div>
                <p className={`mt-1.5 text-xs font-medium ${strengthTone}`}>{passwordStrength.label} password</p>
              </div>
            ) : null,
          })}

          {PasswordInput({ field: "confirmPassword", label: "Confirm new password", id: "pw-confirm", autoComplete: "new-password" })}

          <div className="rounded-xl bg-surface px-4 py-3">
            <p className="flex items-center gap-2 text-sm font-semibold text-ink">
              <Shield size={16} className="text-brand-600" /> Tips for a strong password
            </p>
            <ul className="mt-2 grid gap-1 text-xs text-muted sm:grid-cols-2">
              <li>• At least 8 characters</li>
              <li>• Upper and lower case letters</li>
              <li>• Numbers and symbols</li>
              <li>• Not reused from another site</li>
            </ul>
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-line pt-5 sm:flex-row sm:justify-end">
            <button type="button" onClick={() => router.push("/user/profile")} className="btn btn-ghost" disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={success || loading}>
              {loading ? (
                <>
                  <Spinner size={16} /> Updating…
                </>
              ) : (
                "Update password"
              )}
            </button>
          </div>
        </form>
      </Page>
    </div>
  );
}
