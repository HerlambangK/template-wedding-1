"use client";

import { useState, useEffect } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef } from "react";
import dynamic from "next/dynamic";
import { config } from "@/config/wedding";

const Scene3D = dynamic(() => import("./Scene3D"), { ssr: false });

function getTimeLeft(targetDate: string) {
  const diff = new Date(targetDate).getTime() - Date.now();
  if (diff <= 0) return null;
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function AnimatedDigit({ value }: { value: string }) {
  return (
    <div className="relative inline-block overflow-hidden" style={{ perspective: "200px" }}>
      <AnimatePresence mode="popLayout">
        <motion.span
          key={value}
          className="block tabular-nums"
          initial={{ rotateX: -90, opacity: 0 }}
          animate={{ rotateX: 0, opacity: 1 }}
          exit={{ rotateX: 90, opacity: 0, position: "absolute" }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

function CountdownBox({
  value,
  label,
  index,
}: {
  value: number;
  label: string;
  index: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const padded = String(value).padStart(2, "0");

  return (
    <motion.div
      ref={ref}
      className="countdown-box rounded-xl sm:rounded-2xl px-2.5 sm:px-5 py-3 sm:py-6 text-center min-w-[58px] sm:min-w-[75px] md:min-w-[90px]"
      initial={{ opacity: 0, y: 30, rotateX: 45 }}
      animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1 }}
    >
      <div
        className="font-[family-name:var(--font-playfair)] text-2xl sm:text-5xl"
        style={{ color: "var(--primary)" }}
      >
        {padded.split("").map((char, i) => (
          <AnimatedDigit key={i} value={char} />
        ))}
      </div>
      <p
        className="font-[family-name:var(--font-cormorant)] mt-1 sm:mt-2 text-[9px] sm:text-xs tracking-[0.25em] uppercase"
        style={{ color: "var(--text)", opacity: 0.4 }}
      >
        {label}
      </p>
    </motion.div>
  );
}

function PostEventMessage() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="py-6 px-4"
    >
      <p
        className="font-[family-name:var(--font-arabic)] text-2xl sm:text-3xl mb-4"
        style={{ color: "var(--primary)" }}
      >
        الحمد لله
      </p>
      <p
        className="font-[family-name:var(--font-playfair)] text-xl sm:text-2xl italic"
        style={{ color: "var(--text)", opacity: 0.8 }}
      >
        Alhamdulillah
      </p>
      <p
        className="font-[family-name:var(--font-lora)] mt-4 text-sm sm:text-base leading-relaxed"
        style={{ color: "var(--text)", opacity: 0.6 }}
      >
        Acara telah berlangsung dengan penuh rahmat dan kebahagiaan.
        Terima kasih atas doa dan restu yang telah diberikan.
      </p>
    </motion.div>
  );
}

export default function CountdownSection({ date }: { date: string }) {
  const [time, setTime] = useState<ReturnType<typeof getTimeLeft>>(
    getTimeLeft(date)
  );
  const isAfterEvent = time === null;
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  useEffect(() => {
    const interval = setInterval(() => {
      const t = getTimeLeft(date);
      setTime(t);
      if (t === null) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [date]);

  return (
    <section
      ref={ref}
      className="relative py-28 overflow-hidden"
      style={{ backgroundColor: "var(--bg-alt)" }}
    >
      {config.features.threeD && <Scene3D variant="floating" />}

      <div className="relative z-10 mx-auto max-w-xl px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <p
            className="font-[family-name:var(--font-cormorant)] text-sm tracking-[0.4em] uppercase"
            style={{ color: "var(--secondary)" }}
          >
            Menghitung Hari
          </p>
          <div className="ornament-divider mt-4 mb-12">
            <span className="text-xs" style={{ color: "var(--primary)" }}>
              ✦
            </span>
          </div>

          {isAfterEvent ? (
            <PostEventMessage />
          ) : (
            <div className="flex justify-center gap-2 sm:gap-5">
              <CountdownBox value={time!.days} label="Hari" index={0} />
              <CountdownBox value={time!.hours} label="Jam" index={1} />
              <CountdownBox value={time!.minutes} label="Menit" index={2} />
              <CountdownBox value={time!.seconds} label="Detik" index={3} />
            </div>
          )}

          <motion.p
            className="font-[family-name:var(--font-lora)] mt-10 text-sm"
            style={{ color: "var(--text)", opacity: 0.5 }}
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 0.5 } : {}}
            transition={{ delay: 0.6 }}
          >
            {isAfterEvent
              ? "Syukron atas kehadiran dan doa restunya."
              : "Kami menantikan kehadiran Anda ❤️"}
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
