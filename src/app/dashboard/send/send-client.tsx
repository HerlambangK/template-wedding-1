"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Guest, Invitation } from "@/lib/types";
import {
  ArrowLeft,
  MessageCircle,
  Send,
  Users,
  Upload,
  Download,
  Edit3,
  Copy,
  Check,
  Trash2,
  Search,
  ExternalLink,
  Smartphone,
  Plus,
} from "lucide-react";
import { useToast } from "@/components/Toast";
import ConfirmDialog from "@/components/ConfirmDialog";
import GuestFormModal from "@/components/GuestFormModal";

interface Props {
  invitations: Invitation[];
  allGuests: Guest[];
  defaultInvitationId?: string;
}

function getWaUrl(phone: string, message: string): string {
  const cleaned = phone.replace(/[^0-9]/g, "");
  const prefix = cleaned.startsWith("0") ? "62" + cleaned.slice(1) : cleaned.startsWith("62") ? cleaned : "62" + cleaned;
  return `https://wa.me/${prefix}?text=${encodeURIComponent(message)}`;
}

export default function SendClient({ invitations, allGuests, defaultInvitationId }: Props) {
  const router = useRouter();
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const [selectedId, setSelectedId] = useState<string>(defaultInvitationId || invitations[0]?.id || "");
  const [search, setSearch] = useState("");
  const [copied, setCopied] = useState(false);
  const [importResult, setImportResult] = useState<{ success: boolean; message: string } | null>(null);
  const [importing, setImporting] = useState(false);
  const [sending, setSending] = useState(false);
  const [selectedGuests, setSelectedGuests] = useState<Set<string>>(new Set());

  const [showGuestModal, setShowGuestModal] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);

  const [confirmDelete, setConfirmDelete] = useState<Guest | null>(null);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
  const [confirmClearAll, setConfirmClearAll] = useState(false);

  const selectedInvitation = invitations.find((i) => i.id === selectedId);
  const [guests, setGuests] = useState<Guest[]>([]);

  useEffect(() => {
    const gs = allGuests.filter((g) => g.invitation_id === selectedId);
    setGuests(gs);
    if (gs.length === 0 && selectedId && selectedInvitation) {
      fetchGuests();
    }
  }, [selectedId]);

  useEffect(() => {
    if (allGuests.length > 0) {
      setGuests(allGuests.filter((g) => g.invitation_id === selectedId));
    }
  }, [allGuests, selectedId]);

  const defaultTemplate = selectedInvitation
    ? [
        "Assalamu'alaikum Warahmatullahi Wabarakatuh,",
        "",
        "Kepada Yth. {nama_tamu}",
        "",
        "Tanpa mengurangi rasa hormat, kami mengundang Bapak/Ibu/Saudara/i untuk menghadiri acara pernikahan kami:",
        "",
        `💍 *${selectedInvitation.groom_name || "Mempelai Pria"}* & *${selectedInvitation.bride_name || "Mempelai Wanita"}*`,
        "",
        `📅 : ${selectedInvitation.akad_date || selectedInvitation.resepsi_date || "..."}`,
        `📍 : ${selectedInvitation.akad_venue || selectedInvitation.resepsi_venue || "..."}`,
        "",
        "Link undangan:",
        "{link_undangan}",
        "",
        "Merupakan suatu kehormatan dan kebahagiaan apabila Bapak/Ibu/Saudara/i berkenan hadir untuk memberikan doa restu.",
        "",
        "Terima kasih atas perhatiannya.",
        "Wassalamu'alaikum Warahmatullahi Wabarakatuh.",
      ].join("\n")
    : "";

  const [waTemplate, setWaTemplate] = useState(defaultTemplate);

  useEffect(() => {
    if (selectedInvitation) {
      setWaTemplate(defaultTemplate);
    }
  }, [selectedId]);

  const origin = mounted ? window.location.origin : "";

  const getPersonalizedMessage = (guest: Guest) => {
    const link = `${origin}/u/${selectedInvitation?.slug}?to=${encodeURIComponent(guest.name)}`;
    return waTemplate
      .replace(/{nama_tamu}/g, guest.name)
      .replace(/{link_undangan}/g, link);
  };

  const filteredGuests = guests.filter((g) =>
    search === "" || g.name.toLowerCase().includes(search.toLowerCase()) || (g.phone && g.phone.includes(search))
  );

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

  const fetchGuests = async () => {
    const res = await fetch(`/api/guests?invitation_id=${selectedId}`);
    const data = await res.json();
    if (data.data) setGuests(data.data);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedId) return;
    setImporting(true);
    setImportResult(null);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("invitation_id", selectedId);
    const res = await fetch("/api/guests/import", { method: "POST", body: formData });
    const data = await res.json();
    setImporting(false);
    if (res.ok) {
      setImportResult({ success: true, message: `Berhasil import ${data.imported} tamu` });
      toast.success(`Berhasil import ${data.imported} tamu`);
      fetchGuests();
    } else {
      setImportResult({ success: false, message: data.error || "Gagal import" });
      toast.error(data.error || "Gagal import");
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
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
        body: JSON.stringify({ invitation_id: selectedId, ...data }),
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

  const handleBulkDelete = async () => {
    toast.info(`Menghapus ${selectedGuests.size} tamu...`);
    for (const id of selectedGuests) {
      await fetch(`/api/guests/${id}`, { method: "DELETE" });
    }
    setGuests(guests.filter((g) => !selectedGuests.has(g.id)));
    toast.success(`${selectedGuests.size} tamu berhasil dihapus`);
    setSelectedGuests(new Set());
    setConfirmBulkDelete(false);
  };

  const handleClearAll = async () => {
    toast.info(`Menghapus ${guests.length} tamu...`);
    for (const g of guests) {
      await fetch(`/api/guests/${g.id}`, { method: "DELETE" });
    }
    setGuests([]);
    setSelectedGuests(new Set());
    toast.success("Semua data tamu berhasil dikosongkan");
    setConfirmClearAll(false);
  };

  const handleBlastWa = () => {
    const withPhone = guests.filter((g) => g.phone);
    if (withPhone.length === 0) {
      toast.warning("Tidak ada tamu dengan nomor HP");
      return;
    }
    setSending(true);
    withPhone.forEach((guest, i) => {
      setTimeout(() => {
        const message = getPersonalizedMessage(guest);
        const url = getWaUrl(guest.phone || "", message);
        window.open(url, "_blank");
      }, i * 2000);
    });
    setTimeout(() => {
      setSending(false);
      toast.success(`Membuka ${withPhone.length} chat WhatsApp`);
    }, withPhone.length * 2000 + 500);
  };

  const handleExportWa = () => {
    const withPhone = guests.filter((g) => g.phone);
    if (withPhone.length === 0) {
      toast.warning("Tidak ada tamu dengan nomor HP");
      return;
    }
    const rows = withPhone.map((g) => {
      const msg = getPersonalizedMessage(g);
      const url = getWaUrl(g.phone || "", msg);
      return `${g.name}\t${g.phone}\t${url}\t${msg}`;
    });
    const csv = "Nama\tNo. HP\tLink WhatsApp\tPesan\n" + rows.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `blast-wa-${selectedInvitation?.slug || "undangan"}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast.success("File CSV berhasil di-download");
  };

  const updateGuestStatus = async (guest: Guest, status: Guest["status"]) => {
    const res = await fetch(`/api/guests/${guest.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setGuests(guests.map((g) => g.id === guest.id ? { ...g, status } : g));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-20 border-b bg-white/80 backdrop-blur-md shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center gap-2 sm:gap-4">
            <button onClick={() => router.push("/dashboard")} className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-500 hover:text-gray-700">
              <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </button>
            <div className="h-5 w-px sm:h-6 bg-gray-200" />
            <h1 className="text-sm sm:text-lg font-semibold text-gray-900 truncate">
              <Send className="inline h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-1.5 text-green-500" />
              Kirim Undangan
            </h1>
          </div>
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="max-w-[160px] sm:max-w-xs rounded-lg border border-gray-200 bg-white px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm outline-none focus:border-green-400 focus:ring-1 focus:ring-green-200"
          >
            <option value="">Pilih Undangan</option>
            {invitations.map((inv) => (
              <option key={inv.id} value={inv.id}>
                {inv.title || "Untitled"}
              </option>
            ))}
          </select>
        </div>
      </header>

      {!selectedInvitation ? (
        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-16 sm:py-24 text-center">
          <Send className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-gray-300" />
          <h2 className="mt-4 sm:mt-6 text-lg sm:text-xl font-semibold text-gray-600">Pilih undangan dulu</h2>
          <p className="mt-2 text-xs sm:text-sm text-gray-400">Buat undangan terlebih dahulu di menu Buat Undangan</p>
          <button onClick={() => router.push("/dashboard/create")} className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#D4A843] px-5 sm:px-6 py-2.5 text-xs sm:text-sm font-medium text-white hover:bg-[#B8860B] transition-colors">
            Buat Undangan
          </button>
        </div>
      ) : (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex flex-col lg:grid lg:grid-cols-5 gap-4 sm:gap-6">
            <div className="lg:col-span-2 space-y-4 sm:space-y-4 order-2 lg:order-1">
              <div className="rounded-xl border bg-white p-4 sm:p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-3 sm:mb-4">
                  <Edit3 className="h-4 w-4 text-gray-400" />
                  <h2 className="text-sm font-semibold text-gray-700">Template Pesan WhatsApp</h2>
                </div>
                <div className="mb-3 rounded-lg bg-amber-50 p-3 text-xs text-amber-700">
                  <p className="font-medium mb-1">Variable:</p>
                  <code className="text-amber-600 bg-amber-100/50 px-1 rounded">{`{nama_tamu}`}</code> — Nama tamu
                  <span className="mx-1.5">·</span>
                  <code className="text-amber-600 bg-amber-100/50 px-1 rounded">{`{link_undangan}`}</code> — Link personal
                </div>
                <textarea
                  value={waTemplate}
                  onChange={(e) => setWaTemplate(e.target.value)}
                  rows={14}
                  className="w-full rounded-lg border border-gray-200 bg-white p-3 text-xs leading-relaxed outline-none focus:border-green-400 focus:ring-1 focus:ring-green-200 resize-none font-mono"
                />
                <button onClick={() => { const inv = invitations.find((i) => i.id === selectedId); if (inv) { setWaTemplate(defaultTemplate); } }} className="mt-2 text-xs text-gray-400 hover:text-gray-600 transition-colors">
                  Reset template
                </button>
              </div>
              <div className="rounded-xl border bg-white p-4 sm:p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Aksi Cepat</h3>
                <div className="space-y-2.5 sm:space-y-3">
                  <button onClick={handleBlastWa} disabled={sending || guests.length === 0}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-500 px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-medium text-white hover:bg-green-600 disabled:opacity-40 transition-all active:scale-[0.98]">
                    {sending ? (
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                    ) : <Send className="h-4 w-4" />}
                    {sending ? "Membuka WhatsApp..." : `Blast WA ke ${guests.filter((g) => g.phone).length} Tamu`}
                  </button>
                  <button onClick={handleExportWa} disabled={guests.length === 0}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-green-200 bg-green-50 px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-medium text-green-600 hover:bg-green-100 disabled:opacity-40 transition-all">
                    <Download className="h-4 w-4" /> Export CSV + Link WA
                  </button>
                  <a href={selectedInvitation.status === "published" ? `/u/${selectedInvitation.slug}` : "#"}
                    target={selectedInvitation.status === "published" ? "_blank" : undefined}
                    className={`flex w-full items-center justify-center gap-2 rounded-xl border px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-medium transition-all ${selectedInvitation.status === "published"
                      ? "border-[#D4A843]/30 text-[#B8860B] hover:bg-[#D4A843]/5 active:scale-[0.98]"
                      : "border-gray-200 text-gray-400 cursor-not-allowed"}`}>
                    <ExternalLink className="h-4 w-4" /> Lihat Undangan
                  </a>
                </div>
              </div>
            </div>

            <div className="lg:col-span-3 space-y-4 order-1 lg:order-2">
              <div className="rounded-xl border bg-white p-3 sm:p-4 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="relative flex-1 sm:flex-initial">
                      <Search className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 h-3 w-3 sm:h-3.5 sm:w-3.5 text-gray-400" />
                      <input type="text" placeholder="Cari tamu..." value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full sm:w-44 lg:w-48 rounded-lg border border-gray-200 bg-white pl-8 sm:pl-9 pr-3 sm:pr-4 py-2 text-xs sm:text-sm outline-none focus:border-green-400 focus:ring-1 focus:ring-green-200" />
                    </div>
                    <span className="text-xs text-gray-400 hidden sm:block">{guests.length} tamu</span>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <button onClick={() => { setEditingGuest(null); setShowGuestModal(true); }}
                      className="flex items-center gap-1 rounded-lg border border-green-200 bg-green-50 px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs font-medium text-green-600 hover:bg-green-100 transition-colors">
                      <Plus className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Tambah</span>
                    </button>
                    <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleImport} className="hidden" />
                    <a href="/api/guests/template"
                      className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs font-medium text-gray-500 hover:bg-gray-50 transition-colors">
                      <Download className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Template</span>
                    </a>
                    <button onClick={() => fileInputRef.current?.click()} disabled={importing}
                      className="flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs font-medium text-blue-600 hover:bg-blue-100 disabled:opacity-50 transition-colors">
                      <Upload className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">{importing ? "..." : "Import"}</span>
                    </button>
                  </div>
                </div>
                {!importResult && guests.length > 0 && (
                  <div className="mt-2 sm:mt-3 text-xs text-gray-400">
                    Kolom: <code className="bg-gray-100 px-1 rounded">Nama</code> (wajib),
                    <code className="bg-gray-100 px-1 rounded ml-1">No. HP</code>,
                    <code className="bg-gray-100 px-1 rounded ml-1">Email</code>
                    <span className="hidden sm:inline">
                      ,<code className="bg-gray-100 px-1 rounded ml-1">Alamat</code>,
                      <code className="bg-gray-100 px-1 rounded ml-1">Kategori</code>,
                      <code className="bg-gray-100 px-1 rounded ml-1">Catatan</code>
                    </span>
                    <span className="ml-2">· <a href="/api/guests/template" className="text-blue-500 hover:underline">Download template</a></span>
                  </div>
                )}
              </div>

              {selectedGuests.size > 0 && (
                <div className="flex items-center gap-2 sm:gap-3 rounded-xl border border-red-200 bg-red-50 px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm">
                  <span className="text-red-600 font-medium">{selectedGuests.size} terpilih</span>
                  <button onClick={() => setConfirmBulkDelete(true)}
                    className="flex items-center gap-1 rounded-lg bg-red-500 px-3 sm:px-4 py-1.5 text-xs font-medium text-white hover:bg-red-600 transition-colors">
                    <Trash2 className="h-3.5 w-3.5" /> Hapus
                  </button>
                  <button onClick={() => setSelectedGuests(new Set())}
                    className="text-xs text-gray-500 hover:text-gray-700 ml-auto transition-colors">
                    Batal
                  </button>
                </div>
              )}

              {guests.length === 0 ? (
                <div className="rounded-xl border bg-white py-12 sm:py-16 text-center">
                  <Users className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-300" />
                  <h3 className="mt-3 sm:mt-4 text-base sm:text-lg font-medium text-gray-600">
                    {search ? "Tamu tidak ditemukan" : "Belum ada daftar tamu"}
                  </h3>
                  <p className="mt-1 text-xs sm:text-sm text-gray-400">
                    {search ? "Coba kata kunci lain" : "Download template, isi data, lalu import"}
                  </p>
                  {!search && (
                    <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row justify-center gap-2 sm:gap-3">
                      <a href="/api/guests/template"
                        className="inline-flex items-center justify-center gap-2 rounded-full border border-gray-300 px-5 py-2 text-xs sm:text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                        <Download className="h-4 w-4" /> Download Template
                      </a>
                      <button onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-green-500 px-5 py-2 text-xs sm:text-sm font-medium text-white hover:bg-green-600 transition-colors">
                        <Upload className="h-4 w-4" /> Import Excel
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs sm:text-sm">
                      <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                        <tr>
                          <th className="px-2 sm:px-4 py-2.5 sm:py-3 w-8 sm:w-10">
                            <input type="checkbox"
                              checked={selectedGuests.size === filteredGuests.length && filteredGuests.length > 0}
                              onChange={toggleSelectAll}
                              className="rounded border-gray-300 text-green-500 focus:ring-green-400" />
                          </th>
                          <th className="px-2 sm:px-4 py-2.5 sm:py-3 text-left">Nama</th>
                          <th className="px-2 sm:px-4 py-2.5 sm:py-3 text-left hidden sm:table-cell">No. HP</th>
                          <th className="px-2 sm:px-4 py-2.5 sm:py-3 text-left hidden md:table-cell">Kategori</th>
                          <th className="px-2 sm:px-4 py-2.5 sm:py-3 text-left">Status</th>
                          <th className="px-2 sm:px-4 py-2.5 sm:py-3 text-center">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredGuests.map((guest) => {
                          const msg = getPersonalizedMessage(guest);
                          const waUrl = guest.phone ? getWaUrl(guest.phone, msg) : "";
                          return (
                            <tr key={guest.id} className={`hover:bg-gray-50 transition-colors ${selectedGuests.has(guest.id) ? "bg-green-50/50" : ""}`}>
                              <td className="px-2 sm:px-4 py-2 sm:py-3">
                                <input type="checkbox"
                                  checked={selectedGuests.has(guest.id)}
                                  onChange={() => toggleSelect(guest.id)}
                                  className="rounded border-gray-300 text-green-500 focus:ring-green-400" />
                              </td>
                              <td className="px-2 sm:px-4 py-2 sm:py-3">
                                <div className="font-medium text-gray-700 truncate max-w-[120px] sm:max-w-none">{guest.name}</div>
                              </td>
                              <td className="px-2 sm:px-4 py-2 sm:py-3 text-gray-600 font-mono text-xs hidden sm:table-cell">{guest.phone || "-"}</td>
                              <td className="px-2 sm:px-4 py-2 sm:py-3 hidden md:table-cell">
                                {guest.category ? (
                                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{guest.category}</span>
                                ) : "-"}
                              </td>
                              <td className="px-2 sm:px-4 py-2 sm:py-3">
                                <select value={guest.status}
                                  onChange={(e) => updateGuestStatus(guest, e.target.value as Guest["status"])}
                                  className={`text-xs rounded border border-gray-200 bg-transparent px-1.5 sm:px-2 py-1 outline-none ${guest.status === "confirmed" ? "text-green-600" : guest.status === "invited" ? "text-blue-600" : guest.status === "declined" ? "text-red-500" : "text-gray-500"}`}>
                                  <option value="pending">Pending</option>
                                  <option value="invited">Diundang</option>
                                  <option value="confirmed">Hadir</option>
                                  <option value="declined">Tidak</option>
                                </select>
                              </td>
                              <td className="px-2 sm:px-4 py-2 sm:py-3">
                                <div className="flex items-center justify-center gap-0.5 sm:gap-1">
                                  {guest.phone ? (
                                    <a href={waUrl} target="_blank" rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 rounded-lg p-1.5 sm:px-2.5 sm:py-1.5 text-xs text-green-600 hover:bg-green-50 transition-colors"
                                      title="Kirim WA">
                                      <Smartphone className="h-3.5 w-3.5" />
                                    </a>
                                  ) : (
                                    <span className="inline-flex items-center p-1.5 text-xs text-gray-300">-</span>
                                  )}
                                  <button onClick={() => { setEditingGuest(guest); setShowGuestModal(true); }}
                                    className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors" title="Edit">
                                    <Edit3 className="h-3.5 w-3.5" />
                                  </button>
                                  <button onClick={() => setConfirmDelete(guest)}
                                    className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors" title="Hapus">
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex items-center justify-between border-t bg-gray-50 px-3 sm:px-4 py-2.5 sm:py-3">
                    <span className="text-xs text-gray-400">
                      {filteredGuests.length} dari {guests.length} tamu · {guests.filter((g) => g.phone).length} punya nomor HP
                    </span>
                    <button onClick={() => setConfirmClearAll(true)}
                      className="flex items-center gap-1 text-xs text-red-400 hover:text-red-500 transition-colors">
                      <Trash2 className="h-3 w-3" /> Kosongkan semua
                    </button>
                  </div>
                </div>
              )}

              {filteredGuests.length > 0 && (
                <div className="rounded-xl border bg-white p-3 sm:p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2 sm:mb-3">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Preview Pesan</h3>
                    <button onClick={() => {
                      const first = filteredGuests.find((g) => g.phone);
                      if (first) {
                        navigator.clipboard.writeText(getPersonalizedMessage(first));
                        setCopied(true);
                        toast.success("Pesan disalin!");
                        setTimeout(() => setCopied(false), 2000);
                      }
                    }}
                      className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors">
                      {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                      {copied ? "Tersalin" : "Salin"}
                    </button>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-3 sm:p-4 text-xs whitespace-pre-wrap leading-relaxed text-gray-600 font-mono max-h-48 overflow-y-auto">
                    {filteredGuests.find((g) => g.phone)
                      ? getPersonalizedMessage(filteredGuests.find((g) => g.phone)!)
                      : "Tidak ada tamu dengan nomor HP"}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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
        open={confirmBulkDelete}
        title="Hapus Tamu Terpilih"
        message={`Hapus ${selectedGuests.size} tamu yang dipilih? Tindakan ini tidak bisa dibatalkan.`}
        confirmLabel={`Ya, hapus ${selectedGuests.size} tamu`}
        variant="danger"
        onConfirm={handleBulkDelete}
        onCancel={() => setConfirmBulkDelete(false)}
      />

      <ConfirmDialog
        open={confirmClearAll}
        title="Kosongkan Semua Tamu"
        message={`Hapus semua ${guests.length} data tamu? Tindakan ini tidak bisa dibatalkan.`}
        confirmLabel="Ya, kosongkan semua"
        variant="danger"
        onConfirm={handleClearAll}
        onCancel={() => setConfirmClearAll(false)}
      />
    </div>
  );
}
