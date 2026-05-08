"use client";

import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import dynamic from "next/dynamic";
import { config } from "@/config/wedding";

const Scene3D = dynamic(() => import("./Scene3D"), { ssr: false });

interface HeroProps {
  groomName: string;
  brideName: string;
  date: string;
}

export default function HeroSection({ groomName, brideName, date }: HeroProps) {
  const formattedDate = new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <section
      className="relative flex min-h-screen items-center justify-center overflow-hidden"
      style={{ backgroundColor: "var(--bg-alt)" }}
    >
      {config.features.threeD && <Scene3D variant="hero" />}

      {/* Background pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none'%3E%3Cg fill='%23888'%3E%3Cpath d='M40 0l40 40-40 40L0 40z' fill-opacity='.06'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10 text-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <motion.p
            className="font-[family-name:var(--font-cormorant)] text-base sm:text-lg leading-relaxed"
            style={{ color: "var(--secondary)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ
          </motion.p>

          <div className="ornament-divider my-6">
            <span style={{ color: "var(--primary)" }}>✦</span>
          </div>

          <motion.p
            className="font-[family-name:var(--font-cormorant)] text-lg sm:text-xl"
            style={{ color: "var(--text)", opacity: 0.7 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            transition={{ delay: 0.5 }}
          >
            Assalamualaikum Warahmatullahi Wabarakatuh
          </motion.p>

          <motion.p
            className="font-[family-name:var(--font-lora)] mt-4 max-w-md mx-auto text-sm leading-relaxed"
            style={{ color: "var(--text)", opacity: 0.5 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            transition={{ delay: 0.7 }}
          >
            Dengan memohon rahmat dan ridho Allah SWT, kami mengundang
            Bapak/Ibu/Saudara/i untuk menghadiri pernikahan kami
          </motion.p>

          <div className="mt-12 sm:mt-16">
            <motion.h1
              className="font-[family-name:var(--font-playfair)] text-5xl sm:text-8xl italic leading-tight"
              style={{ color: "var(--text)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 1 }}
            >
              <motion.span
                className="block"
                initial={{ x: -30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 1, duration: 0.6 }}
              >
                {groomName}
              </motion.span>
              <motion.span
                className="block text-3xl sm:text-5xl my-2 sm:my-4 not-italic font-[family-name:var(--font-cormorant)] font-light"
                style={{ color: "var(--primary)" }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1.2, type: "spring" }}
              >
                &
              </motion.span>
              <motion.span
                className="block"
                initial={{ x: 30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 1, duration: 0.6 }}
              >
                {brideName}
              </motion.span>
            </motion.h1>
          </div>

          <motion.div
            className="mt-8"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5 }}
          >
            <div
              className="mx-auto h-px w-24"
              style={{
                background: `linear-gradient(to right, transparent, var(--primary), transparent)`,
              }}
            />
            <p
              className="font-[family-name:var(--font-cormorant)] mt-4 text-lg sm:text-xl"
              style={{ color: "var(--primary)" }}
            >
              {formattedDate}
            </p>
          </motion.div>
        </motion.div>

        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 12, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown
            className="h-6 w-6 opacity-60"
            style={{ color: "var(--primary-light)" }}
          />
        </motion.div>
      </div>
    </section>
  );
}
