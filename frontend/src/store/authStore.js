import { useState, useEffect, useCallback, createContext, useContext } from "react";
import authService from "../services/auth.service";

// ─── AUTH CONTEXT ─────────────────────────────────────────────────────────────
const AuthContext = createContext(null);

// ─── AUTH PROVIDER ────────────────────────────────────────────────────────────
// Wrap toàn bộ app bằng AuthProvider để dùng auth state ở bất kỳ component nào
// Usage trong index.js:
//   <AuthProvider>
//     <App />
//   </AuthProvider>

export function AuthProvider({ children }) {
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
      return await authService.forgotPassword(email);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to send reset link.";
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

  const clearError = useCallback(() => setError(null), []);

  const value = {
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
    updateProfile,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── useAuthStore HOOK ────────────────────────────────────────────────────────
// Dùng trong bất kỳ component nào cần auth state
// Usage:
//   const { user, isLoggedIn, isAdmin, login, logout } = useAuthStore();

export function useAuthStore() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthStore must be used inside <AuthProvider>");
  }
  return context;
}

export default AuthContext;