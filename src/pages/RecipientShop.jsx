import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import TiltCard from "../components/TiltCard";

export default function RecipientShop() {
  const { user } = useAuth();
  const [inventory, setInventory] = useState([]);
  const [cart, setCart] = useState({});
  const [fulfillmentType, setFulfillmentType] = useState("locker");
  const [placing, setPlacing] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [checkoutResult, setCheckoutResult] = useState(null);

  useEffect(() => {
    api.get("/donations/shop").then(({ data }) => setInventory(data.items));
  }, []);

  function addToCart(item) {
    setCart((prev) => {
      const key = `${item.donationId}-${item.name}`;
      const existing = prev[key];
      return {
        ...prev,
        [key]: {
          item,
          quantity: existing ? existing.quantity + 1 : 1,
        },
      };
    });
  }

  function removeFromCart(key) {
    setCart((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  const cartEntries = Object.entries(cart);

  async function handleCheckout() {
    setPlacing(true);
    try {
      const items = cartEntries.map(([, { item, quantity }]) => ({
        name: item.name,
        quantity,
        sourceDonation: item.donationId,
      }));
      const { data } = await api.post("/orders", { items, fulfillmentType });
      setCheckoutResult(data);
      setCart({});
      setConfirmed(true);
    } finally {
      setPlacing(false);
    }
  }

  if (confirmed) {
    return (
      <div className="min-h-[calc(100vh-88px)] flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="glass-panel p-10 text-center max-w-md"
        >
          <h1 className="font-display text-2xl text-rescue">Order confirmed</h1>

          {fulfillmentType === "locker" && checkoutResult?.locker && (
            <div className="mt-5 glass-panel p-5 text-left">
              <p className="stat-ring-label">Pickup hub</p>
              <p className="text-mist font-display mt-1">{checkoutResult.locker.hubAddress}</p>
              <p className="stat-ring-label mt-4">Your access code</p>
              <p className="font-mono text-3xl tracking-widest text-rescue mt-1">
                {checkoutResult.locker.accessCode}
              </p>
              <p className="text-xs text-muted mt-2">
                Valid until{" "}
                {new Date(checkoutResult.locker.accessCodeExpiresAt).toLocaleString(undefined, {
                  weekday: "short",
                  hour: "numeric",
                  minute: "2-digit",
                })}
                . Enter it at the locker keypad — no app required.
              </p>
            </div>
          )}

          {fulfillmentType === "locker" && checkoutResult?.lockerPending && (
            <p className="text-muted mt-3">
              Every locker is in use right now — you'll get a text with your access code the moment one frees up.
            </p>
          )}

          {fulfillmentType === "delivery" && (
            <p className="text-muted mt-3">
              Your delivery will arrive in unmarked packaging within your selected window.
            </p>
          )}

          <button onClick={() => { setConfirmed(false); setCheckoutResult(null); }} className="glow-btn mt-6">
            Back to shop
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="px-6 md:px-10 py-10 max-w-6xl mx-auto">
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-display text-3xl text-mist"
      >
        Hi {user?.fullName?.split(" ")[0]}, here's what's in stock
      </motion.h1>
      <p className="text-muted mt-2">Add what your household needs — pickup or delivery, entirely private.</p>

      <div className="grid md:grid-cols-3 gap-8 mt-8">
        <div className="md:col-span-2 grid sm:grid-cols-2 gap-4">
          {inventory.length === 0 && (
            <p className="text-muted text-sm col-span-2">
              Nothing in stock right now — check back soon, new items arrive daily.
            </p>
          )}
          {inventory.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <TiltCard className="p-4 h-full">
                <div className="font-display text-mist">{item.name}</div>
                <p className="text-xs text-muted mt-1">
                  {item.quantity} {item.unit} available · {item.category}
                </p>
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={() => addToCart(item)}
                  className="ghost-btn text-sm py-2 px-4 mt-3 w-full"
                >
                  Add to order
                </motion.button>
              </TiltCard>
            </motion.div>
          ))}
        </div>

        <div className="glass-panel p-6 h-fit sticky top-6">
          <h2 className="font-display text-lg text-mist mb-4">Your order</h2>
          {cartEntries.length === 0 && <p className="text-muted text-sm">Your cart is empty.</p>}
          <div className="space-y-2">
            <AnimatePresence initial={false}>
              {cartEntries.map(([key, { item, quantity }]) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex justify-between items-center text-sm"
                >
                  <span className="text-mist">
                    {item.name} x{quantity}
                  </span>
                  <button onClick={() => removeFromCart(key)} className="text-muted hover:text-amberflag text-xs">
                    remove
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <AnimatePresence>
            {cartEntries.length > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="mt-5">
                  <p className="stat-ring-label mb-2">Fulfillment</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setFulfillmentType("locker")}
                      className={`text-sm py-2 rounded-xl2 border transition-colors ${
                        fulfillmentType === "locker" ? "border-rescue text-mist bg-rescue/10" : "border-white/10 text-muted"
                      }`}
                    >
                      Smart locker
                    </button>
                    <button
                      onClick={() => setFulfillmentType("delivery")}
                      className={`text-sm py-2 rounded-xl2 border transition-colors ${
                        fulfillmentType === "delivery" ? "border-rescue text-mist bg-rescue/10" : "border-white/10 text-muted"
                      }`}
                    >
                      Discreet delivery
                    </button>
                  </div>
                </div>

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCheckout}
                  disabled={placing}
                  className="glow-btn w-full mt-5"
                >
                  {placing ? "Placing order…" : "Confirm order"}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}