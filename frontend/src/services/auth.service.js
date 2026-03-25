import api from "./api";

const authService = {

  register: async ({ name, email, phone, password }) => {
    const res = await api.post("/auth/register", { name, email, phone, password });
    return res.data;
  },

  login: async ({ email, password }) => {
    const res = await api.post("/auth/login", { email, password });

    const { accessToken } = res.data;
    localStorage.setItem("accessToken", accessToken);

    const me = await api.get("/auth/me");
    localStorage.setItem("user", JSON.stringify(me.data));

    return me.data;
  },

  refresh: async () => {
    const res = await api.post("/auth/refresh");
    const { accessToken } = res.data;

    localStorage.setItem("accessToken", accessToken);
    return accessToken;
  },

  logout: async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
    }
  },

  getCurrentUser: () => {
    try {
      const user = localStorage.getItem("user");
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  },

  isLoggedIn: () => !!localStorage.getItem("accessToken"),

  getMe: async () => {
    const res = await api.get("/auth/me");
    return res.data;
  },
};

export default authService;