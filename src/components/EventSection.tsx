"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { MapPin, Clock, Calendar } from "lucide-react";

interface EventInfo {
  date: string;
  time: string;
  endTime?: string;
  venue: string;
  address: string;
  mapsUrl: string;
}

interface EventSectionProps {
  akad?: EventInfo;
  resepsi?: EventInfo | null;
  makanKeluarga?: EventInfo | null;
}

export default function EventSection({ makanKeluarga }: EventSectionProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  if (!makanKeluarga) return null;

  const formattedDate = new Date(makanKeluarga.date).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <section ref={ref} className="relative py-24" style={{ backgroundColor: "var(--bg)" }}>
      <div className="mx-auto max-w-2xl px-6">
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
        >
          <p className="text-sm tracking-[0.4em] uppercase" style={{ color: "var(--secondary)" }}>
            Waktu & Tempat
          </p>
          <div className="ornament-divider mt-4">
            <span className="text-xs" style={{ color: "var(--primary)" }}>✦</span>
          </div>
        </motion.div>

        <motion.div
          className="rounded-2xl bg-white p-8 shadow-sm"
          style={{ border: `1px solid color-mix(in srgb, var(--primary-light) 20%, transparent)` }}
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <h3 className="text-2xl font-semibold text-center" style={{ color: "var(--text)" }}>
            Makan Keluarga
          </h3>

          <div className="ornament-divider my-6">
            <span className="text-xs" style={{ color: "var(--primary)" }}>✦</span>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4" style={{ color: "var(--primary)" }} />
              <p className="text-sm" style={{ color: "var(--text)", opacity: 0.8 }}>
                {formattedDate}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4" style={{ color: "var(--primary)" }} />
              <p className="text-sm" style={{ color: "var(--text)", opacity: 0.8 }}>
                {makanKeluarga.time} - {makanKeluarga.endTime} WIB
              </p>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4" style={{ color: "var(--primary)" }} />
              <div>
                <p className="text-base font-semibold" style={{ color: "var(--text)" }}>
                  {makanKeluarga.venue}
                </p>
                <p className="mt-1 text-sm leading-relaxed" style={{ color: "var(--text)", opacity: 0.6 }}>
                  {makanKeluarga.address}
                </p>
              </div>
            </div>
          </div>

          <a
            href={makanKeluarga.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 block w-full rounded-full py-3 text-center text-sm font-medium uppercase transition-all hover:opacity-80"
            style={{
              backgroundColor: "var(--primary)",
              color: "#FFFFFF",
            }}
          >
            Lihat Lokasi
          </a>
        </motion.div>

        <motion.div
          className="mt-12 text-center p-6 rounded-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8 }}
          style={{
            backgroundColor: "color-mix(in srgb, var(--primary-light) 15%, transparent)",
            border: "1px solid color-mix(in srgb, var(--primary) 30%, transparent)",
          }}
        >
          <p className="text-2xl mb-3">🎉</p>
          <p className="text-sm font-medium mb-3" style={{ color: "var(--text)" }}>
            Tasyakuran keluarga akan dilaksanakan di Resto Nawasena setelah acara berlangsung.
          </p>
          <p className="text-sm mb-4" style={{ color: "var(--text)" }}>
            Kami mengundang keluarga untuk hadir tepat waktu sesuai jadwal yang telah ditentukan.
          </p>
          <p className="text-sm font-semibold" style={{ color: "var(--primary-dark)" }}>
            Dengan penuh hormat, kami tidak mengadakan penerimaan tamu di rumah maupun di luar waktu acara tasyakuran.
          </p>
        </motion.div>
      </div>
    </section>
  );
}