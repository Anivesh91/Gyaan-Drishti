import React, { createContext, useState, useContext, useEffect } from "react";
import API from "../utils/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) loadUser();
    else setLoading(false);
  }, []);

  const loadUser = async () => {
    try {
      const res = await API.get("/auth/me");
      setUser(res.data.user);
    } catch { localStorage.removeItem("token"); }
    setLoading(false);
  };

  const login = async (email, password) => {
    try {
      const res = await API.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      setUser(res.data.user);
      return { success: true, user: res.data.user };
    } catch (err) { return { success: false, message: err.response?.data?.message || "Login failed" }; }
  };

  const register = async (data) => {
    try {
      const res = await API.post("/auth/register", data);
      return { success: true, message: res.data.message };
    } catch (err) { return { success: false, message: err.response?.data?.message || "Registration failed" }; }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  const forgotPassword = async (email) => {
    try {
      const res = await API.post("/auth/forgot-password", { email });
      return { success: true, message: res.data.message };
    } catch (err) { return { success: false, message: err.response?.data?.message }; }
  };

  const resetPassword = async (token, password) => {
    try {
      const res = await API.post(`/auth/reset-password/${token}`, { password });
      return { success: true, message: res.data.message };
    } catch (err) { return { success: false, message: err.response?.data?.message }; }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, forgotPassword, resetPassword, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
