"use client";

import { useState, useEffect, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { themePresets, type ThemePresetKey } from "@/config/wedding";
import type { Invitation, GuestMessage } from "@/lib/types";
import { ThemeProvider } from "@/components/ThemeProvider";
import Cover from "@/components/Cover";
import HeroSection from "@/components/HeroSection";
import QuoteSection from "@/components/QuoteSection";
import CoupleSection from "@/components/CoupleSection";
import EventSection from "@/components/EventSection";
import CountdownSection from "@/components/CountdownSection";
import GallerySection from "@/components/GallerySection";
import GiftSection from "@/components/GiftSection";
import RSVPSection from "@/components/RSVPSection";
import GuestBookSection from "@/components/GuestBookSection";
import FooterSection from "@/components/FooterSection";
import MusicPlayer from "@/components/MusicPlayer";
import Particles from "@/components/Particles";

// Convert DB invitation to component-friendly props
function mapInvitation(inv: Invitation) {
  return {
    groom: {
      name: inv.groom_name || "Mempelai Pria",
      fullName: inv.groom_full_name || "",
      father: inv.groom_father || "",
      mother: inv.groom_mother || "",
      childOrder: inv.groom_child_order || "",
      photo: inv.groom_photo || "",
      instagram: inv.groom_instagram || "",
    },
    bride: {
      name: inv.bride_name || "Mempelai Wanita",
      fullName: inv.bride_full_name || "",
      father: inv.bride_father || "",
      mother: inv.bride_mother || "",
      childOrder: inv.bride_child_order || "",
      photo: inv.bride_photo || "",
      instagram: inv.bride_instagram || "",
    },
    akad: {
      date: inv.akad_date || "2026-01-01",
      time: inv.akad_time || "08:00",
      endTime: inv.akad_end_time || "10:00",
      venue: inv.akad_venue || "",
      address: inv.akad_address || "",
      mapsUrl: inv.akad_maps_url || "#",
    },
    resepsi: {
      date: inv.resepsi_date || inv.akad_date || "2026-01-01",
      time: inv.resepsi_time || "11:00",
      endTime: inv.resepsi_end_time || "14:00",
      venue: inv.resepsi_venue || "",
      address: inv.resepsi_address || "",
      mapsUrl: inv.resepsi_maps_url || "#",
      dressCode: inv.resepsi_dress_code || undefined,
    },
    quotes: inv.quotes || [],
    gallery: inv.gallery || [],
    gifts: inv.gifts || [],
    hashtag: inv.hashtag || "",
    footerText: inv.footer_text || "",
    musicUrl: inv.music_url || "",
    features: {
      music: inv.feature_music,
      particles: inv.feature_particles,
      threeD: inv.feature_three_d,
      rsvp: inv.feature_rsvp,
      gifts: inv.feature_gifts,
      gallery: inv.feature_gallery,
      countdown: inv.feature_countdown,
      guestBook: inv.feature_guest_book,
    },
  };
}

interface Props {
  invitation: Invitation;
  messages: GuestMessage[];
}

export default function PublicInvitation({ invitation, messages }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [guestName, setGuestName] = useState("Tamu Undangan");

  const data = mapInvitation(invitation);

  // Override theme based on invitation's theme_preset
  useEffect(() => {
    const preset = invitation.theme_preset as ThemePresetKey;
    const theme = themePresets[preset] || themePresets.gold;
    const root = document.documentElement;

    root.style.setProperty("--primary", theme.primary);
    root.style.setProperty("--primary-light", theme.primaryLight);
    root.style.setProperty("--primary-dark", theme.primaryDark);
    root.style.setProperty("--secondary", theme.secondary);
    root.style.setProperty("--secondary-light", theme.secondaryLight);
    root.style.setProperty("--bg", theme.background);
    root.style.setProperty("--bg-alt", theme.backgroundAlt);
    root.style.setProperty("--bg-dark", theme.backgroundDark);
    root.style.setProperty("--text", theme.text);
    root.style.setProperty("--text-light", theme.textLight);
    root.style.setProperty("--cover-bg", theme.coverBg);
    root.style.setProperty("--cover-bg-mid", theme.coverBgMid);
    root.style.setProperty("--cover-text", theme.coverText);
    root.style.setProperty("--particle", theme.particle);
  }, [invitation.theme_preset]);

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
    <main className="relative min-h-screen">
      <AnimatePresence mode="wait">
        {!isOpen && (
          <Cover
            key="cover"
            groomName={data.groom.name}
            brideName={data.bride.name}
            guestName={guestName}
            date={data.akad.date}
            onOpen={handleOpen}
          />
        )}
      </AnimatePresence>

      {isOpen && (
        <>
          {data.features.music && data.musicUrl && <MusicPlayer src={data.musicUrl} />}
          {data.features.particles && <Particles />}

          <HeroSection
            groomName={data.groom.name}
            brideName={data.bride.name}
            date={data.akad.date}
          />

          {data.quotes.length > 0 && <QuoteSection quotes={data.quotes} />}

          <CoupleSection groom={data.groom} bride={data.bride} />

          <EventSection akad={data.akad} resepsi={data.resepsi} />

          {data.features.countdown && <CountdownSection date={data.akad.date} />}

          {data.features.gallery && data.gallery.length > 0 && (
            <GallerySection images={data.gallery} />
          )}

          {data.features.gifts && data.gifts.length > 0 && (
            <GiftSection gifts={data.gifts} />
          )}

          {data.features.rsvp && (
            <RSVPSection
              groomName={data.groom.name}
              brideName={data.bride.name}
              invitationId={invitation.id}
            />
          )}

          {data.features.guestBook && (
            <GuestBookSection
              invitationId={invitation.id}
              initialMessages={messages}
            />
          )}

          <FooterSection
            hashtag={data.hashtag}
            footerText={data.footerText}
          />
        </>
      )}
    </main>
  );
}
