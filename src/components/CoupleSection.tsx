"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Heart, Instagram } from "lucide-react";

interface PersonInfo {
  name: string;
  fullName: string;
  father: string;
  mother: string;
  childOrder: string;
  photo: string;
  instagram: string;
}

function PersonCard({ person, index }: { person: PersonInfo; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      className="flex flex-col items-center text-center"
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay: index * 0.3 }}
    >
      <motion.div
        className="relative mb-6 sm:mb-8"
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <div className="relative h-32 w-32 sm:h-48 sm:w-48 md:h-56 md:w-56">
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: `conic-gradient(from 0deg, var(--primary-light), transparent 60deg, var(--primary-light) 120deg, transparent 180deg, var(--primary-light) 240deg, transparent 300deg, var(--primary-light))`,
              padding: 3,
            }}
          >
            <div className="h-full w-full rounded-full" style={{ backgroundColor: "var(--bg-alt)" }} />
          </div>

          <div
            className="absolute overflow-hidden rounded-full"
            style={{
              inset: 3,
              boxShadow: `0 4px 24px rgba(0,0,0,0.15)`,
            }}
          >
            {person.photo ? (
              <img
                src={person.photo}
                alt={person.fullName}
                className="h-full w-full object-cover"
              />
            ) : (
              <div
                className="flex h-full w-full items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, var(--bg-alt), var(--bg-dark))`,
                }}
              >
                <span
                  className="font-[family-name:var(--font-playfair)] text-3xl font-bold sm:text-5xl"
                  style={{ color: "var(--primary)", opacity: 0.8 }}
                >
                  {person.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      <motion.h3
        className="font-[family-name:var(--font-playfair)] text-xl sm:text-3xl md:text-4xl italic"
        style={{ color: "var(--text)" }}
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ delay: index * 0.3 + 0.4 }}
      >
        {person.fullName}
      </motion.h3>

      {(person.father || person.mother) && (
        <motion.div
          className="mt-4 space-y-1"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: index * 0.3 + 0.6 }}
        >
          {person.childOrder && (
            <p className="font-[family-name:var(--font-cormorant)] text-sm" style={{ color: "var(--text)", opacity: 0.5 }}>
              {person.childOrder} dari
            </p>
          )}
          {person.father && (
            <p className="font-[family-name:var(--font-lora)] text-sm" style={{ color: "var(--text)", opacity: 0.8 }}>
              {person.father}
            </p>
          )}
          {person.father && person.mother && (
            <p className="font-[family-name:var(--font-cormorant)] text-xs" style={{ color: "var(--text)", opacity: 0.3 }}>
              &
            </p>
          )}
          {person.mother && (
            <p className="font-[family-name:var(--font-lora)] text-sm" style={{ color: "var(--text)", opacity: 0.8 }}>
              {person.mother}
            </p>
          )}
        </motion.div>
      )}

      {person.instagram && (
        <motion.a
          href={`https://instagram.com/${person.instagram.replace("@", "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-1.5 font-[family-name:var(--font-cormorant)] text-sm transition-colors"
          style={{ color: "var(--primary)" }}
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: index * 0.3 + 0.8 }}
        >
          <Instagram className="h-3.5 w-3.5" />
          {person.instagram}
        </motion.a>
      )}
    </motion.div>
  );
}

export default function CoupleSection({
  groom,
  bride,
}: {
  groom: PersonInfo;
  bride: PersonInfo;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="relative py-28" style={{ backgroundColor: "var(--bg-alt)" }}>
      <div className="mx-auto max-w-4xl px-6">
        <motion.div
          className="mb-20 text-center"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6 }}
        >
          <p className="font-[family-name:var(--font-cormorant)] text-sm tracking-[0.4em] uppercase" style={{ color: "var(--secondary)" }}>
            Mempelai
          </p>
          <div className="ornament-divider mt-4">
            <Heart className="h-4 w-4" style={{ color: "var(--primary)", fill: "var(--primary)" }} />
          </div>
        </motion.div>

        <div className="grid grid-cols-2 gap-6 sm:gap-8">
          <PersonCard person={groom} index={0} />
          <PersonCard person={bride} index={1} />
        </div>
      </div>
    </section>
  );
}
