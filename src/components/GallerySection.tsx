"use client";

import { useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface GalleryImage {
  src: string;
  alt: string;
}

export default function GallerySection({ images }: { images: GalleryImage[] }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  const nextImage = () => setLightboxIndex((p) => (p !== null ? (p + 1) % images.length : null));
  const prevImage = () => setLightboxIndex((p) => (p !== null ? (p - 1 + images.length) % images.length : null));

  const heights = ["aspect-square", "aspect-[3/4]", "aspect-square", "aspect-[4/3]", "aspect-[3/4]", "aspect-square"];

  return (
    <>
      <section ref={ref} className="relative py-24" style={{ backgroundColor: "var(--bg)" }}>
        <div className="mx-auto max-w-5xl px-6">
          <motion.div className="mb-16 text-center" initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}}>
            <p className="font-[family-name:var(--font-cormorant)] text-sm tracking-[0.4em] uppercase" style={{ color: "var(--secondary)" }}>
              Moment Bahagia
            </p>
            <div className="ornament-divider mt-4">
              <span className="text-xs" style={{ color: "var(--primary)" }}>✦</span>
            </div>
          </motion.div>

          <div className="columns-2 sm:columns-3 gap-3 sm:gap-4">
            {images.map((image, index) => (
              <motion.div
                key={index}
                className={`gallery-item mb-3 sm:mb-4 cursor-pointer overflow-hidden rounded-lg ${heights[index % heights.length]}`}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                onClick={() => openLightbox(index)}
                whileHover={{ scale: 1.03 }}
              >
                <div
                  className="h-full w-full flex items-center justify-center relative overflow-hidden group"
                  style={{ background: `linear-gradient(135deg, var(--bg-alt), var(--bg-dark))` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="text-center">
                    <p className="font-[family-name:var(--font-playfair)] text-4xl italic" style={{ color: "var(--primary-light)", opacity: 0.3 }}>
                      {index + 1}
                    </p>
                    <p className="font-[family-name:var(--font-cormorant)] text-xs mt-1" style={{ color: "var(--primary-light)", opacity: 0.5 }}>
                      {image.alt}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeLightbox}
          >
            <button onClick={closeLightbox} className="absolute top-6 right-6 text-white/60 hover:text-white transition-colors">
              <X className="h-8 w-8" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); prevImage(); }} className="absolute left-4 text-white/60 hover:text-white transition-colors">
              <ChevronLeft className="h-10 w-10" />
            </button>
            <motion.div
              key={lightboxIndex}
              className="max-w-3xl max-h-[80vh] mx-16 flex items-center justify-center"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-96 h-96 rounded-lg flex items-center justify-center" style={{ background: `linear-gradient(135deg, var(--bg-alt), var(--bg-dark))` }}>
                <p className="font-[family-name:var(--font-cormorant)] text-lg" style={{ color: "var(--primary-light)" }}>
                  {images[lightboxIndex].alt}
                </p>
              </div>
            </motion.div>
            <button onClick={(e) => { e.stopPropagation(); nextImage(); }} className="absolute right-4 text-white/60 hover:text-white transition-colors">
              <ChevronRight className="h-10 w-10" />
            </button>
            <div className="absolute bottom-6 text-white/40 font-[family-name:var(--font-cormorant)] text-sm tracking-wider">
              {lightboxIndex + 1} / {images.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
