"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Heart } from "lucide-react";

export default function FooterSection({ hashtag, footerText }: { hashtag: string; footerText: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.footer
      ref={ref}
      className="relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : {}}
      transition={{ duration: 1 }}
    >
      <div className="h-24" style={{ background: `linear-gradient(to bottom, var(--bg), var(--cover-bg-mid))` }} />

      <div className="py-20 text-center" style={{ background: `linear-gradient(180deg, var(--cover-bg-mid) 0%, var(--cover-bg) 100%)` }}>
        <motion.p
          className="font-[family-name:var(--font-cormorant)] text-base leading-relaxed max-w-sm mx-auto px-6"
          style={{ color: "var(--cover-text)", opacity: 0.5 }}
          initial={{ y: 20, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 0.5 } : {}}
          transition={{ delay: 0.2 }}
        >
          Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir untuk memberikan doa restu
        </motion.p>

        <motion.p
          className="font-[family-name:var(--font-cormorant)] mt-8 text-sm"
          style={{ color: "var(--cover-text)", opacity: 0.3 }}
          initial={{ y: 20, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 0.3 } : {}}
          transition={{ delay: 0.4 }}
        >
          اَلْحَمْدُ لِلّٰهِ رَبِّ الْعٰلَمِيْنَ
        </motion.p>

        <motion.p
          className="font-[family-name:var(--font-cormorant)] mt-6 text-sm tracking-[0.3em] uppercase"
          style={{ color: "var(--primary-light)", opacity: 0.5 }}
          initial={{ y: 20, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 0.5 } : {}}
          transition={{ delay: 0.5 }}
        >
          Wassalamualaikum Warahmatullahi Wabarakatuh
        </motion.p>

        <motion.div
          className="mt-12"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={isInView ? { scale: 1, opacity: 1 } : {}}
          transition={{ delay: 0.7, type: "spring" }}
        >
          <div className="ornament-divider mb-6">
            <Heart className="h-3 w-3" style={{ color: "var(--primary-light)", opacity: 0.4, fill: "currentColor" }} />
          </div>

          <p className="font-[family-name:var(--font-playfair)] text-2xl sm:text-3xl italic" style={{ color: "var(--cover-text)" }}>
            {footerText}
          </p>

          <p className="font-[family-name:var(--font-cormorant)] mt-4 text-sm tracking-[0.3em]" style={{ color: "var(--primary-light)", opacity: 0.4 }}>
            {hashtag}
          </p>
        </motion.div>

        <div className="mt-16 pt-6" style={{ borderTop: `1px solid color-mix(in srgb, var(--cover-text) 5%, transparent)` }}>
          <p className="font-[family-name:var(--font-cormorant)] text-xs" style={{ color: "var(--cover-text)", opacity: 0.2 }}>
            © 2026 · Made with <Heart className="inline h-3 w-3" style={{ color: "#ef4444", opacity: 0.4, fill: "currentColor" }} />
          </p>
        </div>
      </div>
    </motion.footer>
  );
}
