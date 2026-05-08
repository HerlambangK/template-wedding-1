"use client";

import { useState } from "react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { CreditCard, Gift, Copy, Check } from "lucide-react";

interface GiftInfo {
  type: string;
  bankName?: string;
  accountNumber?: string;
  accountHolder?: string;
  label?: string;
  address?: string;
  phone?: string;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs transition-all hover:opacity-80"
      style={{ backgroundColor: "var(--bg-alt)", color: "var(--text-light)" }}
    >
      {copied ? <><Check className="h-3 w-3" /> Tersalin</> : <><Copy className="h-3 w-3" /> Salin</>}
    </button>
  );
}

export default function GiftSection({ gifts }: { gifts: GiftInfo[] }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="relative py-24" style={{ backgroundColor: "var(--bg-alt)" }}>
      <div className="mx-auto max-w-lg px-6">
        <motion.div className="mb-16 text-center" initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}}>
          <p className="font-[family-name:var(--font-cormorant)] text-sm tracking-[0.4em] uppercase" style={{ color: "var(--secondary)" }}>
            Amplop Digital
          </p>
          <div className="ornament-divider mt-4">
            <span className="text-xs" style={{ color: "var(--primary)" }}>✦</span>
          </div>
          <p className="font-[family-name:var(--font-lora)] mt-6 text-sm leading-relaxed" style={{ color: "var(--text)", opacity: 0.6 }}>
            Doa restu Anda merupakan karunia yang sangat berarti bagi kami.
            Namun jika Anda ingin memberikan tanda kasih, dapat melalui:
          </p>
        </motion.div>

        <div className="space-y-4">
          {gifts.map((gift, index) => (
            <motion.div
              key={index}
              className="rounded-xl bg-white p-6"
              style={{ border: `1px solid color-mix(in srgb, var(--primary-light) 20%, transparent)` }}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.15 }}
            >
              {gift.type === "bank" ? (
                <div className="flex items-start gap-4">
                  <CreditCard className="mt-1 h-5 w-5 flex-shrink-0" style={{ color: "var(--primary)" }} />
                  <div className="flex-1">
                    <p className="font-[family-name:var(--font-lora)] text-xs" style={{ color: "var(--text)", opacity: 0.5 }}>{gift.bankName}</p>
                    <p className="font-[family-name:var(--font-playfair)] mt-1 text-lg" style={{ color: "var(--text)" }}>{gift.accountNumber}</p>
                    <p className="font-[family-name:var(--font-lora)] mt-0.5 text-sm" style={{ color: "var(--text)", opacity: 0.7 }}>a.n. {gift.accountHolder}</p>
                    <div className="mt-3"><CopyButton text={gift.accountNumber!} /></div>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-4">
                  <Gift className="mt-1 h-5 w-5 flex-shrink-0" style={{ color: "var(--primary)" }} />
                  <div>
                    <p className="font-[family-name:var(--font-lora)] text-sm font-semibold" style={{ color: "var(--text)" }}>{gift.label}</p>
                    <p className="font-[family-name:var(--font-lora)] mt-1 text-xs leading-relaxed" style={{ color: "var(--text)", opacity: 0.6 }}>{gift.address}</p>
                    <p className="font-[family-name:var(--font-lora)] mt-1 text-xs" style={{ color: "var(--primary)" }}>{gift.phone}</p>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
