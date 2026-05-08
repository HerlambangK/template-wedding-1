"use client";

import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import { Heart, Mail, Chrome } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const supabase = createClient();

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setLoading(false);
    setSent(true);
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4"
      style={{
        background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%)",
      }}
    >
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Heart className="mx-auto h-10 w-10 text-[#D4A843]" fill="#D4A843" />
          <h1 className="font-[family-name:var(--font-playfair)] mt-4 text-4xl text-white italic">
            Undangan Nikah
          </h1>
          <p className="font-[family-name:var(--font-cormorant)] mt-2 text-sm tracking-[0.3em] uppercase text-gray-500">
            Buat undangan digital premium
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
          <button
            onClick={handleGoogleLogin}
            className="flex w-full items-center justify-center gap-3 rounded-full border border-white/20 bg-white/10 px-6 py-3 font-[family-name:var(--font-lora)] text-sm text-white transition-all hover:bg-white/20"
          >
            <Chrome className="h-5 w-5" />
            Masuk dengan Google
          </button>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/10" />
            <span className="font-[family-name:var(--font-cormorant)] text-xs text-gray-500 tracking-widest uppercase">
              atau
            </span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          {sent ? (
            <div className="text-center py-4">
              <Mail className="mx-auto h-8 w-8 text-[#D4A843]" />
              <p className="font-[family-name:var(--font-lora)] mt-3 text-sm text-white">
                Link login sudah dikirim ke
              </p>
              <p className="font-[family-name:var(--font-playfair)] mt-1 text-lg text-[#D4A843]">
                {email}
              </p>
              <p className="font-[family-name:var(--font-lora)] mt-2 text-xs text-gray-500">
                Cek inbox atau spam folder
              </p>
            </div>
          ) : (
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 font-[family-name:var(--font-lora)] text-sm text-white placeholder-gray-500 outline-none focus:border-[#D4A843]"
              />
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-[#D4A843] px-6 py-3 font-[family-name:var(--font-cormorant)] text-sm tracking-[0.15em] uppercase text-black transition-all hover:bg-[#B8860B] disabled:opacity-50"
              >
                <Mail className="h-4 w-4" />
                {loading ? "Mengirim..." : "Masuk dengan Email"}
              </button>
            </form>
          )}
        </div>

        <p className="mt-6 text-center font-[family-name:var(--font-cormorant)] text-xs text-gray-600">
          Gratis untuk 1 undangan · Tanpa kartu kredit
        </p>
      </div>
    </div>
  );
}
