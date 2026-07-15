import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

/**
 * Wraps children in a card that tilts in 3D toward the cursor on hover -
 * a lightweight CSS-transform equivalent of the R3F hero, used anywhere
 * a full WebGL canvas would be overkill (grids of cards, dashboard tiles).
 */
export default function TiltCard({ children, className = "", glow = "rescue" }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), { stiffness: 200, damping: 20 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), { stiffness: 200, damping: 20 });

  function handleMouseMove(e) {
    const bounds = ref.current.getBoundingClientRect();
    x.set((e.clientX - bounds.left) / bounds.width - 0.5);
    y.set((e.clientY - bounds.top) / bounds.height - 0.5);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  const glowClass = glow === "signal" ? "hover:shadow-glowBlue" : "hover:shadow-glow";

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformPerspective: 800 }}
      className={`glass-panel transition-shadow duration-300 ${glowClass} ${className}`}
    >
      {children}
    </motion.div>
  );
}
