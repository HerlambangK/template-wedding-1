"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

interface Quote {
  arabic?: string;
  text: string;
  source: string;
}

export default function QuoteSection({ quotes }: { quotes: Quote[] }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="relative py-24" style={{ backgroundColor: "var(--bg)" }}>
      <div className="mx-auto max-w-2xl px-6 text-center">
        {quotes.map((quote, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: index * 0.2 }}
          >
            <span className="font-[family-name:var(--font-playfair)] text-6xl opacity-30" style={{ color: "var(--primary-light)" }}>
              ❝
            </span>
            {quote.arabic && (
              <p className="mt-6 text-2xl leading-relaxed" style={{ color: "var(--primary)", fontFamily: "system-ui" }} dir="rtl">
                {quote.arabic}
              </p>
            )}
            <p className="font-[family-name:var(--font-cormorant)] mt-6 text-xl leading-relaxed italic" style={{ color: "var(--text)", opacity: 0.8 }}>
              {quote.text}
            </p>
            <p className="font-[family-name:var(--font-lora)] mt-4 text-sm" style={{ color: "var(--primary)" }}>
              — {quote.source}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
