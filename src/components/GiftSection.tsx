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
  qrisImage?: string;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.button
      onClick={handleCopy}
      className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-medium transition-all min-h-[44px] min-w-[44px] justify-center"
      style={{
        color: copied ? "#fff" : "var(--primary)",
        backgroundColor: copied ? "var(--primary)" : "color-mix(in srgb, var(--primary) 8%, transparent)",
        border: copied ? "1px solid var(--primary)" : "1px solid color-mix(in srgb, var(--primary) 20%, transparent)",
      }}
      whileTap={{ scale: 0.95 }}
    >
      {copied ? (
        <><Check className="h-3 w-3" /> Copied</>
      ) : (
        <><Copy className="h-3 w-3" /> Copy</>
      )}
    </motion.button>
  );
}

function isValidGift(gift: GiftInfo): boolean {
  if (gift.type === "bank") {
    return !!(gift.accountNumber && gift.accountNumber.trim() && !gift.accountNumber.includes("(Isi"));
  }
  if (gift.type === "qris") {
    return !!(gift.qrisImage && gift.qrisImage.trim());
  }
  if (gift.type === "gift") {
    return !!(gift.phone && gift.phone.trim() && !gift.phone.includes("(Isi"));
  }
  return false;
}

function formatAccountNumber(num: string): string {
  return num.replace(/(.{4})/g, "$1 ").trim();
}

function BankCard({
  bankName,
  accountNumber,
  accountHolder,
  label,
  index,
}: {
  bankName?: string;
  accountNumber: string;
  accountHolder?: string;
  label?: string;
  index: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      className="relative overflow-hidden rounded-2xl bg-white/90 backdrop-blur-sm shadow-md"
      style={{ border: `1px solid color-mix(in srgb, var(--primary-light) 12%, transparent)` }}
      initial={{ opacity: 0, y: 32 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1 }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          background: `linear-gradient(160deg, var(--primary-light) 0%, transparent 40%, transparent 60%, var(--primary-light) 100%)`,
        }}
      />

      <div className="relative flex items-stretch">
        <div
          className="w-[3px] flex-shrink-0 rounded-l-2xl"
          style={{
            background: `linear-gradient(180deg, transparent 10%, var(--primary) 25%, var(--primary-light) 50%, var(--primary) 75%, transparent 90%)`,
          }}
        />

        <div className="flex-1 px-5 py-4 sm:px-6 sm:py-5">
          {label && (
            <p
              className="mb-2 text-[10px] sm:text-[11px] font-medium uppercase tracking-[.2em]"
              style={{ color: "var(--secondary)" }}
            >
              {label}
            </p>
          )}
          <div className="flex items-center gap-2.5 mb-3">
            <div
              className="flex h-7 w-7 items-center justify-center rounded-lg"
              style={{
                background: `linear-gradient(135deg, color-mix(in srgb, var(--primary) 15%, transparent), color-mix(in srgb, var(--primary) 5%, transparent))`,
              }}
            >
              <CreditCard className="h-3.5 w-3.5" style={{ color: "var(--primary)" }} />
            </div>
            <span
              className="text-[11px] font-semibold uppercase tracking-[.15em]"
              style={{ color: "var(--text)", opacity: 0.5 }}
            >
              {bankName}
            </span>
          </div>

          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xl sm:text-2xl font-semibold tracking-[.14em] tabular-nums leading-none" style={{ color: "var(--text)" }}>
                {formatAccountNumber(accountNumber)}
              </p>
              <p className="mt-1.5 text-[12px] tracking-wide" style={{ color: "var(--text)", opacity: 0.4 }}>
                a.n. {accountHolder}
              </p>
            </div>
            <CopyButton text={accountNumber} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function AddressCard({
  label,
  address,
  phone,
  index,
}: {
  label?: string;
  address?: string;
  phone?: string;
  index: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      className="relative overflow-hidden rounded-2xl bg-white/90 backdrop-blur-sm shadow-md"
      style={{ border: `1px solid color-mix(in srgb, var(--primary-light) 12%, transparent)` }}
      initial={{ opacity: 0, y: 32 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1 }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          background: `linear-gradient(160deg, var(--primary-light) 0%, transparent 40%, transparent 60%, var(--primary-light) 100%)`,
        }}
      />
      <div className="relative flex items-stretch">
        <div
          className="w-[3px] flex-shrink-0 rounded-l-2xl"
          style={{
            background: `linear-gradient(180deg, transparent 10%, var(--primary) 25%, var(--primary-light) 50%, var(--primary) 75%, transparent 90%)`,
          }}
        />
        <div className="flex-1 px-5 py-4 sm:px-6 sm:py-5 flex items-start gap-3">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-lg flex-shrink-0"
            style={{
              background: `linear-gradient(135deg, color-mix(in srgb, var(--primary) 15%, transparent), color-mix(in srgb, var(--primary) 5%, transparent))`,
            }}
          >
            <Gift className="h-3.5 w-3.5" style={{ color: "var(--primary)" }} />
          </div>
          <div>
            {label && (
              <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>
                {label}
              </p>
            )}
            {address && (
              <p className="mt-1 text-[12px] leading-relaxed" style={{ color: "var(--text)", opacity: 0.55 }}>
                {address}
              </p>
            )}
            {phone && (
              <p className="mt-1 text-[12px] font-medium" style={{ color: "var(--primary)" }}>
                {phone}
              </p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function QrisCard({
  label,
  qrisImage,
  index,
}: {
  label?: string;
  qrisImage: string;
  index: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      className="relative overflow-hidden rounded-2xl bg-white/90 backdrop-blur-sm shadow-md"
      style={{ border: `1px solid color-mix(in srgb, var(--primary-light) 12%, transparent)` }}
      initial={{ opacity: 0, y: 32 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1 }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          background: `linear-gradient(160deg, var(--primary-light) 0%, transparent 40%, transparent 60%, var(--primary-light) 100%)`,
        }}
      />
      <div className="relative flex items-stretch">
        <div
          className="w-[3px] flex-shrink-0 rounded-l-2xl"
          style={{
            background: `linear-gradient(180deg, transparent 10%, var(--primary) 25%, var(--primary-light) 50%, var(--primary) 75%, transparent 90%)`,
          }}
        />
        <div className="flex-1 px-5 py-4 sm:px-6 sm:py-5 flex flex-col items-center text-center gap-3">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-lg"
            style={{
              background: `linear-gradient(135deg, color-mix(in srgb, var(--primary) 15%, transparent), color-mix(in srgb, var(--primary) 5%, transparent))`,
            }}
          >
            <Gift className="h-3.5 w-3.5" style={{ color: "var(--primary)" }} />
          </div>
          {label && (
            <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>
              {label}
            </p>
          )}
          <img src={qrisImage} alt="QRIS" className="w-44 h-44 object-contain rounded-lg" />
        </div>
      </div>
    </motion.div>
  );
}

export default function GiftSection({ gifts }: { gifts: GiftInfo[] }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  const validGifts = gifts.filter(isValidGift);
  if (validGifts.length === 0) return null;

  return (
    <section ref={ref} className="relative py-28 overflow-hidden" style={{ backgroundColor: "var(--bg)" }}>
      {/* Background pattern — subtle dots */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, var(--text) 1px, transparent 0)`,
          backgroundSize: "32px 32px",
        }}
      />

      {/* Top line */}
      <div className="absolute top-0 inset-x-0 h-px" style={{ background: `linear-gradient(to right, transparent, var(--primary-light), transparent)`, opacity: 0.3 }} />

      <div className="relative z-10 mx-auto max-w-md px-6">
        {/* Header */}
        <motion.div
          className="mb-14 text-center"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6 }}
        >
          {/* Tiny ornament above title */}
          <motion.div
            className="mb-4 flex items-center justify-center gap-2"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.05, duration: 0.4 }}
          >
            <svg width="18" height="6" viewBox="0 0 18 6" fill="none">
              <path d="M0 3h4l1.5-2.5L9 3l3.5-2.5L14 3h4" stroke="var(--primary-light)" strokeWidth="0.5" opacity="0.5" />
            </svg>
            <span style={{ color: "var(--primary-light)", opacity: 0.4, fontSize: "8px" }}>❦</span>
            <svg width="18" height="6" viewBox="0 0 18 6" fill="none">
              <path d="M0 3h4l1.5-2.5L9 3l3.5-2.5L14 3h4" stroke="var(--primary-light)" strokeWidth="0.5" opacity="0.5" />
            </svg>
          </motion.div>

          <motion.p
            className="font-[family-name:var(--font-cormorant)] text-[12px] tracking-[.4em] uppercase"
            style={{ color: "var(--secondary)" }}
            initial={{ opacity: 0, y: 8 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
          >
            Amplop Digital
          </motion.p>

          <motion.div
            className="ornament-divider mt-4"
            initial={{ scaleX: 0 }}
            animate={isInView ? { scaleX: 1 } : {}}
            transition={{ delay: 0.25, duration: 0.5 }}
          >
            <span className="text-[10px]" style={{ color: "var(--primary)" }}>✦</span>
          </motion.div>

          <motion.p
            className="mt-5 text-[13px] leading-relaxed max-w-xs mx-auto"
            style={{ color: "var(--text)", opacity: 0.5 }}
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 0.5 } : {}}
            transition={{ delay: 0.35 }}
          >
            Doa restu Anda merupakan karunia yang sangat berarti bagi kami.
            Namun jika Anda ingin memberikan tanda kasih, dapat melalui:
          </motion.p>
        </motion.div>

        {/* Gift cards */}
        <div className="space-y-3">
          {validGifts.map((gift, index) => {
            if (gift.type === "bank") {
              return (
                <BankCard
                  key={index}
                  bankName={gift.bankName}
                  accountNumber={gift.accountNumber!}
                  accountHolder={gift.accountHolder}
                  label={gift.label}
                  index={index}
                />
              );
            }
            if (gift.type === "qris" && gift.qrisImage) {
              return (
                <QrisCard
                  key={index}
                  label={gift.label}
                  qrisImage={gift.qrisImage}
                  index={index}
                />
              );
            }
            return (
              <AddressCard
                key={index}
                label={gift.label}
                address={gift.address}
                phone={gift.phone}
                index={index}
              />
            );
          })}
        </div>

        {/* Bottom ornament */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.7 }}
        >
          <div className="flex items-center justify-center gap-2">
            <div className="h-px w-8" style={{ background: `linear-gradient(to right, transparent, var(--primary-light))`, opacity: 0.3 }} />
            <span style={{ color: "var(--primary-light)", opacity: 0.35, fontSize: "12px" }}>♡</span>
            <div className="h-px w-8" style={{ background: `linear-gradient(to left, transparent, var(--primary-light))`, opacity: 0.3 }} />
          </div>
          <p className="mt-3 text-[11px] tracking-wider italic" style={{ color: "var(--text)", opacity: 0.25 }}>
            Terima kasih atas doa & karunia Anda
          </p>
        </motion.div>
      </div>
    </section>
  );
}
