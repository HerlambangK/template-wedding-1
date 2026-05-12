"use client";

import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Mail, Lock, Eye, EyeOff, LogIn, Chrome, Sparkles, User } from "lucide-react";
import { useToast } from "@/components/Toast";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const toast = useToast();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showRegisPassword, setShowRegisPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleLogin = async () => {
    setLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    setLoading(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password.trim()) {
      setError("Email dan password harus diisi");
      return;
    }
    setLoading(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setLoading(false);
    if (signInError) {
      if (signInError.message?.toLowerCase().includes("invalid login credentials")) {
        setError("Email atau password salah. Jika sebelumnya login pakai Magic Link, atur password dulu dari dashboard.");
      } else {
        setError(signInError.message);
      }
      toast.error(signInError.message);
      return;
    }
    toast.success("Berhasil masuk!");
    router.push("/dashboard");
    router.refresh();
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim()) {
      setError("Masukkan email terlebih dahulu");
      return;
    }
    if (!password.trim() || password.length < 6) {
      setError("Password minimal 6 karakter");
      return;
    }
    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email.trim(),
        password,
        fullName: name.trim() || email.trim().split("@")[0],
      }),
    });

    setLoading(false);

    if (!res.ok) {
      let msg = "Gagal mendaftarkan akun";
      try {
        const body = await res.json();
        msg = body.error || body.hint || msg;
      } catch {}
      setError(msg);
      toast.error(msg);
      return;
    }

    // Auto-login after registration
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (signInError) {
      setError("Akun berhasil dibuat, tapi gagal login otomatis. Silakan login manual.");
      toast.success("Akun berhasil dibuat!");
      return;
    }

    toast.success("Akun berhasil dibuat!");
    router.push("/dashboard");
    router.refresh();
  };

  const inputClass =
    "w-full rounded-lg border border-white/20 bg-white/5 pl-10 pr-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition-all focus:border-[#D4A843] focus:ring-1 focus:ring-[#D4A843]/20";

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4 sm:px-6 py-8"
      style={{
        background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%)",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-6 sm:mb-8">
          <Heart className="mx-auto h-8 w-8 sm:h-10 sm:w-10 text-[#D4A843]" fill="#D4A843" />
          <h1 className="font-[family-name:var(--font-playfair)] mt-4 text-3xl sm:text-4xl text-white italic">
            Undangan Nikah
          </h1>
          <p className="mt-2 text-xs sm:text-sm tracking-[0.2em] sm:tracking-[0.3em] uppercase text-gray-500">
            Buat undangan digital premium
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8 backdrop-blur-sm">
          {/* Google */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm text-white transition-all hover:bg-white/20 disabled:opacity-50 active:scale-[0.98]"
          >
            <Chrome className="h-4 w-4 sm:h-5 sm:w-5" />
            Masuk dengan Google
          </button>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-xs text-gray-500 tracking-widest uppercase">atau</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          {/* Tab: Login / Daftar */}
          <div className="mb-5 flex rounded-xl bg-white/5 p-1">
            {[
              { id: "login" as const, label: "Masuk", icon: LogIn },
              { id: "register" as const, label: "Daftar", icon: Sparkles },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => { setMode(id); setError(""); }}
                className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all ${
                  mode === id ? "bg-[#D4A843] text-black shadow-sm" : "text-gray-400 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4" /> {label}
              </button>
            ))}
          </div>

          {/* Error */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                key={error}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-xs text-red-400"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Daftar — langsung email + password */}
          {mode === "register" && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nama lengkap (opsional)"
                  className={inputClass}
                />
              </div>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className={inputClass}
                  autoComplete="email"
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input
                  type={showRegisPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password (min 6 karakter)"
                  className="w-full rounded-lg border border-white/20 bg-white/5 pl-10 pr-12 py-3 text-sm text-white placeholder-gray-500 outline-none transition-all focus:border-[#D4A843] focus:ring-1 focus:ring-[#D4A843]/20"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowRegisPassword(!showRegisPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showRegisPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-[#D4A843] px-6 py-3 text-sm font-semibold text-black transition-all hover:bg-[#B8860B] disabled:opacity-50 active:scale-[0.98]"
              >
                {loading ? (
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                {loading ? "Memproses..." : "Daftar"}
              </button>
            </form>
          )}

          {/* Masuk — email + password */}
          {mode === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className={inputClass}
                  autoComplete="email"
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full rounded-lg border border-white/20 bg-white/5 pl-10 pr-12 py-3 text-sm text-white placeholder-gray-500 outline-none transition-all focus:border-[#D4A843] focus:ring-1 focus:ring-[#D4A843]/20"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-[#D4A843] px-6 py-3 text-sm font-semibold text-black transition-all hover:bg-[#B8860B] disabled:opacity-50 active:scale-[0.98]"
              >
                {loading ? (
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <LogIn className="h-4 w-4" />
                )}
                {loading ? "Memproses..." : "Masuk dengan Password"}
              </button>
            </form>
          )}
        </div>

        <p className="mt-5 sm:mt-6 text-center text-xs text-gray-600">
          Gratis untuk 1 undangan · Tanpa kartu kredit
        </p>
      </motion.div>
    </div>
  );
}
