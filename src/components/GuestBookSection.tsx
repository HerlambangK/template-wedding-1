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
            <div className="text-center py-8">
              <MessageCircle
                className="mx-auto h-8 w-8"
                style={{ color: "var(--primary-light)", opacity: 0.3 }}
              />
              <p
                className="mt-2 font-[family-name:var(--font-lora)] text-sm"
                style={{ color: "var(--text)", opacity: 0.4 }}
              >
                Jadilah yang pertama mengirim ucapan!
              </p>
            </div>
          )}
          {messages.map((msg, i) => (
            <motion.div
              key={msg.id}
              className="rounded-lg bg-white p-4"
              style={{
                border: `1px solid color-mix(in srgb, var(--primary-light) 10%, transparent)`,
              }}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <div className="flex items-center justify-between">
                <p
                  className="font-[family-name:var(--font-lora)] text-sm font-semibold"
                  style={{ color: "var(--text)" }}
                >
                  {msg.name}
                </p>
                <p
                  className="font-[family-name:var(--font-cormorant)] text-xs"
                  style={{ color: "var(--text)", opacity: 0.3 }}
                >
                  {timeAgo(msg.created_at)}
                </p>
              </div>
              <p
                className="mt-1 font-[family-name:var(--font-lora)] text-sm"
                style={{ color: "var(--text)", opacity: 0.7 }}
              >
                {msg.message}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
