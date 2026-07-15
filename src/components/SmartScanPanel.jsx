import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../api/client";

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = () => reject(new Error("Could not read image file"));
    reader.readAsDataURL(file);
  });
}

export default function SmartScanPanel({ onItemsIdentified }) {
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState(null);
  const [scannedCount, setScannedCount] = useState(null);

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setScannedCount(null);
    setPreview(URL.createObjectURL(file));
    setScanning(true);

    try {
      const imageBase64 = await fileToBase64(file);
      const { data } = await api.post("/donations/smart-scan", {
        imageBase64,
        mediaType: file.type || "image/jpeg",
      });
      onItemsIdentified(data.items);
      setScannedCount(data.items.length);
    } catch (err) {
      setError(err.response?.data?.message || "AI Smart-Scan failed — please add items manually.");
    } finally {
      setScanning(false);
      e.target.value = ""; // allow re-scanning the same file if needed
    }
  }

  return (
    <div className="border border-dashed border-signal/30 rounded-xl2 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-display text-sm text-mist">AI Smart-Scan</p>
          <p className="text-xs text-muted mt-1">Snap a photo of the crate — we'll fill in the items below.</p>
        </div>
        {preview && (
          <img src={preview} alt="Scan preview" className="w-12 h-12 rounded-lg object-cover border border-white/10" />
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />

      <motion.button
        type="button"
        whileTap={{ scale: 0.97 }}
        onClick={() => fileInputRef.current?.click()}
        disabled={scanning}
        className="ghost-btn text-sm py-2 px-4 mt-3 w-full"
      >
        {scanning ? "Scanning crate…" : "Scan a photo"}
      </motion.button>

      <AnimatePresence>
        {scannedCount !== null && !error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-xs text-rescue mt-2"
          >
            AI identified {scannedCount} item{scannedCount === 1 ? "" : "s"} — review and adjust below.
          </motion.p>
        )}
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-xs text-amberflag mt-2"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}