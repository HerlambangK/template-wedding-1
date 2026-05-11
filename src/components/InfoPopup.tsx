"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export default function InfoPopup() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
    }, 10000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, x: -100, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -100, scale: 0.8 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="fixed bottom-6 left-6 z-30 max-w-xs p-4 rounded-xl shadow-lg"
          style={{
            backgroundColor: "var(--bg-alt)",
            border: "1px solid color-mix(in srgb, var(--primary) 40%, transparent)",
          }}
        >
          <div className="flex justify-between items-start gap-2">
            <p className="text-sm" style={{ color: "var(--text)" }}>
              🎉 <span className="font-semibold">Info:</span> Tasyakuran keluarga di Resto Nawasena. 
              Tidak menerima tamu di rumah. Hanya saat tasyakuran ya!
            </p>
            <button
              onClick={() => setShow(false)}
              className="shrink-0 p-1 rounded-full hover:bg-gray-200 transition-colors"
              style={{ color: "var(--text-light)" }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}