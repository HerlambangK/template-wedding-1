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
    <section ref={ref} className="relative py-24" style={{ backgroundColor: "var(--bg-alt)" }}>
      <div className="mx-auto max-w-lg px-6">
        <motion.div
          className="mb-12 text-center"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
        >
          <p
            className="font-[family-name:var(--font-cormorant)] text-sm tracking-[0.4em] uppercase"
            style={{ color: "var(--secondary)" }}
          >
            Ucapan & Doa
          </p>
          <div className="ornament-divider mt-4">
            <span className="text-xs" style={{ color: "var(--primary)" }}>
              ✦
            </span>
          </div>
        </motion.div>

        {/* Form */}
        <motion.form
          onSubmit={handleSubmit}
          className="mb-8 rounded-xl bg-white p-6"
          style={{
            border: `1px solid color-mix(in srgb, var(--primary-light) 20%, transparent)`,
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2 }}
        >
          <div className="space-y-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nama Anda (kosongkan jika ingin anonim)"
              className="w-full rounded-lg bg-transparent px-4 py-2.5 font-[family-name:var(--font-lora)] text-sm outline-none"
              style={{
                border: `1px solid color-mix(in srgb, var(--primary-light) 30%, transparent)`,
                color: "var(--text)",
              }}
            />
            <div className="relative">
              <textarea
                ref={textareaRef}
                required
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tulis ucapan & doa..."
                className="w-full resize-none rounded-lg bg-transparent px-4 py-2.5 pr-10 font-[family-name:var(--font-lora)] text-sm outline-none"
                style={{
                  border: `1px solid color-mix(in srgb, var(--primary-light) 30%, transparent)`,
                  color: "var(--text)",
                }}
              />
              <button
                type="button"
                onClick={() => setShowEmoji((v) => !v)}
                className="absolute right-2 top-2 rounded-md p-1 text-lg transition-colors hover:bg-black/5"
                title="Tambahkan emoji / stiker"
              >
                <Gift className="h-4 w-4" style={{ color: "var(--primary)" }} />
              </button>
            </div>

            {/* Emoji picker */}
            <AnimatePresence>
              {showEmoji && (
                <motion.div
                  ref={emojiRef}
                  initial={{ opacity: 0, y: -6, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="rounded-xl border bg-white p-3 shadow-lg"
                  style={{ borderColor: "color-mix(in srgb, var(--primary-light) 20%, transparent)" }}
                >
                  <div className="grid grid-cols-8 gap-1">
                    {EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => { insertEmoji(emoji); }}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-lg transition-colors hover:bg-black/5"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <button
              type="submit"
              disabled={sending}
              className="flex w-full items-center justify-center gap-2 rounded-full px-6 py-2.5 font-[family-name:var(--font-cormorant)] text-sm tracking-[0.15em] uppercase text-white transition-all hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: "var(--primary)" }}
            >
              <Send className="h-4 w-4" />
              {sending ? "Mengirim..." : "Kirim Ucapan"}
            </button>
          </div>
        </motion.form>

        {/* Messages list */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div
                className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
                style={{ backgroundColor: "color-mix(in srgb, var(--primary-light) 6%, transparent)" }}
              >
                <MessageCircle className="h-6 w-6" style={{ color: "var(--primary-light)", opacity: 0.3 }} />
              </div>
              <p className="font-[family-name:var(--font-lora)] text-sm" style={{ color: "var(--text)", opacity: 0.25 }}>
                Belum ada ucapan & doa
              </p>
              <p className="font-[family-name:var(--font-cormorant)] text-xs tracking-[0.2em] uppercase mt-2" style={{ color: "var(--text)", opacity: 0.15 }}>
                Jadilah yang pertama
              </p>
            </motion.div>
          )}
          {messages.map((msg, i) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.3 }}
              whileHover={{ y: -2 }}
              className="rounded-xl bg-white px-5 py-4 transition-shadow duration-200"
              style={{
                boxShadow: `0 1px 3px color-mix(in srgb, var(--primary-light) 6%, transparent), 0 0 0 1px color-mix(in srgb, var(--primary-light) 4%, transparent)`,
              }}
            >
              <div className="flex items-start gap-3.5">
                <div
                  className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold uppercase"
                  style={{
                    backgroundColor: `color-mix(in srgb, var(--primary-light) 10%, transparent)`,
                    color: "var(--primary)",
                  }}
                >
                  {msg.name === "Anonim" ? "—" : msg.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-3">
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
                      className="flex-shrink-0 font-[family-name:var(--font-cormorant)] text-[11px]"
                      style={{ color: "var(--text)", opacity: 0.25 }}
                    >
                      {timeAgo(msg.created_at)}
                    </span>
                  </div>
                  <p
                    className="mt-1.5 font-[family-name:var(--font-lora)] text-sm leading-relaxed"
                    style={{ color: "var(--text)", opacity: 0.75 }}
                  >
                    {msg.message}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
