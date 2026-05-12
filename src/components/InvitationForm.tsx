"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { nanoid } from "nanoid";
import { motion, AnimatePresence } from "framer-motion";
import { themePresets, type ThemePresetKey } from "@/config/wedding";
import type { Invitation, GiftItem } from "@/lib/types";
import {
  Heart,
  ArrowLeft,
  Save,
  Eye,
  User,
  Calendar,
  Palette,
  Gift,
  Image,
  Settings,
  Plus,
  Trash2,
  Check,
  AlertCircle,
} from "lucide-react";
import { useToast } from "@/components/Toast";

interface Props {
  userId: string;
  existingData?: Invitation;
}

type Tab = "couple" | "event" | "theme" | "gifts" | "gallery" | "settings";

const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "couple", label: "Mempelai", icon: <User className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> },
  { id: "event", label: "Acara", icon: <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> },
  { id: "theme", label: "Tema", icon: <Palette className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> },
  { id: "gifts", label: "Amplop", icon: <Gift className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> },
  { id: "gallery", label: "Gallery", icon: <Image className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> },
  { id: "settings", label: "Pengaturan", icon: <Settings className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> },
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 50);
}

export default function InvitationForm({ userId, existingData }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const toast = useToast();
  const isEdit = !!existingData;

  const [activeTab, setActiveTab] = useState<Tab>("couple");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: existingData?.title || "",
    slug: existingData?.slug || "",

    groom_name: existingData?.groom_name || "",
    groom_full_name: existingData?.groom_full_name || "",
    groom_father: existingData?.groom_father || "",
    groom_mother: existingData?.groom_mother || "",
    groom_child_order: existingData?.groom_child_order || "",
    groom_instagram: existingData?.groom_instagram || "",

    bride_name: existingData?.bride_name || "",
    bride_full_name: existingData?.bride_full_name || "",
    bride_father: existingData?.bride_father || "",
    bride_mother: existingData?.bride_mother || "",
    bride_child_order: existingData?.bride_child_order || "",
    bride_instagram: existingData?.bride_instagram || "",

    akad_date: existingData?.akad_date || "",
    akad_time: existingData?.akad_time || "",
    akad_end_time: existingData?.akad_end_time || "",
    akad_venue: existingData?.akad_venue || "",
    akad_address: existingData?.akad_address || "",
    akad_maps_url: existingData?.akad_maps_url || "",

    resepsi_date: existingData?.resepsi_date || "",
    resepsi_time: existingData?.resepsi_time || "",
    resepsi_end_time: existingData?.resepsi_end_time || "",
    resepsi_venue: existingData?.resepsi_venue || "",
    resepsi_address: existingData?.resepsi_address || "",
    resepsi_maps_url: existingData?.resepsi_maps_url || "",
    resepsi_dress_code: existingData?.resepsi_dress_code || "",

    theme_preset: (existingData?.theme_preset || "gold") as ThemePresetKey,
    hashtag: existingData?.hashtag || "",
    footer_text: existingData?.footer_text || "",
    music_url: existingData?.music_url || "",

    feature_music: existingData?.feature_music ?? true,
    feature_particles: existingData?.feature_particles ?? true,
    feature_three_d: existingData?.feature_three_d ?? true,
    feature_rsvp: existingData?.feature_rsvp ?? true,
    feature_gifts: existingData?.feature_gifts ?? true,
    feature_gallery: existingData?.feature_gallery ?? true,
    feature_countdown: existingData?.feature_countdown ?? true,
    feature_guest_book: existingData?.feature_guest_book ?? true,
  });

  const [gifts, setGifts] = useState<GiftItem[]>(existingData?.gifts || []);

  const autoSlug = () => {
    if (form.groom_name && form.bride_name) {
      const slug = slugify(`${form.groom_name}-${form.bride_name}-${nanoid(6)}`);
      setForm({ ...form, slug });
    }
  };

  const updateField = (field: string, value: string | boolean) => {
    setForm({ ...form, [field]: value });
    if ((field === "groom_name" || field === "bride_name") && !isEdit) {
      const groom = field === "groom_name" ? value : form.groom_name;
      const bride = field === "bride_name" ? value : form.bride_name;
      if (groom && bride) {
        setForm((prev) => ({
          ...prev,
          [field]: value,
          title: `${groom} & ${bride}`,
          footer_text: `With Love, ${groom} & ${bride}`,
          hashtag: `#${String(groom).replace(/\s/g, "")}${String(bride).replace(/\s/g, "")}`,
        }));
      }
    }
  };

  const addGift = (type: "bank" | "address") => {
    if (type === "bank") {
      setGifts([...gifts, { type: "bank", bankName: "", accountNumber: "", accountHolder: "" }]);
    } else {
      setGifts([...gifts, { type: "address", label: "Kirim Hadiah", address: "", phone: "" }]);
    }
  };

  const updateGift = (index: number, field: string, value: string) => {
    const updated = [...gifts];
    (updated[index] as unknown as Record<string, string>)[field] = value;
    setGifts(updated);
  };

  const removeGift = (index: number) => {
    setGifts(gifts.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setError(null);
    if (!form.title && !form.groom_name && !form.bride_name) {
      setError("Isi judul atau nama mempelai terlebih dahulu");
      toast.warning("Isi judul atau nama mempelai terlebih dahulu");
      return;
    }

    setSaving(true);
    const slug = form.slug || slugify(`${form.groom_name || "mempelai"}-${form.bride_name || "mempelai"}-${nanoid(6)}`);

    const payload = {
      ...form,
      slug,
      user_id: userId,
      gifts,
      updated_at: new Date().toISOString(),
    };

    try {
      if (isEdit && existingData) {
        const { error: updateError } = await supabase.from("invitations").update(payload).eq("id", existingData.id);
        if (updateError) throw new Error(updateError.message);
        toast.success("Undangan berhasil diperbarui!");
      } else {
        const { error: insertError } = await supabase.from("invitations").insert(payload);
        if (insertError) throw new Error(insertError.message);
        toast.success("Undangan baru berhasil dibuat!");
      }

      setSaving(false);
      if (!isEdit) {
        setTimeout(() => router.push("/dashboard"), 800);
      }
    } catch (e) {
      setSaving(false);
      const msg = e instanceof Error ? e.message : "Gagal menyimpan undangan";
      setError(msg);
      toast.error(msg);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-gray-200 bg-white px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm outline-none transition-all focus:border-[#D4A843] focus:ring-1 focus:ring-[#D4A843]/20";
  const labelClass = "mb-1 sm:mb-1.5 block text-xs font-medium text-gray-500 uppercase tracking-wider";

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-20 border-b bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 sm:px-6 py-2.5 sm:py-3">
          <button onClick={() => router.push("/dashboard")} className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-500 hover:text-gray-700">
            <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </button>
          <div className="flex items-center gap-2 sm:gap-3">
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="hidden sm:flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600"
                >
                  <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                  <span className="truncate max-w-[200px]">{error}</span>
                </motion.div>
              )}
            </AnimatePresence>
            {form.slug && (
              <a href={`/u/${form.slug}?preview=true`} target="_blank"
                className="hidden sm:flex items-center gap-1 text-xs sm:text-sm text-gray-400 hover:text-[#B8860B] transition-colors">
                <Eye className="h-4 w-4" /> Preview
              </a>
            )}
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-1 sm:gap-2 rounded-full bg-[#D4A843] px-4 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white hover:bg-[#B8860B] disabled:opacity-50 transition-all active:scale-[0.98]">
              {saving ? (
                <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : <Save className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
              {saving ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-4 sm:py-6">
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="sm:hidden mb-4 flex items-center gap-2 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-xs text-red-600"
          >
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {error}
          </motion.div>
        )}

        <div className="mb-4 sm:mb-6 grid gap-3 sm:gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Judul Undangan</label>
            <input className={inputClass} value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Wahyu & Aisyah" />
          </div>
          <div>
            <label className={labelClass}>
              URL Slug
              <button onClick={autoSlug} className="ml-2 text-[#B8860B] hover:underline normal-case tracking-normal text-xs">
                (generate)
              </button>
            </label>
            <div className="flex items-center gap-0">
              <span className="rounded-l-lg border border-r-0 border-gray-200 bg-gray-50 px-2 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm text-gray-400">
                /u/
              </span>
              <input className={`${inputClass} rounded-l-none`} value={form.slug}
                onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })}
                placeholder="wahyu-aisyah" />
            </div>
          </div>
        </div>

        <div className="mb-4 sm:mb-6 flex gap-1 overflow-x-auto rounded-lg border bg-white p-1">
          {tabs.map((tab) => (
            <button key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1 sm:gap-2 whitespace-nowrap rounded-md px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm transition-colors ${
                activeTab === tab.id ? "bg-[#D4A843] text-white shadow-sm" : "text-gray-500 hover:bg-gray-50"
              }`}>
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        <div className="rounded-xl border bg-white p-4 sm:p-6 shadow-sm">
          {activeTab === "couple" && (
            <div className="space-y-6 sm:space-y-8">
              <div>
                <h3 className="flex items-center gap-2 text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
                  <Heart className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" /> Mempelai Pria
                </h3>
                <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
                  <div><label className={labelClass}>Nama Panggilan</label><input className={inputClass} value={form.groom_name} onChange={(e) => updateField("groom_name", e.target.value)} placeholder="Wahyu" /></div>
                  <div><label className={labelClass}>Nama Lengkap</label><input className={inputClass} value={form.groom_full_name} onChange={(e) => updateField("groom_full_name", e.target.value)} placeholder="Ahmad Wahyu Pratama" /></div>
                  <div><label className={labelClass}>Nama Ayah</label><input className={inputClass} value={form.groom_father} onChange={(e) => updateField("groom_father", e.target.value)} placeholder="Bapak Surya Pratama" /></div>
                  <div><label className={labelClass}>Nama Ibu</label><input className={inputClass} value={form.groom_mother} onChange={(e) => updateField("groom_mother", e.target.value)} placeholder="Ibu Dewi Lestari" /></div>
                  <div><label className={labelClass}>Anak Ke-</label><input className={inputClass} value={form.groom_child_order} onChange={(e) => updateField("groom_child_order", e.target.value)} placeholder="Putra pertama" /></div>
                  <div><label className={labelClass}>Instagram</label><input className={inputClass} value={form.groom_instagram} onChange={(e) => updateField("groom_instagram", e.target.value)} placeholder="@wahyupratama" /></div>
                </div>
              </div>
              <hr className="border-gray-100" />
              <div>
                <h3 className="flex items-center gap-2 text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
                  <Heart className="h-4 w-4 sm:h-5 sm:w-5 text-pink-500" /> Mempelai Wanita
                </h3>
                <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
                  <div><label className={labelClass}>Nama Panggilan</label><input className={inputClass} value={form.bride_name} onChange={(e) => updateField("bride_name", e.target.value)} placeholder="Aisyah" /></div>
                  <div><label className={labelClass}>Nama Lengkap</label><input className={inputClass} value={form.bride_full_name} onChange={(e) => updateField("bride_full_name", e.target.value)} placeholder="Siti Aisyah Putri" /></div>
                  <div><label className={labelClass}>Nama Ayah</label><input className={inputClass} value={form.bride_father} onChange={(e) => updateField("bride_father", e.target.value)} placeholder="Bapak Muhammad Hasan" /></div>
                  <div><label className={labelClass}>Nama Ibu</label><input className={inputClass} value={form.bride_mother} onChange={(e) => updateField("bride_mother", e.target.value)} placeholder="Ibu Fatimah Zahra" /></div>
                  <div><label className={labelClass}>Anak Ke-</label><input className={inputClass} value={form.bride_child_order} onChange={(e) => updateField("bride_child_order", e.target.value)} placeholder="Putri kedua" /></div>
                  <div><label className={labelClass}>Instagram</label><input className={inputClass} value={form.bride_instagram} onChange={(e) => updateField("bride_instagram", e.target.value)} placeholder="@aisyahputri" /></div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "event" && (
            <div className="space-y-6 sm:space-y-8">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Akad Nikah</h3>
                <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
                  <div><label className={labelClass}>Tanggal</label><input type="date" className={inputClass} value={form.akad_date} onChange={(e) => updateField("akad_date", e.target.value)} /></div>
                  <div className="grid grid-cols-2 gap-2">
                    <div><label className={labelClass}>Mulai</label><input type="time" className={inputClass} value={form.akad_time} onChange={(e) => updateField("akad_time", e.target.value)} /></div>
                    <div><label className={labelClass}>Selesai</label><input type="time" className={inputClass} value={form.akad_end_time} onChange={(e) => updateField("akad_end_time", e.target.value)} /></div>
                  </div>
                  <div><label className={labelClass}>Tempat</label><input className={inputClass} value={form.akad_venue} onChange={(e) => updateField("akad_venue", e.target.value)} placeholder="Masjid Agung Al-Azhar" /></div>
                  <div><label className={labelClass}>Link Google Maps</label><input className={inputClass} value={form.akad_maps_url} onChange={(e) => updateField("akad_maps_url", e.target.value)} placeholder="https://goo.gl/maps/..." /></div>
                  <div className="sm:col-span-2"><label className={labelClass}>Alamat Lengkap</label><input className={inputClass} value={form.akad_address} onChange={(e) => updateField("akad_address", e.target.value)} placeholder="Jl. Sisingamangaraja..." /></div>
                </div>
              </div>
              <hr className="border-gray-100" />
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Resepsi</h3>
                <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
                  <div><label className={labelClass}>Tanggal</label><input type="date" className={inputClass} value={form.resepsi_date} onChange={(e) => updateField("resepsi_date", e.target.value)} /></div>
                  <div className="grid grid-cols-2 gap-2">
                    <div><label className={labelClass}>Mulai</label><input type="time" className={inputClass} value={form.resepsi_time} onChange={(e) => updateField("resepsi_time", e.target.value)} /></div>
                    <div><label className={labelClass}>Selesai</label><input type="time" className={inputClass} value={form.resepsi_end_time} onChange={(e) => updateField("resepsi_end_time", e.target.value)} /></div>
                  </div>
                  <div><label className={labelClass}>Tempat</label><input className={inputClass} value={form.resepsi_venue} onChange={(e) => updateField("resepsi_venue", e.target.value)} placeholder="Balai Kartini" /></div>
                  <div><label className={labelClass}>Link Google Maps</label><input className={inputClass} value={form.resepsi_maps_url} onChange={(e) => updateField("resepsi_maps_url", e.target.value)} placeholder="https://goo.gl/maps/..." /></div>
                  <div><label className={labelClass}>Alamat Lengkap</label><input className={inputClass} value={form.resepsi_address} onChange={(e) => updateField("resepsi_address", e.target.value)} placeholder="Jl. Gatot Subroto..." /></div>
                  <div><label className={labelClass}>Dress Code</label><input className={inputClass} value={form.resepsi_dress_code} onChange={(e) => updateField("resepsi_dress_code", e.target.value)} placeholder="Formal — Sage Green & Gold" /></div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "theme" && (
            <div className="space-y-4 sm:space-y-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Pilih Tema</h3>
              <div className="grid grid-cols-2 gap-2 sm:gap-3 sm:grid-cols-4">
                {(Object.keys(themePresets) as ThemePresetKey[]).map((key) => {
                  const t = themePresets[key];
                  const isActive = form.theme_preset === key;
                  return (
                    <button key={key} onClick={() => setForm({ ...form, theme_preset: key })}
                      className={`relative rounded-xl border-2 p-3 sm:p-4 text-left transition-all ${
                        isActive ? "border-[#D4A843] shadow-md" : "border-gray-100 hover:border-gray-200"
                      }`}>
                      {isActive && (
                        <div className="absolute -top-2 -right-2 rounded-full bg-[#D4A843] p-1">
                          <Check className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-white" />
                        </div>
                      )}
                      <div className="flex gap-1 mb-1 sm:mb-2">
                        <div className="h-4 w-4 sm:h-6 sm:w-6 rounded-full" style={{ backgroundColor: t.primary }} />
                        <div className="h-4 w-4 sm:h-6 sm:w-6 rounded-full" style={{ backgroundColor: t.secondary }} />
                        <div className="h-4 w-4 sm:h-6 sm:w-6 rounded-full" style={{ backgroundColor: t.background }} />
                      </div>
                      <p className="text-xs sm:text-sm font-medium text-gray-700 truncate">{t.name}</p>
                    </button>
                  );
                })}
              </div>
              <hr className="border-gray-100" />
              <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
                <div><label className={labelClass}>Hashtag</label><input className={inputClass} value={form.hashtag} onChange={(e) => updateField("hashtag", e.target.value)} placeholder="#WahyuAisyah2026" /></div>
                <div><label className={labelClass}>Footer Text</label><input className={inputClass} value={form.footer_text} onChange={(e) => updateField("footer_text", e.target.value)} placeholder="With Love, Wahyu & Aisyah" /></div>
                <div className="sm:col-span-2"><label className={labelClass}>URL Musik (MP3)</label><input className={inputClass} value={form.music_url} onChange={(e) => updateField("music_url", e.target.value)} placeholder="https://example.com/music.mp3" /></div>
              </div>
            </div>
          )}

          {activeTab === "gifts" && (
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">Amplop Digital</h3>
                <div className="flex gap-1 sm:gap-2">
                  <button onClick={() => addGift("bank")} className="flex items-center gap-1 rounded-lg border px-2 sm:px-3 py-1 sm:py-1.5 text-xs hover:bg-gray-50 transition-colors">
                    <Plus className="h-3 w-3" /> Rekening
                  </button>
                  <button onClick={() => addGift("address")} className="flex items-center gap-1 rounded-lg border px-2 sm:px-3 py-1 sm:py-1.5 text-xs hover:bg-gray-50 transition-colors">
                    <Plus className="h-3 w-3" /> Alamat
                  </button>
                </div>
              </div>
              {gifts.length === 0 && (
                <p className="text-center text-xs sm:text-sm text-gray-400 py-6 sm:py-8">
                  Belum ada amplop digital. Tambahkan rekening bank atau alamat kirim hadiah.
                </p>
              )}
              {gifts.map((gift, i) => (
                <div key={i} className="rounded-lg border p-3 sm:p-4 space-y-2 sm:space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-medium text-gray-600">
                      {gift.type === "bank" ? "💳 Rekening Bank" : "🎁 Alamat Hadiah"}
                    </span>
                    <button onClick={() => removeGift(i)} className="text-red-400 hover:text-red-600 transition-colors">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  {gift.type === "bank" ? (
                    <div className="grid gap-2 sm:gap-3 sm:grid-cols-3">
                      <div><label className={labelClass}>Nama Bank</label><input className={inputClass} value={gift.bankName || ""} onChange={(e) => updateGift(i, "bankName", e.target.value)} placeholder="BCA" /></div>
                      <div><label className={labelClass}>No. Rekening</label><input className={inputClass} value={gift.accountNumber || ""} onChange={(e) => updateGift(i, "accountNumber", e.target.value)} placeholder="1234567890" /></div>
                      <div><label className={labelClass}>Atas Nama</label><input className={inputClass} value={gift.accountHolder || ""} onChange={(e) => updateGift(i, "accountHolder", e.target.value)} placeholder="Ahmad Wahyu" /></div>
                    </div>
                  ) : (
                    <div className="grid gap-2 sm:gap-3 sm:grid-cols-2">
                      <div><label className={labelClass}>Alamat</label><input className={inputClass} value={gift.address || ""} onChange={(e) => updateGift(i, "address", e.target.value)} placeholder="Jl. Mawar No. 10..." /></div>
                      <div><label className={labelClass}>No. HP</label><input className={inputClass} value={gift.phone || ""} onChange={(e) => updateGift(i, "phone", e.target.value)} placeholder="0812-3456-7890" /></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === "gallery" && (
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Foto Gallery</h3>
              <p className="text-xs sm:text-sm text-gray-400">
                Upload foto prewedding ke Supabase Storage, lalu masukkan URL-nya di sini.
              </p>
              <div className="rounded-xl border-2 border-dashed border-gray-200 py-10 sm:py-16 text-center">
                <Image className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-gray-300" />
                <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-gray-400">
                  Coming soon — drag & drop photo upload
                </p>
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="space-y-4 sm:space-y-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Toggle Fitur</h3>
              <div className="grid gap-2 sm:gap-3 sm:grid-cols-2">
                {[
                  { key: "feature_music", label: "🎵 Background Music" },
                  { key: "feature_particles", label: "✨ Partikel Melayang" },
                  { key: "feature_three_d", label: "🌟 Efek 3D" },
                  { key: "feature_rsvp", label: "📝 Form RSVP" },
                  { key: "feature_gifts", label: "💳 Amplop Digital" },
                  { key: "feature_gallery", label: "🖼️ Foto Gallery" },
                  { key: "feature_countdown", label: "⏰ Countdown Timer" },
                  { key: "feature_guest_book", label: "💬 Buku Tamu" },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center justify-between rounded-lg border p-2.5 sm:p-3 cursor-pointer hover:bg-gray-50 transition-colors">
                    <span className="text-xs sm:text-sm">{label}</span>
                    <input type="checkbox"
                      checked={form[key as keyof typeof form] as boolean}
                      onChange={(e) => updateField(key, e.target.checked)}
                      className="h-4 w-4 rounded accent-[#D4A843]" />
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
