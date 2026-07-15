import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import RescueOrb from "../components/RescueOrb";
import TiltCard from "../components/TiltCard";
import AnimatedStat from "../components/AnimatedStat";
import { api } from "../api/client";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: "easeOut" },
  }),
};

export default function Landing() {
  const [impact, setImpact] = useState(null);

  useEffect(() => {
    api
      .get("/impact/global")
      .then(({ data }) => setImpact(data))
      .catch(() => setImpact(null)); // fall back to placeholders below if the API isn't reachable yet
  }, []);

  return (
    <div className="relative overflow-hidden">
      <section className="relative min-h-[calc(100vh-88px)] flex items-center px-6 md:px-10">
        <div className="absolute inset-0 md:right-[-8%] md:left-auto md:w-[60%] opacity-90 pointer-events-none">
          <RescueOrb className="w-full h-full pointer-events-auto" />
        </div>

        <div className="relative z-10 max-w-xl">
          <motion.span
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="stat-ring-label text-rescue"
          >
            Food rescue, rebuilt
          </motion.span>

          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={1}
            className="font-display text-5xl md:text-6xl font-bold mt-4 leading-[1.05] text-mist"
          >
            Waste, rescued.
            <br />
            Dignity, <span className="text-rescue">delivered.</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={2}
            className="mt-6 text-muted text-lg leading-relaxed max-w-md"
          >
            Food Bank connects surplus from restaurants, grocers, and farms to
            the people who need it — routed by AI, picked up by volunteers,
            and collected with total privacy.
          </motion.p>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={3}
            className="mt-10 flex flex-wrap gap-4"
          >
            <Link to="/signup" className="glow-btn">
              Join Food Bank
            </Link>
            <Link to="/login" className="ghost-btn">
              I already have an account
            </Link>
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={4}
            className="mt-14 flex gap-10"
          >
            <AnimatedStat
              value={impact?.mealsProvided ?? 0}
              suffix="+"
              label="Meals rescued"
            />
            <AnimatedStat
              value={impact?.co2eSavedTonnes ?? 0}
              decimals={1}
              suffix="t"
              label="CO2e prevented"
            />
            <AnimatedStat
              value={impact?.activeHubs ?? 0}
              label="Active hubs"
            />
          </motion.div>
        </div>
      </section>

      <section className="relative z-10 px-6 md:px-10 pb-24 grid md:grid-cols-3 gap-6">
        <RoleCard
          index={0}
          eyebrow="For donors"
          title="List surplus in under 60 seconds"
          copy="Scan a crate, confirm the AI's read, and route it to rescue — no spreadsheets, no phone calls."
          to="/signup"
        />
        <RoleCard
          index={1}
          eyebrow="For volunteers"
          title="Missions ranked by what's about to spoil"
          copy="AI prioritizes rescue routes by urgency, not first-come-first-served, so nothing goes to waste."
          to="/signup"
          glow="signal"
        />
        <RoleCard
          index={2}
          eyebrow="For recipients"
          title="Shop like anyone else would"
          copy="Browse, choose your dietary needs, and pick up privately from a 24/7 smart locker."
          to="/signup"
        />
      </section>
    </div>
  );
}

function RoleCard({ eyebrow, title, copy, to, index, glow = "rescue" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link to={to}>
        <TiltCard glow={glow} className="p-6 group h-full">
          <span className={`stat-ring-label ${glow === "signal" ? "text-signal" : "text-signal"}`}>
            {eyebrow}
          </span>
          <h3 className="font-display text-xl mt-3 text-mist group-hover:text-rescue transition-colors">
            {title}
          </h3>
          <p className="text-muted mt-3 text-sm leading-relaxed">{copy}</p>
        </TiltCard>
      </Link>
    </motion.div>
  );
}
