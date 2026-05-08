"use client";

import { useState, useEffect, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { config } from "@/config/wedding";
import { ThemeProvider } from "@/components/ThemeProvider";
import Cover from "@/components/Cover";
import HeroSection from "@/components/HeroSection";
import QuoteSection from "@/components/QuoteSection";
import CoupleSection from "@/components/CoupleSection";
import EventSection from "@/components/EventSection";
import InteractiveMapSection from "@/components/InteractiveMapSection";
import CountdownSection from "@/components/CountdownSection";
import GiftSection from "@/components/GiftSection";
import RSVPSection from "@/components/RSVPSection";
import FooterSection from "@/components/FooterSection";
import MusicPlayer from "@/components/MusicPlayer";
import Particles from "@/components/Particles";

export default function Home() {
  const [isOpen, setIsOpen] = useState(false);
  const [guestName, setGuestName] = useState("Tamu Undangan");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const to = params.get("to");
    if (to) setGuestName(decodeURIComponent(to));
  }, []);

  const handleOpen = useCallback(() => {
    setIsOpen(true);
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  return (
    <ThemeProvider>
      <main className="relative min-h-screen">
        <AnimatePresence mode="wait">
          {!isOpen && (
            <Cover
              key="cover"
              groomName={config.groom.name}
              brideName={config.bride.name}
              guestName={guestName}
              date={config.akad.date}
              onOpen={handleOpen}
            />
          )}
        </AnimatePresence>

        {isOpen && (
          <>
            {config.features.music && <MusicPlayer src={config.music.src} />}
            {config.features.particles && <Particles />}

            <HeroSection
              groomName={config.groom.name}
              brideName={config.bride.name}
              date={config.akad.date}
            />

            <QuoteSection quotes={config.quotes} />

            <CoupleSection groom={config.groom} bride={config.bride} />

            <EventSection akad={config.akad} resepsi={null} />

            <InteractiveMapSection />

            {config.features.countdown && (
              <CountdownSection date={config.akad.date} />
            )}

            {config.features.gifts && <GiftSection gifts={config.gifts} />}

            {config.features.rsvp && (
              <RSVPSection
                groomName={config.groom.name}
                brideName={config.bride.name}
              />
            )}

            <FooterSection
              hashtag={config.hashtag}
              footerText={config.footerText}
            />
          </>
        )}
      </main>
    </ThemeProvider>
  );
}
