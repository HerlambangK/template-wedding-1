"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Save, X, AlertTriangle, User, Phone, Mail, MapPin, Tag, FileText } from "lucide-react";

interface GuestFormData {
  name: string;
  phone: string;
  email: string;
  address: string;
  category: string;
  notes: string;
}

interface Props {
  open: boolean;
  guest?: { name: string | null; phone?: string | null; email?: string | null; address?: string | null; category?: string | null; notes?: string | null } | null;
  onSave: (data: GuestFormData) => Promise<void>;
  onClose: () => void;
}

export default function GuestFormModal({ open, guest, onSave, onClose }: Props) {
  const [data, setData] = useState<GuestFormData>({
    name: "", phone: "", email: "", address: "", category: "", notes: "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (guest) {
      setData({
        name: guest.name || "",
        phone: guest.phone || "",
        email: guest.email || "",
        address: guest.address || "",
        category: guest.category || "",
        notes: guest.notes || "",
      });
    } else {
      setData({ name: "", phone: "", email: "", address: "", category: "", notes: "" });
    }
    setError("");
  }, [guest, open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const handleSave = async () => {
    if (!data.name.trim()) {
      setError("Nama tamu harus diisi");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await onSave(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menyimpan");
    }
    setSaving(false);
  };

  const inputClass =
    "w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-[#D4A843] focus:ring-1 focus:ring-[#D4A843]/20";
  const labelClass = "mb-1.5 flex items-center gap-1.5 text-xs font-medium text-gray-500 uppercase tracking-wider";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-2xl border bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {guest ? "Edit Tamu" : "Tambah Tamu"}
              </h2>
              <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-xs text-red-600"
                >
                  <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                  {error}
                </motion.div>
              )}

              <div>
                <label className={labelClass}><User className="h-3.5 w-3.5" /> Nama <span className="text-red-400">*</span></label>
                <input
                  value={data.name}
                  onChange={(e) => setData({ ...data, name: e.target.value })}
                  placeholder="Nama lengkap tamu"
                  className={inputClass}
                  autoFocus
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}><Phone className="h-3.5 w-3.5" /> No. HP</label>
                  <input
                    value={data.phone}
                    onChange={(e) => setData({ ...data, phone: e.target.value })}
                    placeholder="0812-3456-7890"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}><Mail className="h-3.5 w-3.5" /> Email</label>
                  <input
                    type="email"
                    value={data.email}
                    onChange={(e) => setData({ ...data, email: e.target.value })}
                    placeholder="email@example.com"
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}><Tag className="h-3.5 w-3.5" /> Kategori</label>
                <input
                  value={data.category}
                  onChange={(e) => setData({ ...data, category: e.target.value })}
                  placeholder="Keluarga, Teman, Kantor..."
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}><MapPin className="h-3.5 w-3.5" /> Alamat</label>
                <input
                  value={data.address}
                  onChange={(e) => setData({ ...data, address: e.target.value })}
                  placeholder="Alamat lengkap"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}><FileText className="h-3.5 w-3.5" /> Catatan</label>
                <textarea
                  value={data.notes}
                  onChange={(e) => setData({ ...data, notes: e.target.value })}
                  placeholder="Catatan tambahan"
                  rows={2}
                  className={`${inputClass} resize-none`}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-6 py-4 bg-gray-50/50 rounded-b-2xl">
              <button
                onClick={onClose}
                disabled={saving}
                className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !data.name.trim()}
                className="flex items-center gap-2 rounded-xl bg-[#D4A843] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#B8860B] shadow-sm shadow-amber-200 transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {saving ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
