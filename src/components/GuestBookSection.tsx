"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import type { GuestMessage } from "@/lib/types";
import { Send, MessageCircle, Gift } from "lucide-react";

const EMOJIS = [
  "💍", "🎊", "🎉", "💐", "🌸", "🌺", "💒", "🕊️",
  "💕", "❤️", "💖", "💗", "💝", "💘", "🥰", "😍",
  "🎀", "🎈", "🥂", "🍾", "✨", "🌹", "🎁", "🧧",
  "🙏", "🤲", "💌", "☺️", "😊", "🤗", "👰", "🤵",
];

interface Props {
  invitationId: string;
  initialMessages: GuestMessage[];
  guestName?: string;
}

export default function GuestBookSection({ invitationId, initialMessages, guestName }: Props) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const supabase = createClient();

  const [messages, setMessages] = useState<GuestMessage[]>(initialMessages);
  const [name, setName] = useState(guestName || "");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const emojiRef = useRef<HTMLDivElement>(null);

  // Close emoji picker on outside click
  useEffect(() => {
    if (!showEmoji) return;
    const handler = (e: MouseEvent) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) {
        setShowEmoji(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showEmoji]);

  const insertEmoji = useCallback((emoji: string) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const next = message.slice(0, start) + emoji + message.slice(end);
    setMessage(next);
    // restore cursor position after React re-render
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(start + emoji.length, start + emoji.length);
    });
  }, [message]);

  useEffect(() => {
    if (guestName) setName(guestName);
  }, [guestName]);

  // Realtime subscription — pesan dari orang lain muncul otomatis
  useEffect(() => {
    const channel = supabase
      .channel(`guest-messages-${invitationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "guest_messages",
          filter: `invitation_id=eq.${invitationId}`,
        },
        (payload: { new: Record<string, unknown> }) => {
          const newMsg = payload.new as unknown as GuestMessage;
          if (newMsg.is_visible) {
            setMessages((prev) => {
              if (prev.some((m) => m.id === newMsg.id)) return prev;
              return [newMsg, ...prev];
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [invitationId, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setSending(true);

    const { data, error } = await supabase
      .from("guest_messages")
      .insert({
        invitation_id: invitationId,
        name: name.trim() || "Anonim",
        message: message.trim(),
      })
      .select()
      .single();

    if (!error && data) {
      // Optimistic update — pesan langsung muncul tanpa nunggu Realtime
      setMessages((prev) => {
        if (prev.some((m) => m.id === data.id)) return prev;
        return [data, ...prev];
      });
    }

    setName(guestName || "");
    setMessage("");
    setSending(false);
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Baru saja";
    if (mins < 60) return `${mins} menit lalu`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} jam lalu`;
    const days = Math.floor(hours / 24);
    return `${days} hari lalu`;
  };

  return (
    <section ref={ref} className="relative py-24 overflow-hidden" style={{ backgroundColor: "var(--bg-alt)" }}>
      {/* Decorative background elements */}
      <motion.div
        className="absolute -top-20 -right-20 h-64 w-64 rounded-full"
        style={{
          background: `radial-gradient(circle, color-mix(in srgb, var(--primary-light) 4%, transparent) 0%, transparent 70%)`,
        }}
        animate={{ scale: [1, 1.05, 1], opacity: [0.5, 0.7, 0.5] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full"
        style={{
          background: `radial-gradient(circle, color-mix(in srgb, var(--primary-light) 3%, transparent) 0%, transparent 70%)`,
        }}
        animate={{ scale: [1, 1.08, 1], opacity: [0.4, 0.6, 0.4] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />

      <div className="mx-auto max-w-lg px-4 sm:px-5 relative">
        {/* Section header */}
        <motion.div
          className="mb-8 sm:mb-10 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <motion.p
            className="font-[family-name:var(--font-playfair)] text-xl sm:text-2xl italic"
            style={{ color: "var(--primary)" }}
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1, duration: 0.4 }}
          >
            Ucapan & Doa
          </motion.p>
          <motion.div
            className="mt-3 flex items-center justify-center gap-2"
            initial={{ opacity: 0, scaleX: 0 }}
            animate={isInView ? { opacity: 1, scaleX: 1 } : {}}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <div className="h-px w-8" style={{ backgroundColor: "var(--primary)", opacity: 0.3 }} />
            <motion.span
              className="text-sm"
              style={{ color: "var(--primary)" }}
              animate={{ rotate: [0, 10, 0, -10, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            >
              ✦
            </motion.span>
            <div className="h-px w-8" style={{ backgroundColor: "var(--primary)", opacity: 0.3 }} />
          </motion.div>
        </motion.div>

        {/* Form */}
        <motion.form
          onSubmit={handleSubmit}
          className="mb-6 sm:mb-8 rounded-2xl bg-white p-5 sm:p-6"
          style={{
            boxShadow: `0 4px 20px color-mix(in srgb, var(--primary-light) 6%, transparent)`,
          }}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.25, duration: 0.5 }}
        >
          <div className="space-y-4">
            <div className="group relative">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama Anda (kosongkan jika ingin anonim)"
                className="w-full rounded-xl bg-transparent px-4 py-3 font-[family-name:var(--font-lora)] text-sm outline-none transition-all duration-300 focus:shadow-[inset_0_0_0_1px]"
                style={{
                  border: `1px solid color-mix(in srgb, var(--primary-light) 25%, transparent)`,
                  color: "var(--text)",
                }}
              />
            </div>

            <div className="group relative">
              <textarea
                ref={textareaRef}
                required
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tulis ucapan & doa..."
                className="w-full resize-none rounded-xl bg-transparent px-4 py-3 pr-11 font-[family-name:var(--font-lora)] text-sm outline-none transition-all duration-300"
                style={{
                  border: `1px solid color-mix(in srgb, var(--primary-light) 25%, transparent)`,
                  color: "var(--text)",
                }}
              />
              <motion.button
                type="button"
                onClick={() => setShowEmoji((v) => !v)}
                className="absolute right-2.5 top-2.5 rounded-lg p-1.5 transition-colors hover:bg-black/5"
                title="Tambahkan emoji / stiker"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Gift className="h-4 w-4" style={{ color: "var(--primary)" }} />
              </motion.button>
            </div>

            {/* Emoji picker */}
            <AnimatePresence>
              {showEmoji && (
                <motion.div
                  ref={emojiRef}
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="rounded-xl border bg-white p-3 shadow-lg"
                  style={{ borderColor: "color-mix(in srgb, var(--primary-light) 20%, transparent)" }}
                >
                  <div className="grid grid-cols-8 gap-1">
                    {EMOJIS.map((emoji) => (
                      <motion.button
                        key={emoji}
                        type="button"
                        onClick={() => { insertEmoji(emoji); }}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-lg transition-colors hover:bg-black/5"
                        whileHover={{ scale: 1.25 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        {emoji}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              type="submit"
              disabled={sending}
              className="relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-full px-6 py-3 font-[family-name:var(--font-cormorant)] text-sm tracking-[0.15em] uppercase text-white transition-all"
              style={{ backgroundColor: "var(--primary)" }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
            >
              {sending ? (
                <motion.svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </motion.svg>
              ) : (
                <motion.div
                  animate={{ x: [0, 3, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Send className="h-4 w-4" />
                </motion.div>
              )}
              {sending ? "Mengirim..." : "Kirim Ucapan"}
            </motion.button>
          </div>
        </motion.form>

        {/* Messages list */}
        <div className="space-y-3 sm:space-y-3.5 max-h-[420px] overflow-y-auto">
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 sm:py-16"
            >
              <motion.div
                className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl"
                style={{ backgroundColor: "color-mix(in srgb, var(--primary-light) 6%, transparent)" }}
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <MessageCircle className="h-7 w-7" style={{ color: "var(--primary-light)", opacity: 0.3 }} />
              </motion.div>
              <motion.p
                className="font-[family-name:var(--font-playfair)] text-base italic"
                style={{ color: "var(--text)", opacity: 0.25 }}
                animate={{ opacity: [0.2, 0.35, 0.2] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              >
                Belum ada ucapan & doa
              </motion.p>
              <p className="font-[family-name:var(--font-cormorant)] text-xs tracking-[0.2em] uppercase mt-2" style={{ color: "var(--text)", opacity: 0.15 }}>
                Jadilah yang pertama
              </p>
            </motion.div>
          )}
          {messages.map((msg, i) => (
            <motion.div
              key={msg.id}
              layout
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.35, ease: "easeOut" }}
              className="relative rounded-xl overflow-hidden"
            >
              {/* Animated glowing gradient border */}
              <motion.div
                className="absolute inset-0"
                style={{
                  background: `conic-gradient(from 0deg, var(--primary), var(--primary-light), transparent 35%, var(--primary-light), var(--primary), transparent 65%, var(--primary-light), var(--primary))`,
                  filter: "blur(0.5px)",
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="absolute inset-0 opacity-40"
                style={{
                  background: `conic-gradient(from 180deg, var(--primary), var(--primary-light), transparent 35%, var(--primary-light), var(--primary), transparent 65%, var(--primary-light), var(--primary))`,
                  filter: "blur(3px)",
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              />
              {/* Card content */}
              <div className="relative m-[1.5px] rounded-[calc(0.75rem-1.5px)] bg-white z-10 px-4 py-3.5 sm:px-5 sm:py-4">
                <div className="flex items-start gap-3 sm:gap-3.5">
                  <div
                    className="mt-0.5 flex h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0 items-center justify-center rounded-full text-[10px] sm:text-xs font-semibold uppercase"
                    style={{
                      backgroundColor: `color-mix(in srgb, var(--primary-light) 10%, transparent)`,
                      color: "var(--primary)",
                    }}
                  >
                    {msg.name === "Anonim" ? "—" : msg.name.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2 sm:gap-3">
                      <span
                        className="truncate font-[family-name:var(--font-playfair)] text-sm font-semibold"
                        style={{ color: "var(--text)" }}
                      >
                        {msg.name === "Anonim" ? (
                          <span style={{ opacity: 0.4 }}>Anonim</span>
                        ) : (
                          msg.name
                        )}
                      </span>
                      <span
                        className="flex-shrink-0 font-[family-name:var(--font-cormorant)] text-[10px] sm:text-[11px]"
                        style={{ color: "var(--text)", opacity: 0.25 }}
                      >
                        {timeAgo(msg.created_at)}
                      </span>
                    </div>
                    <p
                      className="mt-1 sm:mt-1.5 font-[family-name:var(--font-lora)] text-sm leading-relaxed"
                      style={{ color: "var(--text)", opacity: 0.75 }}
                    >
                      {msg.message}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
