"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { MapPin, Clock, Calendar, Shirt } from "lucide-react";

interface EventInfo {
  date: string;
  time: string;
  endTime?: string;
  venue: string;
  address: string;
  mapsUrl: string;
  dressCode?: string;
  showTime?: boolean;
}

function EventCard({
  title,
  event,
  index,
}: {
  title: string;
  event: EventInfo;
  index: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  const formattedDate = new Date(event.date).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <motion.div
      ref={ref}
      className="rounded-2xl bg-white p-8 shadow-sm"
      style={{ border: `1px solid color-mix(in srgb, var(--primary-light) 20%, transparent)` }}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay: index * 0.2 }}
    >
      <h3 className="font-[family-name:var(--font-playfair)] text-2xl italic text-center" style={{ color: "var(--text)" }}>
        {title}
      </h3>

      <div className="ornament-divider my-6">
        <span className="text-xs" style={{ color: "var(--primary)" }}>✦</span>
      </div>

      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <Calendar className="mt-0.5 h-4 w-4 flex-shrink-0" style={{ color: "var(--primary)" }} />
          <p className="font-[family-name:var(--font-lora)] text-sm" style={{ color: "var(--text)", opacity: 0.8 }}>
            {formattedDate}
          </p>
        </div>

        {event.showTime !== false && (
          <div className="flex items-start gap-3">
            <Clock className="mt-0.5 h-4 w-4 flex-shrink-0" style={{ color: "var(--primary)" }} />
            <p className="font-[family-name:var(--font-lora)] text-sm" style={{ color: "var(--text)", opacity: 0.8 }}>
              {event.time}{event.endTime ? ` - ${event.endTime} WIB` : ' WIB'}
            </p>
          </div>
        )}

        <div className="flex items-start gap-3">
          <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0" style={{ color: "var(--primary)" }} />
          <div>
            <p className="font-[family-name:var(--font-lora)] text-sm font-semibold" style={{ color: "var(--text)" }}>
              {event.venue}
            </p>
            <p className="font-[family-name:var(--font-lora)] mt-1 text-xs leading-relaxed" style={{ color: "var(--text)", opacity: 0.6 }}>
              {event.address}
            </p>
          </div>
        </div>

        {event.dressCode && (
          <div className="flex items-start gap-3">
            <Shirt className="mt-0.5 h-4 w-4 flex-shrink-0" style={{ color: "var(--primary)" }} />
            <p className="font-[family-name:var(--font-lora)] text-sm" style={{ color: "var(--text)", opacity: 0.8 }}>
              {event.dressCode}
            </p>
          </div>
        )}
      </div>

      <a
        href={event.mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 block w-full rounded-full py-2.5 text-center font-[family-name:var(--font-cormorant)] text-sm tracking-[0.15em] uppercase transition-all hover:opacity-80"
        style={{
          border: `1px solid var(--primary-light)`,
          color: "var(--primary)",
        }}
      >
        Lihat Lokasi
      </a>
    </motion.div>
  );
}

export default function EventSection({
  akad,
  resepsi,
  makanKeluarga,
}: {
  akad: EventInfo;
  resepsi?: EventInfo | null;
  makanKeluarga?: EventInfo | null;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="relative py-24" style={{ backgroundColor: "var(--bg)" }}>
      <div className="mx-auto max-w-4xl px-6">
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
        >
          <p className="font-[family-name:var(--font-cormorant)] text-sm tracking-[0.4em] uppercase" style={{ color: "var(--secondary)" }}>
            Waktu & Tempat
          </p>
          <div className="ornament-divider mt-4">
            <span className="text-xs" style={{ color: "var(--primary)" }}>✦</span>
          </div>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-2 max-w-md md:max-w-2xl mx-auto">
          <EventCard title="Akad Nikah" event={akad} index={0} />
          {makanKeluarga && (
            <EventCard title="Makan Keluarga" event={makanKeluarga} index={1} />
          )}
        </div>
      </div>
    </section>
  );
}
