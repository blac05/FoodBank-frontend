import { motion } from "framer-motion";
import { useAnimatedCounter } from "../hooks/useAnimatedCounter";

export default function AnimatedStat({ value, decimals = 0, prefix = "", suffix = "", label }) {
  const { ref, display } = useAnimatedCounter(value, { decimals });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <div className="font-display text-2xl text-mist">
        {prefix}
        {display}
        {suffix}
      </div>
      <div className="stat-ring-label mt-1">{label}</div>
    </motion.div>
  );
}
