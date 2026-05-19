"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Music, Music2 } from "lucide-react";
import { getAudio, getAudioSrc } from "@/lib/audio-player";

export default function MusicPlayer({ src }: { src: string }) {
  const [isPlaying, setIsPlaying] = useState(() => {
    const audio = getAudio();
    return audio && getAudioSrc() === src ? !audio.paused : false;
  });

  const hasValidSrc = getAudioSrc() === src;

  const toggleMusic = useCallback(() => {
    const audio = getAudio();
    if (!audio || getAudioSrc() !== src) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  }, [isPlaying, src]);

  if (!hasValidSrc) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40 flex items-center justify-center">
      {isPlaying && [0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: 56,
            height: 56,
            border: "1.5px solid",
            borderColor: `color-mix(in srgb, var(--primary-light) ${40 - i * 10}%, transparent)`,
          }}
          initial={false}
          animate={{ scale: [1, 1.8, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut", delay: i * 0.4 }}
        />
      ))}

      <motion.button
        onClick={toggleMusic}
        className="relative flex h-14 w-14 items-center justify-center rounded-full shadow-lg backdrop-blur-sm"
        style={{
          background: isPlaying
            ? "linear-gradient(135deg, var(--primary), var(--primary-dark))"
            : "rgba(255,255,255,0.9)",
          boxShadow: isPlaying
            ? `0 0 20px color-mix(in srgb, var(--primary-light) 30%, transparent), 0 4px 12px rgba(0,0,0,0.08)`
            : "0 4px 12px rgba(0,0,0,0.08)",
        }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        aria-label={isPlaying ? "Matikan musik" : "Nyalakan musik"}
      >
        <AnimatePresence mode="wait">
          {isPlaying ? (
            <motion.div
              key="on"
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 90 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <Music2 className="h-5 w-5 text-white" />
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="off"
              initial={{ scale: 0, rotate: 90 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: -90 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="relative flex items-center justify-center"
            >
              <Music className="h-5 w-5" style={{ color: "var(--primary)" }} />
              <div
                className="absolute"
                style={{
                  left: "50%",
                  top: "50%",
                  width: "130%",
                  height: 2,
                  borderRadius: 2,
                  backgroundColor: "var(--primary)",
                  transform: "translate(-50%, -50%) rotate(-35deg)",
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
