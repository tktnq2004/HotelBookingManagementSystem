import { useState, useEffect, useCallback } from "react";
import authService from "../services/auth.service";

// ─── useAuth HOOK ─────────────────────────────────────────────────────────────
// Quản lý trạng thái đăng nhập toàn app
// Usage:
//   const { user, loading, login, logout, register } = useAuth();

export default function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ── Khởi tạo: load user từ localStorage khi app start ──
  useEffect(() => {
    const savedUser = authService.getCurrentUser();
    if (savedUser && authService.isLoggedIn()) {
      setUser(savedUser);
    }
    setLoading(false);
  }, []);

  // ── Đăng nhập ──
  const login = useCallback(async ({ email, password }) => {
    setError(null);
    setLoading(true);
    try {
      const userData = await authService.login({ email, password });
      setUser(userData);
      return userData;
    } catch (err) {
      const msg = err.response?.data?.message || "Login failed. Please try again.";
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Đăng ký ──
  const register = useCallback(async ({ name, email, phone, password }) => {
    setError(null);
    setLoading(true);
    try {
      const result = await authService.register({ name, email, phone, password });
      return result;
    } catch (err) {
      const msg = err.response?.data?.message || "Registration failed. Please try again.";
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Đăng xuất ──
  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await authService.logout();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setUser(null);
      setLoading(false);
    }
  }, []);

  // ── Quên mật khẩu ──
  const forgotPassword = useCallback(async (email) => {
    setError(null);
    setLoading(true);
    try {
      const result = await authService.forgotPassword(email);
      return result;
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to send reset link.";
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Reset mật khẩu ──
  const resetPassword = useCallback(async ({ token, newPassword }) => {
    setError(null);
    setLoading(true);
    try {
      const result = await authService.resetPassword({ token, newPassword });
      return result;
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to reset password.";
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Cập nhật profile ──
  const updateProfile = useCallback(async (data) => {
    setError(null);
    setLoading(true);
    try {
      const result = await authService.updateProfile(data);
      setUser(result.user);
      return result;
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to update profile.";
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Clear error ──
  const clearError = useCallback(() => setError(null), []);

  return {
    // State
    user,
    loading,
    error,

    // Computed
    isLoggedIn: !!user,
    isAdmin: user?.role === "admin",

    // Actions
    login,
    logout,
    register,
    forgotPassword,
    resetPassword,
    updateProfile,
    clearError,
  };
}