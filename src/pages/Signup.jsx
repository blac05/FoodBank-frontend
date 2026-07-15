import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";

const ROLES = [
  { id: "donor", label: "Donor", copy: "Restaurant, grocer, farm, or individual" },
  { id: "volunteer", label: "Volunteer", copy: "Driver, sorter, or organizer" },
  { id: "recipient", label: "Recipient", copy: "Shop for groceries privately" },
];

export default function Signup() {
  const { signup, loading, error } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState("recipient");
  const [form, setForm] = useState({ fullName: "", email: "", password: "" });

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const user = await signup({ ...form, role });
      const destination = { donor: "/donor", volunteer: "/volunteer", recipient: "/shop" }[user.role];
      navigate(destination);
    } catch {
      // error is surfaced via context
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
        <h1 className="font-display text-2xl text-mist">Create your account</h1>
        <p className="text-muted text-sm mt-2">Pick the role that fits how you'll use Food Bank.</p>

        <div className="grid grid-cols-3 gap-2 mt-6">
          {ROLES.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setRole(r.id)}
              className={`text-left p-3 rounded-xl2 border transition-colors ${
                role === r.id
                  ? "border-rescue bg-rescue/10 text-mist"
                  : "border-white/10 text-muted hover:border-white/25"
              }`}
            >
              <div className="font-display text-sm">{r.label}</div>
            </button>
          ))}
        </div>
        <p className="text-xs text-muted mt-2">
          {ROLES.find((r) => r.id === role)?.copy}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            className="input-field"
            placeholder="Full name"
            value={form.fullName}
            onChange={(e) => update("fullName", e.target.value)}
            required
          />
          <input
            className="input-field"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            required
          />
          <input
            className="input-field"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
            required
            minLength={8}
          />

          {error && <p className="text-sm text-amberflag">{error}</p>}

          <button type="submit" disabled={loading} className="glow-btn w-full">
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="text-sm text-muted mt-6 text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-rescue hover:underline">
            Log in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
