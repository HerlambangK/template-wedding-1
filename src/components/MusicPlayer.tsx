"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Volume2, VolumeX } from "lucide-react";

export default function MusicPlayer({ src }: { src: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasValidSrc, setHasValidSrc] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio();
    audio.volume = 0.3;
    audio.loop = true;
    audio.preload = "auto";

    audio.addEventListener("canplaythrough", () => {
      setHasValidSrc(true);
    });

    audio.addEventListener("error", () => {
      setHasValidSrc(false);
    });

    audio.src = src;
    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.src = "";
    };
  }, [src]);

  const toggleMusic = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !hasValidSrc) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  }, [isPlaying, hasValidSrc]);

  // Auto-play when valid
  useEffect(() => {
    if (!hasValidSrc || !audioRef.current) return;
    audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
  }, [hasValidSrc]);

  if (!hasValidSrc) return null;

  return (
    <button
      onClick={toggleMusic}
      className="music-pulse fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full border border-[var(--gold-light)] bg-white/90 shadow-lg backdrop-blur-sm transition-all hover:bg-[var(--gold-light)] hover:text-white"
      aria-label={isPlaying ? "Matikan musik" : "Nyalakan musik"}
    >
      {isPlaying ? (
        <Volume2 className="h-5 w-5 text-[var(--gold)]" />
      ) : (
        <VolumeX className="h-5 w-5 text-gray-400" />
      )}
    </button>
  );
}
