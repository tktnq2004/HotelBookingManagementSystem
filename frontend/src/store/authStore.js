import { useState, useEffect, useCallback, createContext, useContext } from "react";
import authService from "../services/auth.service";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const userData = await authService.getMe();
        setUser(userData);
      } catch {
        try {
          await authService.refresh();
          const userData = await authService.getMe();
          setUser(userData);
        } catch {
          await authService.logout();
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    };

    init();
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

  const clearError = useCallback(() => setError(null), []);

  const value = {
    // State
    user,
    loading,
    error,

    // Computed
    isLoggedIn: !!user,
    isAdmin: user?.role === "admin",

    login,
    logout,
    register,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthStore() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthStore must be used inside <AuthProvider>");
  }
  return context;
}

export default AuthContext;