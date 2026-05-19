"use client";

import { useState, useCallback } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface GalleryImage {
  src: string;
  alt: string;
}

const BENTO = [
  "col-span-2 row-span-2 sm:col-span-2 sm:row-span-2",
  "col-span-1 row-span-1 sm:col-span-1 sm:row-span-1",
  "col-span-1 row-span-1 sm:col-span-1 sm:row-span-2",
  "col-span-1 row-span-1 sm:col-span-1 sm:row-span-1",
  "col-span-1 row-span-1 sm:col-span-1 sm:row-span-1",
  "col-span-2 row-span-1 sm:col-span-2 sm:row-span-1",
  "col-span-1 row-span-1 sm:col-span-1 sm:row-span-1",
  "col-span-1 row-span-1 sm:col-span-1 sm:row-span-1",
];

export default function GallerySection({ images }: { images: GalleryImage[] }) {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-80px" });
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const bento = images.slice(0, 8);
  const extra = images.slice(8);

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const nextImage = useCallback(() => setLightboxIndex((p) => (p !== null ? (p + 1) % images.length : null)), [images.length]);
  const prevImage = useCallback(() => setLightboxIndex((p) => (p !== null ? (p - 1 + images.length) % images.length : null)), [images.length]);

  return (
    <>
      <section ref={sectionRef} className="relative py-24" style={{ backgroundColor: "var(--bg)" }}>
        <div className="mx-auto max-w-5xl px-3 sm:px-6">
          <motion.div
            className="mb-10 sm:mb-14 text-center"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
          >
            <p
              className="font-[family-name:var(--font-cormorant)] text-sm tracking-[0.4em] uppercase"
              style={{ color: "var(--secondary)" }}
            >
              Moment Bahagia
            </p>
            <div className="ornament-divider mt-4">
              <span className="text-xs" style={{ color: "var(--primary)" }}>✦</span>
            </div>
          </motion.div>

{/* Bento grid — responsive for both mobile (2-col) and desktop (4-col) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 auto-rows-[140px] sm:auto-rows-[200px] gap-2 sm:gap-3">
            {bento.map((image, index) => (
              <motion.div
                key={`bento-${index}`}
                className={`${BENTO[index]} relative overflow-hidden rounded-xl sm:rounded-2xl cursor-pointer group`}
                initial={{ opacity: 0, scale: 0.93 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.5, delay: index * 0.07 }}
                onClick={() => setLightboxIndex(index)}
                whileHover={{ scale: 1.015 }}
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 px-3 sm:px-4 pb-2 sm:pb-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <p className="font-[family-name:var(--font-cormorant)] text-[11px] sm:text-sm tracking-wider uppercase text-white/80">
                    {image.alt}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Extra photos — card column on mobile, 3-col on desktop */}
          {extra.length > 0 && (
            <div className="mt-2 sm:mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
              {extra.map((image, index) => (
                <motion.div
                  key={`extra-${index}`}
                  className="relative overflow-hidden rounded-xl sm:rounded-2xl cursor-pointer group"
                  style={{ aspectRatio: image.alt === "#TEMPUHSELAMANYA" ? "4/3" : "4/5" }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.5 + index * 0.06, duration: 0.4 }}
                  onClick={() => setLightboxIndex(bento.length + index)}
                  whileHover={{ scale: 1.03 }}
                >
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-0 left-0 right-0 px-3 pb-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <p className="font-[family-name:var(--font-cormorant)] text-sm tracking-wider uppercase text-white/80">
                      {image.alt}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          <motion.p
            className="mt-8 sm:mt-12 text-center font-[family-name:var(--font-lora)] text-sm"
            style={{ color: "var(--text)", opacity: 0.4 }}
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 0.4 } : {}}
            transition={{ delay: 0.8 }}
          >
            {images.length} momen dari perjalanan kami
          </motion.p>
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeLightbox}
          >
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white/60 hover:text-white hover:bg-white/20 transition-colors z-10"
            >
              <X className="h-5 w-5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); prevImage(); }}
              className="absolute left-2 sm:left-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white/60 hover:text-white hover:bg-white/20 transition-colors z-10"
            >
              <ChevronLeft className="h-5 w-5 sm:h-7 sm:w-7" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); nextImage(); }}
              className="absolute right-2 sm:right-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white/60 hover:text-white hover:bg-white/20 transition-colors z-10"
            >
              <ChevronRight className="h-5 w-5 sm:h-7 sm:w-7" />
            </button>

            <motion.div
              key={lightboxIndex}
              className="relative max-h-[85vh] max-w-[92vw] sm:max-w-3xl mx-auto"
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={images[lightboxIndex].src}
                alt={images[lightboxIndex].alt}
                className="max-h-[85vh] w-auto mx-auto rounded-lg sm:rounded-xl object-contain"
              />
              <p className="absolute bottom-0 left-0 right-0 text-center py-3 px-4 font-[family-name:var(--font-cormorant)] text-xs sm:text-sm tracking-wider text-white/70">
                {images[lightboxIndex].alt}
              </p>
            </motion.div>

            <div className="absolute bottom-4 sm:bottom-6 left-0 right-0 text-center font-[family-name:var(--font-cormorant)] text-xs tracking-wider text-white/40">
              {lightboxIndex + 1} / {images.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}