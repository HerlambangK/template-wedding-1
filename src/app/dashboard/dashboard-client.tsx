"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { Invitation, Profile } from "@/lib/types";
import {
  Heart,
  Plus,
  Eye,
  Edit,
  BarChart3,
  Trash2,
  ExternalLink,
  LogOut,
  Crown,
  Users,
  MessageCircle,
  SendHorizonal,
  KeyRound,
  Save,
  X,
  AlertTriangle,
  EyeOff,
} from "lucide-react";
import { useToast } from "@/components/Toast";
import ConfirmDialog from "@/components/ConfirmDialog";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  invitations: Invitation[];
  profile: Profile | null;
  userEmail: string;
  hasPassword: boolean;
}

export default function DashboardClient({ invitations, profile, userEmail, hasPassword }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const toast = useToast();
  const [passwordSet, setPasswordSet] = useState(hasPassword);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [publishing, setPublishing] = useState<string | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    if (!passwordSet) setShowPasswordModal(true);
  }, [passwordSet]);

  const handleSetPassword = async () => {
    setPasswordError("");
    if (newPassword.length < 6) {
      setPasswordError("Password minimal 6 karakter");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Password tidak cocok");
      return;
    }
    setSavingPassword(true);
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
      data: { has_password: true },
    });
    setSavingPassword(false);
    if (error) {
      setPasswordError(error.message);
      toast.error(error.message);
    } else {
      toast.success("Password berhasil diatur! Kamu bisa login dengan password juga sekarang.");
      setPasswordSet(true);
      setShowPasswordModal(false);
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const { error } = await supabase.from("invitations").delete().eq("id", deleteTarget);
    if (error) {
      toast.error("Gagal menghapus undangan");
    } else {
      toast.success("Undangan berhasil dihapus");
    }
    setDeleteTarget(null);
    router.refresh();
  };

  const handlePublish = async (id: string, currentStatus: string) => {
    setPublishing(id);
    const newStatus = currentStatus === "published" ? "draft" : "published";
    const { error } = await supabase.from("invitations").update({ status: newStatus }).eq("id", id);
    setPublishing(null);
    if (error) {
      toast.error("Gagal mengubah status");
    } else {
      toast.success(newStatus === "published" ? "Undangan dipublikasikan!" : "Undangan diarsipkan");
    }
    router.refresh();
  };

  const defaultInv = invitations[0];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-20 border-b bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <Heart className="h-5 w-5 sm:h-6 sm:w-6 text-[#D4A843]" fill="#D4A843" />
            <span className="font-[family-name:var(--font-playfair)] text-lg sm:text-xl italic text-gray-900 hidden sm:inline">
              Undangan Nikah
            </span>
            <span className="font-[family-name:var(--font-playfair)] text-lg italic text-gray-900 sm:hidden">
              UN
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <span className="hidden sm:block text-sm text-gray-500 truncate max-w-[150px]">{userEmail}</span>
            {profile?.plan === "premium" && (
              <span className="hidden sm:flex items-center gap-1 rounded-full bg-[#D4A843]/10 px-3 py-1 text-xs text-[#B8860B]">
                <Crown className="h-3 w-3" /> Premium
              </span>
            )}
            <button onClick={() => setShowPasswordModal(true)} className="flex items-center gap-1 text-sm text-gray-400 hover:text-[#D4A843]" title="Atur Password">
              <KeyRound className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Password</span>
            </button>
            <button onClick={handleLogout} className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600" title="Logout">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 sm:px-6 py-8 sm:py-12">
        {defaultInv && (
          <div className="mb-8 sm:mb-10 text-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 font-[family-name:var(--font-playfair)] italic">
              {defaultInv.groom_name} & {defaultInv.bride_name}
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-gray-400">
              {defaultInv.akad_date} · {defaultInv.akad_venue}
            </p>
          </div>
        )}

        <div className="grid gap-4 sm:gap-6 sm:grid-cols-2">
          <button
            onClick={() => router.push("/dashboard/send")}
            className="group relative overflow-hidden rounded-2xl border-2 border-green-200 bg-white p-6 sm:p-8 text-left shadow-sm transition-all hover:border-green-400 hover:shadow-xl"
          >
            <div className="absolute -right-8 -top-8 h-32 w-32 sm:h-40 sm:w-40 rounded-full bg-green-50 transition-all group-hover:scale-150" />
            <div className="relative">
              <div className="flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-green-50">
                <SendHorizonal className="h-6 w-6 sm:h-8 sm:w-8 text-green-500" />
              </div>
              <h2 className="mt-4 sm:mt-6 text-xl sm:text-2xl font-bold text-gray-900">Kirim Undangan</h2>
              <p className="mt-2 text-xs sm:text-sm leading-relaxed text-gray-500">
                Import daftar tamu, atur template pesan, dan kirim undangan massal via WhatsApp.
              </p>
              <div className="mt-3 sm:mt-4 flex items-center gap-3 sm:gap-4 text-xs text-gray-400">
                <span className="flex items-center gap-1"><Users className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> Kelola tamu</span>
                <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> Blast WA</span>
              </div>
              <div className="mt-4 sm:mt-6 inline-flex items-center gap-2 rounded-xl bg-green-500 px-5 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-medium text-white shadow-lg shadow-green-200 transition-colors hover:bg-green-600">
                <MessageCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Kirim Sekarang
              </div>
            </div>
          </button>

          <button
            onClick={() => router.push("/dashboard/create")}
            className="group relative overflow-hidden rounded-2xl border-2 border-gray-200 bg-white p-6 sm:p-8 text-left shadow-sm transition-all hover:border-[#D4A843]/40 hover:shadow-xl"
          >
            <div className="absolute -right-8 -top-8 h-32 w-32 sm:h-40 sm:w-40 rounded-full bg-[#D4A843]/5 transition-all group-hover:scale-150" />
            <div className="relative">
              <div className="flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-[#D4A843]/10">
                <Plus className="h-6 w-6 sm:h-8 sm:w-8 text-[#D4A843]" />
              </div>
              <h2 className="mt-4 sm:mt-6 text-xl sm:text-2xl font-bold text-gray-900">Buat Undangan Baru</h2>
              <p className="mt-2 text-xs sm:text-sm leading-relaxed text-gray-500">
                Buat undangan online untuk acara lain dengan tema berbeda.
              </p>
              <div className="mt-4 sm:mt-6 inline-flex items-center gap-2 rounded-xl border-2 border-[#D4A843]/30 px-5 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-medium text-[#B8860B] transition-colors hover:bg-[#D4A843]/5">
                <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Buat Baru
              </div>
            </div>
          </button>
        </div>

        {invitations.length > 0 && (
          <div className="mt-10 sm:mt-16">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Undangan Saya</h3>
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {invitations.map((inv) => (
                <div key={inv.id} className="group rounded-xl border bg-white p-5 sm:p-6 shadow-sm transition-all hover:shadow-md">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-[family-name:var(--font-playfair)] text-base sm:text-lg italic text-gray-900 truncate">
                        {inv.title || "Untitled"}
                      </h4>
                      <p className="mt-1 text-xs text-gray-400 truncate">/{inv.slug}</p>
                    </div>
                    <span className={`flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                      inv.status === "published" ? "bg-green-50 text-green-600" : inv.status === "archived" ? "bg-gray-100 text-gray-400" : "bg-yellow-50 text-yellow-600"
                    }`}>
                      {inv.status === "published" ? "Live" : inv.status === "archived" ? "Archived" : "Draft"}
                    </span>
                  </div>
                  <div className="mt-3 text-xs text-gray-400 truncate">
                    {inv.groom_name && inv.bride_name ? `${inv.groom_name} & ${inv.bride_name}` : "Belum diisi"}
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-1.5 border-t pt-3 sm:pt-4">
                    <button onClick={() => router.push(`/dashboard/edit/${inv.id}`)} className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs text-gray-500 hover:bg-gray-50 transition-colors">
                      <Edit className="h-3 w-3" /> Edit
                    </button>
                    <button onClick={() => router.push(`/dashboard/guests/${inv.id}`)} className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs text-[#B8860B] hover:bg-[#D4A843]/5 transition-colors">
                      <Users className="h-3 w-3" /> Tamu
                    </button>
                    <button onClick={() => router.push(`/dashboard/stats/${inv.id}`)} className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs text-gray-500 hover:bg-gray-50 transition-colors">
                      <BarChart3 className="h-3 w-3" /> Stats
                    </button>
                    {inv.status === "published" && (
                      <a href={`/u/${inv.slug}`} target="_blank" className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs text-[#B8860B] hover:bg-[#D4A843]/5 transition-colors">
                        <ExternalLink className="h-3 w-3" /> Lihat
                      </a>
                    )}
                    <div className="flex-1" />
                    <button
                      onClick={() => handlePublish(inv.id, inv.status)}
                      disabled={publishing === inv.id}
                      className={`rounded-lg px-2.5 py-1.5 text-xs transition-colors disabled:opacity-50 ${
                        inv.status === "published" ? "text-yellow-600 hover:bg-yellow-50" : "text-green-600 hover:bg-green-50"
                      }`}
                    >
                      {publishing === inv.id ? "..." : inv.status === "published" ? "Unpublish" : "Publish"}
                    </button>
                    <button onClick={() => setDeleteTarget(inv.id)} className="rounded-lg p-1.5 text-red-400 hover:bg-red-50 transition-colors">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Set Password Modal */}
      <AnimatePresence>
        {showPasswordModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="w-full max-w-md rounded-2xl border bg-white shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  {passwordSet ? "Atur Password" : "Buat Password"}
                </h2>
              </div>

              <div className="p-6 space-y-4">
                <div className={`rounded-xl ${passwordSet ? "bg-amber-50" : "bg-blue-50"} p-4`}>
                  {passwordSet ? (
                    <p className="text-xs text-amber-700 leading-relaxed">
                      Kamu bisa mengganti password kapan saja. <strong>Email + password</strong> atau
                      <strong> magic link</strong> — dua-duanya tetap bisa dipakai.
                    </p>
                  ) : (
                    <p className="text-xs text-blue-700 leading-relaxed">
                      <strong>Kamu login menggunakan Magic Link.</strong> Untuk bisa login pakai password di lain waktu,
                      silakan buat password sekarang. <span className="font-medium">(Wajib diisi sekali)</span>
                    </p>
                  )}
                </div>

                {passwordError && (
                  <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-xs text-red-600">
                    <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                    {passwordError}
                  </div>
                )}

                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type={showNewPass ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Password baru (min 6 karakter)"
                    autoFocus
                    className="w-full rounded-lg border border-gray-200 bg-white pl-10 pr-12 py-2.5 text-sm outline-none focus:border-[#D4A843] focus:ring-1 focus:ring-[#D4A843]/20"
                  />
                  <button type="button" onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showNewPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type={showConfirmPass ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Konfirmasi password"
                    className="w-full rounded-lg border border-gray-200 bg-white pl-10 pr-12 py-2.5 text-sm outline-none focus:border-[#D4A843] focus:ring-1 focus:ring-[#D4A843]/20"
                  />
                  <button type="button" onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showConfirmPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-6 py-4 bg-gray-50/50 rounded-b-2xl">
                {passwordSet && (
                  <button onClick={() => setShowPasswordModal(false)}
                    className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors">
                    Tutup
                  </button>
                )}
                <button onClick={handleSetPassword} disabled={savingPassword || !newPassword || !confirmPassword}
                  className="flex items-center gap-2 rounded-xl bg-[#D4A843] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#B8860B] shadow-sm shadow-amber-200 transition-colors disabled:opacity-50">
                  {savingPassword ? (
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : <Save className="h-4 w-4" />}
                  {savingPassword ? "Menyimpan..." : passwordSet ? "Simpan Password" : "Buat Password"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Hapus Undangan"
        message="Apakah kamu yakin ingin menghapus undangan ini? Semua data tamu & RSVP terkait akan ikut terhapus. Tindakan ini tidak bisa dibatalkan."
        confirmLabel="Ya, hapus"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
