"use client";

import { useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import dynamic from "next/dynamic";
import { config } from "@/config/wedding";

const Scene3D = dynamic(() => import("./Scene3D"), { ssr: false });

function getTimeLeft(targetDate: string) {
  const diff = new Date(targetDate).getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function CountdownBox({ value, label, index }: { value: number; label: string; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      className="countdown-box rounded-2xl px-5 py-6 text-center min-w-[75px] sm:min-w-[90px]"
      initial={{ opacity: 0, y: 30, rotateX: 45 }}
      animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1 }}
    >
      <p className="font-[family-name:var(--font-playfair)] text-3xl sm:text-5xl tabular-nums" style={{ color: "var(--primary)" }}>
        {String(value).padStart(2, "0")}
      </p>
      <p className="font-[family-name:var(--font-cormorant)] mt-2 text-[10px] sm:text-xs tracking-[0.25em] uppercase" style={{ color: "var(--text)", opacity: 0.4 }}>
        {label}
      </p>
    </motion.div>
  );
}

export default function CountdownSection({ date }: { date: string }) {
  const [time, setTime] = useState(getTimeLeft(date));
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  useEffect(() => {
    const interval = setInterval(() => setTime(getTimeLeft(date)), 1000);
    return () => clearInterval(interval);
  }, [date]);

  return (
    <section ref={ref} className="relative py-28 overflow-hidden" style={{ backgroundColor: "var(--bg-alt)" }}>
      {config.features.threeD && <Scene3D variant="floating" />}

      <div className="relative z-10 mx-auto max-w-xl px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <p className="font-[family-name:var(--font-cormorant)] text-sm tracking-[0.4em] uppercase" style={{ color: "var(--secondary)" }}>
            Menghitung Hari
          </p>
          <div className="ornament-divider mt-4 mb-12">
            <span className="text-xs" style={{ color: "var(--primary)" }}>✦</span>
          </div>

          <div className="flex justify-center gap-3 sm:gap-5">
            <CountdownBox value={time.days} label="Hari" index={0} />
            <CountdownBox value={time.hours} label="Jam" index={1} />
            <CountdownBox value={time.minutes} label="Menit" index={2} />
            <CountdownBox value={time.seconds} label="Detik" index={3} />
          </div>

          <motion.p
            className="font-[family-name:var(--font-lora)] mt-10 text-sm italic"
            style={{ color: "var(--text)", opacity: 0.5 }}
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 0.5 } : {}}
            transition={{ delay: 0.6 }}
          >
            Kami menantikan kehadiran Anda ❤️
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
