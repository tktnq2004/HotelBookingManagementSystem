import api from "./api";

// ─── AUTH SERVICE ─────────────────────────────────────────────────────────────
const authService = {

  // Đăng ký
  register: async ({ name, email, phone, password }) => {
    const res = await api.post("/auth/register", { name, email, phone, password });
    return res.data;
  },

  // Đăng nhập
  login: async ({ email, password }) => {
    const res = await api.post("/auth/login", { email, password });
    const { accessToken, refreshToken, user } = res.data;

    // Lưu token vào localStorage
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("user", JSON.stringify(user));

    return user;
  },

  // Đăng xuất
  logout: async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        await api.post("/auth/logout", { refreshToken });
      }
    } catch (error) {
      // Bỏ qua lỗi khi logout
      console.error("Logout error:", error);
    } finally {
      // Xóa token dù có lỗi hay không
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
    }
  },

  // Lấy thông tin user hiện tại
  getCurrentUser: () => {
    try {
      const user = localStorage.getItem("user");
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  },

  // Kiểm tra đã đăng nhập chưa
  isLoggedIn: () => {
    return !!localStorage.getItem("accessToken");
  },

  // Quên mật khẩu
  forgotPassword: async (email) => {
    const res = await api.post("/auth/forgot-password", { email });
    return res.data;
  },

  // Reset mật khẩu
  resetPassword: async ({ token, newPassword }) => {
    const res = await api.post("/auth/reset-password", { token, newPassword });
    return res.data;
  },

  // Refresh token thủ công (nếu cần)
  refreshToken: async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) throw new Error("No refresh token");

    const res = await api.post("/auth/refresh", { refreshToken });
    const { accessToken } = res.data;
    localStorage.setItem("accessToken", accessToken);
    return accessToken;
  },

  // Lấy profile user
  getProfile: async () => {
    const res = await api.get("/auth/profile");
    return res.data;
  },

  // Cập nhật profile
  updateProfile: async (data) => {
    const res = await api.put("/auth/profile", data);
    // Cập nhật lại user trong localStorage
    localStorage.setItem("user", JSON.stringify(res.data.user));
    return res.data;
  },
};

export default authService;