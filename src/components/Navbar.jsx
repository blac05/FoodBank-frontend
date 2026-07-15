import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import logoSrc from "../assets/logo.jpg";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 12);
    }
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function handleLogout() {
    logout();
    navigate("/");
  }

  const dashboardPath = user
    ? { donor: "/donor", volunteer: "/volunteer", recipient: "/shop", admin: "/donor" }[user.role]
    : "/";

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className={`sticky top-0 z-50 flex items-center justify-between px-6 md:px-10 py-4 transition-all duration-300 ${
        scrolled ? "backdrop-blur-lg bg-obsidian/70 border-b border-white/10" : "bg-transparent"
      }`}
    >
      <Link to="/" className="flex items-center gap-3 group">
        <motion.img
          src={logoSrc}
          alt="Food Bank logo"
          whileHover={{ rotate: 8, scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
          className="w-9 h-9 rounded-full shadow-glow"
        />
        <span className="font-display text-lg tracking-tight text-mist">
          Food<span className="text-rescue">Bank</span>
        </span>
      </Link>

      <div className="flex items-center gap-3">
        {user ? (
          <>
            <Link to={dashboardPath} className="ghost-btn text-sm py-2 px-4">
              {user.fullName.split(" ")[0]}'s Dashboard
            </Link>
            <button onClick={handleLogout} className="text-sm text-muted hover:text-mist transition-colors">
              Log out
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="ghost-btn text-sm py-2 px-4">
              Log in
            </Link>
            <Link to="/signup" className="glow-btn text-sm py-2 px-4">
              Get started
            </Link>
          </>
        )}
      </div>
    </motion.nav>
  );
}
