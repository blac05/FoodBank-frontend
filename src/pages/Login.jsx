import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const user = await login(email, password);
      const destination = { donor: "/donor", volunteer: "/volunteer", recipient: "/shop", admin: "/donor" }[user.role];
      navigate(destination);
    } catch {
      // error surfaced via context
    }
  }

  return (
    <div className="min-h-[calc(100vh-88px)] flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="glass-panel w-full max-w-md p-8"
      >
        <h1 className="font-display text-2xl text-mist">Welcome back</h1>
        <p className="text-muted text-sm mt-2">Log in to your Food Bank account.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            className="input-field"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="input-field"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <p className="text-sm text-amberflag">{error}</p>}

          <button type="submit" disabled={loading} className="glow-btn w-full">
            {loading ? "Logging in…" : "Log in"}
          </button>
        </form>

        <p className="text-sm text-muted mt-6 text-center">
          New to Food Bank?{" "}
          <Link to="/signup" className="text-rescue hover:underline">
            Create an account
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
