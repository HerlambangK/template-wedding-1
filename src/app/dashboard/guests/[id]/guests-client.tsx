"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Guest, Invitation } from "@/lib/types";
import {
  ArrowLeft,
  Users,
  Plus,
  Upload,
  Download,
  Trash2,
  Edit2,
  X,
  Search,
  Filter,
  ExternalLink,
  Smartphone,
  Send,
} from "lucide-react";
import { useToast } from "@/components/Toast";
import ConfirmDialog from "@/components/ConfirmDialog";
import GuestFormModal from "@/components/GuestFormModal";

interface Props {
  invitation: Invitation;
  guests: Guest[];
}

type StatusFilter = "all" | "pending" | "invited" | "confirmed" | "declined";

function getWaUrl(phone: string, message: string): string {
  const cleaned = phone.replace(/[^0-9]/g, "");
  const prefix = cleaned.startsWith("0") ? "62" + cleaned.slice(1) : cleaned.startsWith("62") ? cleaned : "62" + cleaned;
  return `https://wa.me/${prefix}?text=${encodeURIComponent(message)}`;
}

export default function GuestsClient({ invitation, guests: initialGuests }: Props) {
  const router = useRouter();
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const [guests, setGuests] = useState<Guest[]>(initialGuests);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ success: boolean; message: string } | null>(null);
  const [selectedGuests, setSelectedGuests] = useState<Set<string>>(new Set());
  const [confirmDelete, setConfirmDelete] = useState<Guest | null>(null);
  const [confirmBulkWa, setConfirmBulkWa] = useState(false);

  const getWaMessage = (guestName: string, invitationLink: string) => {
    return [
      `Assalamu'alaikum Warahmatullahi Wabarakatuh,`,
      ``,
      `Kepada Yth. ${guestName}`,
      ``,
      `Tanpa mengurangi rasa hormat, kami mengundang Bapak/Ibu/Saudara/i untuk menghadiri acara pernikahan kami:`,
      ``,
      `🕊️ *${invitation.groom_name || "..."}* & *${invitation.bride_name || "..."}*`,
      ``,
      `📅 : ${invitation.akad_date || invitation.resepsi_date || "..."}`,
      `📍 : ${invitation.akad_venue || invitation.resepsi_venue || "..."}`,
      ``,
      `Link undangan lengkap:`,
      `${invitationLink}`,
      ``,
      `Merupakan suatu kehormatan dan kebahagiaan apabila Bapak/Ibu/Saudara/i berkenan hadir untuk memberikan doa restu.`,
      ``,
      `Terima kasih atas perhatiannya.`,
      `Wassalamu'alaikum Warahmatullahi Wabarakatuh.`,
    ].join("\n");
  };

  const categories = ["all", ...Array.from(new Set(guests.map((g) => g.category).filter((c): c is string => !!c)))];

  const filteredGuests = guests.filter((g) => {
    const matchSearch = search === "" ||
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      (g.phone && g.phone.includes(search)) ||
      (g.email && g.email.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = statusFilter === "all" || g.status === statusFilter;
    const matchCategory = categoryFilter === "all" || g.category === categoryFilter;
    return matchSearch && matchStatus && matchCategory;
  });

  const stats = {
    total: guests.length,
    pending: guests.filter((g) => g.status === "pending").length,
    invited: guests.filter((g) => g.status === "invited").length,
    confirmed: guests.filter((g) => g.status === "confirmed").length,
    declined: guests.filter((g) => g.status === "declined").length,
  };

  const handleSaveGuest = async (data: { name: string; phone: string; email: string; address: string; category: string; notes: string }) => {
    if (editingGuest) {
      const res = await fetch(`/api/guests/${editingGuest.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (res.ok) {
        setGuests(guests.map((g) => g.id === editingGuest.id ? result.data : g));
        toast.success("Tamu berhasil diperbarui");
        setShowGuestModal(false);
        setEditingGuest(null);
      } else {
        throw new Error(result.error || "Gagal menyimpan");
      }
    } else {
      const res = await fetch("/api/guests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invitation_id: invitation.id, ...data }),
      });
      const result = await res.json();
      if (res.ok) {
        setGuests([result.data, ...guests]);
        toast.success("Tamu berhasil ditambahkan");
        setShowGuestModal(false);
      } else {
        throw new Error(result.error || "Gagal menyimpan");
      }
    }
  };

  const handleDeleteGuest = async () => {
    if (!confirmDelete) return;
    const res = await fetch(`/api/guests/${confirmDelete.id}`, { method: "DELETE" });
    if (res.ok) {
      setGuests(guests.filter((g) => g.id !== confirmDelete.id));
      setSelectedGuests((prev) => { const next = new Set(prev); next.delete(confirmDelete.id); return next; });
      toast.success("Tamu berhasil dihapus");
    } else {
      toast.error("Gagal menghapus tamu");
    }
    setConfirmDelete(null);
  };

  const handleUpdateStatus = async (id: string, status: Guest["status"]) => {
    const res = await fetch(`/api/guests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setGuests(guests.map((g) => g.id === id ? { ...g, status } : g));
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setImportResult(null);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("invitation_id", invitation.id);
    const res = await fetch("/api/guests/import", { method: "POST", body: formData });
    const data = await res.json();
    setImporting(false);
    if (res.ok) {
      setImportResult({ success: true, message: `Berhasil import ${data.imported} tamu${data.errors ? ` (${data.errors.length} error)` : ""}` });
      toast.success(`Berhasil import ${data.imported} tamu`);
      router.refresh();
    } else {
      setImportResult({ success: false, message: data.error || "Gagal import" });
      toast.error(data.error || "Gagal import");
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleExport = (format: "xlsx" | "csv") => {
    window.open(`/api/guests/export?invitation_id=${invitation.id}&format=${format}`, "_blank");
    toast.success(`File berhasil di-download`);
  };

  const origin = mounted ? window.location.origin : "";

  const getPersonalizedLink = (guest: Guest) => {
    return `${origin}/u/${invitation.slug}?to=${encodeURIComponent(guest.name)}`;
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast.success("Link undangan disalin!");
  };

  const toggleSelectAll = () => {
    if (selectedGuests.size === filteredGuests.length) {
      setSelectedGuests(new Set());
    } else {
      setSelectedGuests(new Set(filteredGuests.map((g) => g.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedGuests);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedGuests(next);
  };

  const handleSendWa = (guest: Guest) => {
    const link = `${origin}/u/${invitation.slug}?to=${encodeURIComponent(guest.name)}`;
    const message = getWaMessage(guest.name, link);
    const url = getWaUrl(guest.phone || "", message);
    window.open(url, "_blank");
    handleUpdateStatus(guest.id, "invited");
  };

  const handleBulkSendWa = async () => {
    const selected = guests.filter((g) => selectedGuests.has(g.id) && g.phone);
    if (selected.length === 0) {
      toast.warning("Tidak ada tamu dengan nomor HP yang dipilih");
      setConfirmBulkWa(false);
      return;
    }
    toast.info(`Membuka ${selected.length} chat WhatsApp...`);
    selected.forEach((guest, i) => {
      setTimeout(() => {
        handleSendWa(guest);
      }, i * 2000);
    });
    setConfirmBulkWa(false);
  };

  const handleExportWa = () => {
    const selected = guests.filter((g) => selectedGuests.has(g.id) && g.phone);
    if (selected.length === 0) {
      toast.warning("Pilih tamu yang memiliki nomor HP terlebih dahulu");
      return;
    }
    const link = `${origin || window.location.origin}/u/${invitation.slug}`;
    const rows = selected.map((g) => {
      const personalLink = `${link}?to=${encodeURIComponent(g.name)}`;
      const waUrl = getWaUrl(g.phone || "", getWaMessage(g.name, personalLink));
      return `${g.name}\t${g.phone}\t${waUrl}`;
    });
    const csv = "Nama\tNo. HP\tLink WhatsApp\n" + rows.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `undangan-wa-${invitation.slug}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("File CSV berhasil di-download");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-20 border-b bg-white/80 backdrop-blur-md shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center gap-2 sm:gap-4">
            <button onClick={() => router.push("/dashboard")} className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-500 hover:text-gray-700">
              <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </button>
            <div className="h-5 w-px sm:h-6 bg-gray-200" />
            <div className="min-w-0">
              <h1 className="text-xs sm:text-lg font-semibold text-gray-900 truncate max-w-[180px] sm:max-w-none">
                <Users className="inline h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-1.5 text-[#D4A843]" />
                <span className="hidden sm:inline">Daftar Tamu — </span>{invitation.title}
              </h1>
              <p className="text-xs text-gray-400 hidden sm:block">/{invitation.slug}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            {invitation.status === "published" && (
              <a href={`/u/${invitation.slug}`} target="_blank"
                className="hidden sm:flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs text-[#B8860B] hover:bg-[#D4A843]/5 transition-colors">
                <ExternalLink className="h-3.5 w-3.5" /> Lihat
              </a>
            )}
            <button onClick={() => { setEditingGuest(null); setShowGuestModal(true); }}
              className="flex items-center gap-1 rounded-full bg-[#D4A843] px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-medium text-white hover:bg-[#B8860B] transition-colors">
              <Plus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Tambah Tamu</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-4 sm:py-6">
        <div className="grid gap-2 sm:gap-3 grid-cols-3 sm:grid-cols-3 lg:grid-cols-5 mb-4 sm:mb-6">
          {[
            { label: "Total", value: stats.total, icon: Users, color: "text-gray-600" },
            { label: "Pending", value: stats.pending, icon: Filter, color: "text-gray-500" },
            { label: "Diundang", value: stats.invited, icon: ExternalLink, color: "text-blue-500" },
            { label: "Hadir", value: stats.confirmed, icon: Users, color: "text-green-600" },
            { label: "Tidak", value: stats.declined, icon: X, color: "text-red-500" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border bg-white p-3 sm:p-4">
              <div className={`flex items-center gap-1 sm:gap-2 text-xs ${stat.color}`}>
                <stat.icon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                <span className="hidden sm:inline">{stat.label}</span>
              </div>
              <p className="mt-1 text-xl sm:text-2xl font-semibold text-gray-900">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="rounded-xl border bg-white p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleImport} className="hidden" />
              <button onClick={() => fileInputRef.current?.click()} disabled={importing}
                className="flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-3 sm:px-4 py-2 text-xs font-medium text-blue-600 hover:bg-blue-100 disabled:opacity-50 transition-colors">
                <Upload className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{importing ? "Mengimport..." : "Import"}</span>
              </button>
              <button onClick={() => handleExport("xlsx")} disabled={guests.length === 0}
                className="flex items-center gap-1 rounded-lg border border-green-200 bg-green-50 px-3 sm:px-4 py-2 text-xs font-medium text-green-600 hover:bg-green-100 disabled:opacity-40 transition-colors">
                <Download className="h-3.5 w-3.5" /> Excel
              </button>
              <button onClick={() => handleExport("csv")} disabled={guests.length === 0}
                className="flex items-center gap-1 rounded-lg border px-3 sm:px-4 py-2 text-xs font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-colors">
                <Download className="h-3.5 w-3.5" /> CSV
              </button>
              {selectedGuests.size > 0 && (
                <>
                  <button onClick={() => setConfirmBulkWa(true)}
                    className="flex items-center gap-1 rounded-lg border border-green-200 bg-green-50 px-3 sm:px-4 py-2 text-xs font-medium text-green-600 hover:bg-green-100 transition-colors">
                    <Send className="h-3.5 w-3.5" /> WA ({selectedGuests.size})
                  </button>
                  <button onClick={handleExportWa}
                    className="flex items-center gap-1 rounded-lg border border-purple-200 bg-purple-50 px-3 sm:px-4 py-2 text-xs font-medium text-purple-600 hover:bg-purple-100 transition-colors">
                    <Download className="h-3.5 w-3.5" /> WA CSV
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="mt-3 rounded-lg bg-blue-50 p-2.5 sm:p-3 text-xs text-blue-700">
            <p className="font-medium hidden sm:block">💡 Format Excel: <code className="bg-blue-100 px-1 rounded">Nama</code> (wajib),
              <code className="bg-blue-100 px-1 rounded ml-1">No. HP</code>,
              <code className="bg-blue-100 px-1 rounded ml-1">Email</code>,
              <code className="bg-blue-100 px-1 rounded ml-1">Alamat</code>,
              <code className="bg-blue-100 px-1 rounded ml-1">Kategori</code>,
              <code className="bg-blue-100 px-1 rounded ml-1">Catatan</code>
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="text" placeholder="Cari nama, no HP, atau email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white pl-10 pr-4 py-2.5 text-sm outline-none focus:border-[#D4A843] focus:ring-1 focus:ring-[#D4A843]/20"
            />
          </div>
          <div className="flex gap-2">
            <select value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="flex-1 sm:flex-none rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none">
              <option value="all">Semua Status</option>
              <option value="pending">Pending</option>
              <option value="invited">Diundang</option>
              <option value="confirmed">Hadir</option>
              <option value="declined">Tidak</option>
            </select>
            {categories.length > 1 && (
              <select value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="flex-1 sm:flex-none rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none">
                <option value="all">Semua Kategori</option>
                {categories.filter((c) => c !== "all").map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        {filteredGuests.length === 0 ? (
          <div className="rounded-xl border bg-white py-12 sm:py-16 text-center">
            <Users className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-300" />
            <h3 className="mt-3 sm:mt-4 text-base sm:text-lg font-medium text-gray-600">Belum ada daftar tamu</h3>
            <p className="mt-1 text-xs sm:text-sm text-gray-400">Tambahkan tamu satu per satu atau import dari file Excel</p>
            <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row justify-center gap-2 sm:gap-3">
              <button onClick={() => { setEditingGuest(null); setShowGuestModal(true); }}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#D4A843] px-5 sm:px-6 py-2 text-xs sm:text-sm font-medium text-white hover:bg-[#B8860B] transition-colors">
                <Plus className="h-4 w-4" /> Tambah Tamu
              </button>
              <button onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-gray-300 px-5 sm:px-6 py-2 text-xs sm:text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                <Upload className="h-4 w-4" /> Import Excel
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-2 sm:px-4 py-2.5 sm:py-3 text-left w-8 sm:w-10">
                      <input type="checkbox"
                        checked={selectedGuests.size === filteredGuests.length && filteredGuests.length > 0}
                        onChange={toggleSelectAll}
                        className="rounded border-gray-300 text-[#D4A843] focus:ring-[#D4A843]" />
                    </th>
                    <th className="px-2 sm:px-4 py-2.5 sm:py-3 text-left">Nama</th>
                    <th className="px-2 sm:px-4 py-2.5 sm:py-3 text-left hidden sm:table-cell">No. HP</th>
                    <th className="px-2 sm:px-4 py-2.5 sm:py-3 text-left hidden lg:table-cell">Kategori</th>
                    <th className="px-2 sm:px-4 py-2.5 sm:py-3 text-left">Status</th>
                    <th className="px-2 sm:px-4 py-2.5 sm:py-3 text-center hidden md:table-cell">Link</th>
                    <th className="px-2 sm:px-4 py-2.5 sm:py-3 text-center">WA</th>
                    <th className="px-2 sm:px-4 py-2.5 sm:py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredGuests.map((guest) => (
                    <tr key={guest.id} className={`hover:bg-gray-50 transition-colors ${selectedGuests.has(guest.id) ? "bg-[#D4A843]/5" : ""}`}>
                      <td className="px-2 sm:px-4 py-2 sm:py-3">
                        <input type="checkbox"
                          checked={selectedGuests.has(guest.id)}
                          onChange={() => toggleSelect(guest.id)}
                          className="rounded border-gray-300 text-[#D4A843] focus:ring-[#D4A843]" />
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3">
                        <div className="font-medium text-gray-700 truncate max-w-[120px] sm:max-w-none">{guest.name}</div>
                        {guest.email && <div className="text-xs text-gray-400 truncate max-w-[120px] sm:max-w-none">{guest.email}</div>}
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-gray-600 text-xs hidden sm:table-cell">{guest.phone || "-"}</td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 hidden lg:table-cell">
                        {guest.category ? (
                          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{guest.category}</span>
                        ) : "-"}
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3">
                        <select value={guest.status}
                          onChange={(e) => handleUpdateStatus(guest.id, e.target.value as Guest["status"])}
                          className="text-xs rounded border border-gray-200 bg-transparent px-1.5 sm:px-2 py-1 outline-none focus:border-[#D4A843]">
                          <option value="pending">Pending</option>
                          <option value="invited">Diundang</option>
                          <option value="confirmed">Hadir</option>
                          <option value="declined">Tidak</option>
                        </select>
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-center hidden md:table-cell">
                        <button onClick={() => copyToClipboard(getPersonalizedLink(guest))}
                          className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs text-[#B8860B] hover:bg-[#D4A843]/10 transition-colors">
                          <ExternalLink className="h-3 w-3" /> Salin
                        </button>
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-center">
                        {guest.phone ? (
                          <button onClick={() => handleSendWa(guest)}
                            className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs text-green-600 hover:bg-green-50 transition-colors">
                            <Smartphone className="h-3.5 w-3.5" /> WA
                          </button>
                        ) : (
                          <span className="text-xs text-gray-300">-</span>
                        )}
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-right">
                        <div className="flex items-center justify-end gap-0.5 sm:gap-1">
                          <button onClick={() => { setEditingGuest(guest); setShowGuestModal(true); }}
                            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors" title="Edit">
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => setConfirmDelete(guest)}
                            className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors" title="Hapus">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="border-t bg-gray-50 px-3 sm:px-4 py-2.5 sm:py-3 text-xs text-gray-400">
              {filteredGuests.length} dari {guests.length} tamu
            </div>
          </div>
        )}
      </main>

      <GuestFormModal
        open={showGuestModal}
        guest={editingGuest}
        onSave={handleSaveGuest}
        onClose={() => { setShowGuestModal(false); setEditingGuest(null); }}
      />

      <ConfirmDialog
        open={!!confirmDelete}
        title="Hapus Tamu"
        message={`Yakin ingin menghapus "${confirmDelete?.name}" dari daftar tamu?`}
        confirmLabel="Ya, hapus"
        variant="danger"
        onConfirm={handleDeleteGuest}
        onCancel={() => setConfirmDelete(null)}
      />

      <ConfirmDialog
        open={confirmBulkWa}
        title="Kirim WhatsApp"
        message={`Kirim undangan via WhatsApp ke ${guests.filter((g) => selectedGuests.has(g.id) && g.phone).length} tamu terpilih? WhatsApp akan terbuka di tab baru untuk setiap tamu.`}
        confirmLabel={`Ya, kirim ke ${guests.filter((g) => selectedGuests.has(g.id) && g.phone).length} tamu`}
        variant="primary"
        onConfirm={handleBulkSendWa}
        onCancel={() => setConfirmBulkWa(false)}
      />
    </div>
  );
}
