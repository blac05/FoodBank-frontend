import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import TiltCard from "../components/TiltCard";

const emptyItem = { name: "", quantity: 1, unit: "unit", category: "general" };

export default function DonorDashboard() {
  const { user } = useAuth();
  const [donations, setDonations] = useState([]);
  const [items, setItems] = useState([{ ...emptyItem }]);
  const [pickupAddress, setPickupAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  async function loadDonations() {
    const { data } = await api.get("/donations/mine");
    setDonations(data.donations);
  }

  useEffect(() => {
    loadDonations();
  }, []);

  function updateItem(index, field, value) {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  }

  function addItemRow() {
    setItems((prev) => [...prev, { ...emptyItem }]);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);
    try {
      await api.post("/donations", { items, pickupAddress });
      setFeedback({ type: "success", text: "Donation listed — nearby volunteers have been notified." });
      setItems([{ ...emptyItem }]);
      setPickupAddress("");
      loadDonations();
    } catch (err) {
      setFeedback({ type: "error", text: err.response?.data?.message || "Failed to list donation" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="px-6 md:px-10 py-10 max-w-5xl mx-auto">
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-display text-3xl text-mist"
      >
        Welcome, {user?.fullName?.split(" ")[0]}
      </motion.h1>
      <p className="text-muted mt-2">Log a new donation or track what's already in motion.</p>

      <div className="grid md:grid-cols-2 gap-8 mt-8">
        <TiltCard className="p-6 space-y-4" glow="rescue">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="font-display text-lg text-mist">New donation</h2>

            <AnimatePresence initial={false}>
              {items.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="grid grid-cols-3 gap-2"
                >
                  <input
                    className="input-field col-span-2"
                    placeholder="Item (e.g. Bread loaves)"
                    value={item.name}
                    onChange={(e) => updateItem(i, "name", e.target.value)}
                    required
                  />
                  <input
                    className="input-field"
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(i, "quantity", Number(e.target.value))}
                  />
                </motion.div>
              ))}
            </AnimatePresence>

            <button type="button" onClick={addItemRow} className="text-sm text-signal hover:underline">
              + Add another item
            </button>

            <input
              className="input-field"
              placeholder="Pickup address"
              value={pickupAddress}
              onChange={(e) => setPickupAddress(e.target.value)}
              required
            />

            <AnimatePresence>
              {feedback && (
                <motion.p
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`text-sm ${feedback.type === "success" ? "text-rescue" : "text-amberflag"}`}
                >
                  {feedback.text}
                </motion.p>
              )}
            </AnimatePresence>

            <motion.button
              type="submit"
              disabled={submitting}
              whileTap={{ scale: 0.98 }}
              className="glow-btn w-full"
            >
              {submitting ? "Listing…" : "List donation"}
            </motion.button>
          </form>
        </TiltCard>

        <TiltCard className="p-6" glow="signal">
          <h2 className="font-display text-lg text-mist mb-4">Your donations</h2>
          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {donations.length === 0 && (
              <p className="text-muted text-sm">No donations yet — list your first one to get started.</p>
            )}
            <AnimatePresence initial={false}>
              {donations.map((d, i) => (
                <motion.div
                  key={d._id}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="border border-white/10 rounded-xl2 p-4"
                >
                  <div className="flex justify-between items-start">
                    <span className="font-display text-sm text-mist">
                      {d.items.map((item) => item.name).join(", ")}
                    </span>
                    <StatusPill status={d.status} />
                  </div>
                  <p className="text-xs text-muted mt-1">{d.pickupAddress}</p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </TiltCard>
      </div>
    </div>
  );
}

function StatusPill({ status }) {
  const styles = {
    listed: "text-signal border-signal/40",
    claimed: "text-amberflag border-amberflag/40",
    in_transit: "text-amberflag border-amberflag/40",
    delivered: "text-rescue border-rescue/40",
    cancelled: "text-muted border-white/20",
  };
  return (
    <span className={`text-xs font-mono uppercase border rounded-full px-2 py-0.5 ${styles[status] || ""}`}>
      {status.replace("_", " ")}
    </span>
  );
}
