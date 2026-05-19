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
import GallerySection from "@/components/GallerySection";
import RSVPSection from "@/components/RSVPSection";
import InfoPopup from "@/components/InfoPopup";
import FooterSection from "@/components/FooterSection";
import MusicPlayer from "@/components/MusicPlayer";
import ScrollProgress from "@/components/ScrollProgress";
import Particles from "@/components/Particles";
import { initAndPlayAudio } from "@/lib/audio-player";

export default function Home() {
  const [isOpen, setIsOpen] = useState(false);
  const [guestName, setGuestName] = useState("Tamu Undangan");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const to = params.get("to");
    if (to) setGuestName(decodeURIComponent(to));
  }, []);

  const handleOpen = useCallback(() => {
    if (config.features.music) {
      initAndPlayAudio(config.music.src);
    }
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
              date={config.makanKeluarga.date}
              onOpen={handleOpen}
            />
          )}
        </AnimatePresence>

        {isOpen && (
          <>
            {config.features.music && <MusicPlayer src={config.music.src} />}
            {config.features.particles && <Particles />}
            <ScrollProgress />

            <HeroSection
              groomName={config.groom.name}
              brideName={config.bride.name}
              date={config.makanKeluarga.date}
            />

            <QuoteSection quotes={config.quotes} />

            <CoupleSection groom={config.groom} bride={config.bride} />

            <EventSection makanKeluarga={config.makanKeluarga} />

            <InteractiveMapSection />

            {config.features.countdown && (
              <CountdownSection date={config.makanKeluarga.date} />
            )}

            {config.features.gallery && (
              <GallerySection images={config.gallery} />
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

            <InfoPopup />
          </>
        )}
      </main>
    </ThemeProvider>
  );
}
