import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import TiltCard from "../components/TiltCard";
import AnimatedStat from "../components/AnimatedStat";

export default function VolunteerDashboard() {
  const { user } = useAuth();
  const [available, setAvailable] = useState([]);
  const [mine, setMine] = useState([]);
  const [busyId, setBusyId] = useState(null);

  async function loadAll() {
    const [availableRes, mineRes] = await Promise.all([
      api.get("/missions/available"),
      api.get("/missions/mine"),
    ]);
    setAvailable(availableRes.data.missions);
    setMine(mineRes.data.missions);
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function acceptMission(id) {
    setBusyId(id);
    try {
      await api.post(`/missions/${id}/accept`);
      await loadAll();
    } finally {
      setBusyId(null);
    }
  }

  async function advanceMission(id, status) {
    setBusyId(id);
    try {
      await api.patch(`/missions/${id}/status`, { status });
      await loadAll();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="px-6 md:px-10 py-10 max-w-5xl mx-auto">
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-display text-3xl text-mist"
      >
        Ready to rescue, {user?.fullName?.split(" ")[0]}?
      </motion.h1>
      <p className="text-muted mt-2">Missions are ranked by how soon the food will spoil.</p>

      <div className="grid md:grid-cols-2 gap-8 mt-8">
        <TiltCard className="p-6" glow="rescue">
          <h2 className="font-display text-lg text-mist mb-4">Available missions</h2>
          <div className="space-y-3">
            {available.length === 0 && <p className="text-muted text-sm">No missions available right now.</p>}
            <AnimatePresence initial={false}>
              {available.map((m, i) => (
                <motion.div
                  key={m._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: i * 0.05 }}
                  className="border border-white/10 rounded-xl2 p-4"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-display text-sm text-mist">
                      {m.donation?.items?.map((it) => it.name).join(", ")}
                    </span>
                    <span className="text-xs font-mono text-amberflag">
                      urgency {m.donation?.urgencyScore ?? "—"}
                    </span>
                  </div>
                  <p className="text-xs text-muted mt-1">{m.donation?.pickupAddress}</p>
                  <p className="text-xs text-rescue mt-1">
                    ~{m.estimatedImpact.mealsProvided} meals · {m.estimatedImpact.co2eSavedKg}kg CO2e
                  </p>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => acceptMission(m._id)}
                    disabled={busyId === m._id}
                    className="glow-btn text-sm py-2 px-4 mt-3"
                  >
                    {busyId === m._id ? "Accepting…" : "Accept mission"}
                  </motion.button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </TiltCard>

        <TiltCard className="p-6" glow="signal">
          <h2 className="font-display text-lg text-mist mb-4">Your missions</h2>
          <div className="space-y-3">
            {mine.length === 0 && <p className="text-muted text-sm">You haven't accepted any missions yet.</p>}
            <AnimatePresence initial={false}>
              {mine.map((m, i) => (
                <motion.div
                  key={m._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="border border-white/10 rounded-xl2 p-4"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-display text-sm text-mist">
                      {m.donation?.items?.map((it) => it.name).join(", ")}
                    </span>
                    <span className="text-xs font-mono uppercase text-signal">{m.status}</span>
                  </div>
                  <p className="text-xs text-muted mt-1">{m.donation?.pickupAddress}</p>

                  {m.status === "accepted" && (
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={() => advanceMission(m._id, "picked_up")}
                      disabled={busyId === m._id}
                      className="ghost-btn text-sm py-2 px-4 mt-3"
                    >
                      Confirm pickup
                    </motion.button>
                  )}
                  {m.status === "picked_up" && (
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={() => advanceMission(m._id, "delivered")}
                      disabled={busyId === m._id}
                      className="glow-btn text-sm py-2 px-4 mt-3"
                    >
                      Confirm delivery
                    </motion.button>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </TiltCard>
      </div>

      <TiltCard className="p-6 mt-8 flex gap-10" glow="rescue">
        <AnimatedStat value={user?.impactStats?.missionsCompleted ?? 0} label="Missions completed" />
        <AnimatedStat value={user?.impactStats?.mealsProvided ?? 0} label="Meals provided" />
        <AnimatedStat value={user?.impactStats?.co2eSavedKg ?? 0} suffix="kg" label="CO2e saved" />
      </TiltCard>
    </div>
  );
}
