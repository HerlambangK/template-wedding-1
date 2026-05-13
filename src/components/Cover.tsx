"use client";

import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { Component, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { config } from "@/config/wedding";

const Scene3D = dynamic(() => import("./Scene3D"), { ssr: false });

class ErrorBoundary extends Component<{ children: ReactNode }> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() { return this.state.hasError ? null : this.props.children; }
}

interface CoverProps {
  groomName: string;
  brideName: string;
  guestName: string;
  date: string;
  onOpen: () => void;
}

export default function Cover({
  groomName,
  brideName,
  guestName,
  date,
  onOpen,
}: CoverProps) {
  const formattedDate = new Date(date).toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
      style={{
        background: `linear-gradient(180deg, var(--cover-bg) 0%, var(--cover-bg-mid) 30%, var(--cover-bg-mid) 60%, var(--cover-bg) 100%)`,
      }}
      exit={{
        y: "-100%",
        transition: { duration: 1, ease: [0.65, 0, 0.35, 1] },
      }}
    >
      {config.features.threeD && (
        <ErrorBoundary><Scene3D variant="cover" /></ErrorBoundary>
      )}

      {/* Decorative corner ornaments */}
      <div className="pointer-events-none absolute inset-0">
        {[
          "left-4 top-4",
          "right-4 top-4 rotate-90",
          "bottom-4 left-4 -rotate-90",
          "bottom-4 right-4 rotate-180",
        ].map((pos, i) => (
          <svg
            key={i}
            className={`absolute ${pos} h-20 w-20 sm:h-28 sm:w-28 opacity-20`}
            style={{ color: "var(--primary-light)" }}
            viewBox="0 0 100 100"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
          >
            <path d="M0,50 Q0,0 50,0" />
            <path d="M0,40 Q0,10 30,0" />
            <path d="M10,0 Q20,20 0,30" />
            <circle cx="25" cy="25" r="2" fill="currentColor" opacity="0.3" />
          </svg>
        ))}
      </div>

      <motion.div
        className="relative z-10 text-center px-6"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.3 }}
      >
        <motion.p
          className="font-[family-name:var(--font-cormorant)] text-xs sm:text-sm tracking-[0.5em] uppercase"
          style={{ color: "var(--primary-light)", opacity: 0.8 }}
          initial={{ opacity: 0, letterSpacing: "0.2em" }}
          animate={{ opacity: 0.8, letterSpacing: "0.5em" }}
          transition={{ delay: 0.5, duration: 1 }}
        >
          The Wedding of
        </motion.p>

        <motion.h1
          className="font-[family-name:var(--font-playfair)] mt-6 text-5xl sm:text-8xl italic"
          style={{ color: "var(--cover-text)" }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          <motion.span
            className="block"
            initial={{ x: -40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 1, duration: 0.6 }}
          >
            {groomName}
          </motion.span>
          <motion.span
            className="block text-3xl sm:text-5xl my-2 sm:my-3 not-italic font-[family-name:var(--font-cormorant)] font-light"
            style={{ color: "var(--primary-light)" }}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 1.3, duration: 0.6, type: "spring" }}
          >
            &
          </motion.span>
          <motion.span
            className="block"
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 1, duration: 0.6 }}
          >
            {brideName}
          </motion.span>
        </motion.h1>

        {/* Date with gold ribbon */}
        <motion.div
          className="relative mt-8 inline-flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.5, duration: 0.6, ease: "easeOut" }}
        >
          {/* Outer decorative line - left */}
          <motion.div
            className="absolute -left-14 sm:-left-20 top-1/2 -translate-y-1/2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.7, duration: 0.3 }}
          >
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-[6px] sm:text-[8px]" style={{ color: "var(--primary-light)", opacity: 0.5 }}>✦</span>
              <div className="h-px w-6 sm:w-10" style={{ background: `linear-gradient(to left, var(--primary-light), transparent)`, opacity: 0.5 }} />
              <span className="text-[4px]" style={{ color: "var(--primary-light)", opacity: 0.3 }}>◆</span>
            </div>
          </motion.div>
          {/* Outer decorative line - right */}
          <motion.div
            className="absolute -right-14 sm:-right-20 top-1/2 -translate-y-1/2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.7, duration: 0.3 }}
          >
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-[4px]" style={{ color: "var(--primary-light)", opacity: 0.3 }}>◆</span>
              <div className="h-px w-6 sm:w-10" style={{ background: `linear-gradient(to right, var(--primary-light), transparent)`, opacity: 0.5 }} />
              <span className="text-[6px] sm:text-[8px]" style={{ color: "var(--primary-light)", opacity: 0.5 }}>✦</span>
            </div>
          </motion.div>

          {/* Outer ribbon shadow/glow */}
          <motion.div
            className="absolute inset-0 rounded-sm blur-sm"
            style={{
              background: `linear-gradient(135deg, var(--primary-light), var(--primary))`,
              opacity: 0.3,
              transform: "scale(1.05)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            transition={{ delay: 1.55, duration: 0.4 }}
          />

          {/* Ribbon left fold — points left */}
          <motion.div
            className="absolute -left-3 sm:-left-4 top-1/2 -translate-y-1/2 h-0 w-0 border-y-[14px] border-r-[10px] border-l-0 sm:border-y-[16px] sm:border-r-[12px]"
            style={{
              borderTopColor: "transparent",
              borderBottomColor: "transparent",
              borderRightColor: "color-mix(in srgb, var(--primary-dark) 80%, black)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6, duration: 0.3 }}
          />
          {/* Ribbon right fold — points right */}
          <motion.div
            className="absolute -right-3 sm:-right-4 top-1/2 -translate-y-1/2 h-0 w-0 border-y-[14px] border-l-[10px] border-r-0 sm:border-y-[16px] sm:border-l-[12px]"
            style={{
              borderTopColor: "transparent",
              borderBottomColor: "transparent",
              borderLeftColor: "color-mix(in srgb, var(--primary-dark) 80%, black)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6, duration: 0.3 }}
          />
          {/* Inner ribbon body */}
          <motion.div
            className="relative px-4 sm:px-8 py-2 sm:py-3"
            style={{
              background: `linear-gradient(135deg, var(--primary-dark), var(--primary), var(--primary-light), var(--primary), var(--primary-dark))`,
              borderRadius: "3px",
              boxShadow: "0 3px 16px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.15)",
            }}
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: 1.5, duration: 0.5, ease: "easeOut" }}
          >
            {/* Subtle inner border */}
            <div
              className="absolute inset-[1px] rounded-[2px]"
              style={{ border: `1px solid color-mix(in srgb, var(--primary-light) 40%, transparent)`, opacity: 0.4 }}
            />
            <p
              className="relative font-[family-name:var(--font-cormorant)] text-[11px] sm:text-sm tracking-[0.3em] uppercase whitespace-nowrap font-semibold"
              style={{ color: "#FFFFFF", textShadow: "0 1px 3px rgba(0,0,0,0.3)" }}
            >
              {formattedDate}
            </p>
          </motion.div>
          {/* Small sparkle decorations */}
          <motion.span
            className="absolute -top-2 -left-1 sm:-top-3 sm:-left-2 text-[8px] sm:text-[10px]"
            style={{ color: "var(--primary-light)", opacity: 0.6 }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 0.6, scale: 1 }}
            transition={{ delay: 2.0, duration: 0.4 }}
            whileHover={{ scale: 1.3, rotate: 20 }}
          >
            ✦
          </motion.span>
          <motion.span
            className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 text-[6px] sm:text-[8px]"
            style={{ color: "var(--primary-light)", opacity: 0.5 }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 0.5, scale: 1 }}
            transition={{ delay: 2.1, duration: 0.4 }}
            whileHover={{ scale: 1.3, rotate: -15 }}
          >
            ✧
          </motion.span>
        </motion.div>

        <motion.div
          className="mt-10 sm:mt-14"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8 }}
        >
          <div
            className="mx-auto h-px w-32"
            style={{
              background: `linear-gradient(to right, transparent, var(--primary-light), transparent)`,
              opacity: 0.4,
            }}
          />
          <p
            className="font-[family-name:var(--font-cormorant)] mt-6 text-xs tracking-[0.3em] uppercase"
            style={{ color: "var(--text-light)" }}
          >
            Kepada Yth. Bapak/Ibu/Saudara/i
          </p>
          <p
            className="font-[family-name:var(--font-playfair)] mt-2 text-2xl sm:text-3xl"
            style={{ color: "var(--cover-text)" }}
          >
            {guestName || "Tamu Undangan"}
          </p>
        </motion.div>

        <motion.button
          onClick={onOpen}
          className="group mt-10 sm:mt-14 inline-flex items-center gap-3 rounded-full px-10 py-4 font-[family-name:var(--font-cormorant)] text-sm tracking-[0.25em] uppercase backdrop-blur-sm transition-all"
          style={{
            border: `1px solid color-mix(in srgb, var(--primary-light) 60%, transparent)`,
            color: "var(--primary-light)",
            background: `color-mix(in srgb, var(--primary-light) 5%, transparent)`,
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.2 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Heart className="h-4 w-4 transition-transform group-hover:scale-110" />
          Buka Undangan
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
