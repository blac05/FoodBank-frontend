import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../api/client";

const AuthContext = createContext(null);

function persistSession(data) {
  localStorage.setItem("foodbank_token", data.accessToken);
  localStorage.setItem("foodbank_refresh_token", data.refreshToken);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("foodbank_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) localStorage.setItem("foodbank_user", JSON.stringify(user));
    else localStorage.removeItem("foodbank_user");
  }, [user]);

  async function signup(payload) {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post("/auth/signup", payload);
      persistSession(data);
      setUser(data.user);
      return data.user;
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function login(email, password) {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      persistSession(data);
      setUser(data.user);
      return data.user;
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    try {
      // Best-effort: invalidate the refresh token server-side. Don't block
      // the local logout on this — if it fails, the token still expires
      // naturally in 30 days, and the client-side session is gone either way.
      await api.post("/auth/logout");
    } catch {
      // ignore — logging out locally still succeeds
    } finally {
      localStorage.removeItem("foodbank_token");
      localStorage.removeItem("foodbank_refresh_token");
      setUser(null);
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, error, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}