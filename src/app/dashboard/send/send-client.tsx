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
  Zap,
  QrCode,
  KeyRound,
  Wifi,
  WifiOff,
  Loader2,
  Eye,
  EyeOff,
  RefreshCw,
} from "lucide-react";
import { useToast } from "@/components/Toast";
import ConfirmDialog from "@/components/ConfirmDialog";
import GuestFormModal from "@/components/GuestFormModal";
import { useWablast } from "@/lib/useWablast";

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

function getQrImageSrc(data: string): string {
  if (data.startsWith("data:image/")) return data;
  if (data.startsWith("http://") || data.startsWith("https://")) return data;
  if (/^[A-Za-z0-9+/=]+$/.test(data) && data.length > 100) return `data:image/png;base64,${data}`;
  if (data.startsWith("iVBOR") || data.startsWith("/9j/") || data.startsWith("R0lGOD")) return `data:image/png;base64,${data}`;
  return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(data)}`;
}

function QrImage({ data }: { data: string }) {
  const [fallback, setFallback] = useState(false);
  const src = fallback
    ? `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(data)}`
    : getQrImageSrc(data);

  return (
    <img
      src={src}
      alt="QR Code"
      className="mx-auto max-w-[200px] rounded-lg bg-white p-2"
      onError={() => { if (!fallback) setFallback(true); }}
    />
  );
}

export default function SendClient({ invitations, allGuests, defaultInvitationId }: Props) {
  const router = useRouter();
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const wablastHook = useWablast();
  const [showApiPanel, setShowApiPanel] = useState(false);
  const [apiEmail, setApiEmail] = useState("");
  const [apiPassword, setApiPassword] = useState("");
  const [showApiPassword, setShowApiPassword] = useState(false);
  const [pairingPhone, setPairingPhone] = useState("");
  const [showPairingCodeResult, setShowPairingCodeResult] = useState(false);
  const [pairingCodeResult, setPairingCodeResult] = useState<string | null>(null);
  const [pairingCodeError, setPairingCodeError] = useState("");
  const [showQrImage, setShowQrImage] = useState(false);
  const [qrImageData, setQrImageData] = useState<string | null>(null);
  const [blastingViaApi, setBlastingViaApi] = useState(false);
  const [blastApiError, setBlastApiError] = useState("");
  const [blastDelay, setBlastDelay] = useState(1);
  const [blastJitter, setBlastJitter] = useState(0);
  const [blastStep, setBlastStep] = useState(0);

  useEffect(() => {
    if (showApiPanel && (showQrImage || showPairingCodeResult)) {
      wablastHook.startPolling();
    } else {
      wablastHook.stopPolling();
    }
  }, [showApiPanel, showQrImage, showPairingCodeResult, wablastHook.startPolling, wablastHook.stopPolling]);

  useEffect(() => {
    if (showApiPanel && wablastHook.isLoggedIn) {
      wablastHook.fetchCampaignList();
    }
  }, [showApiPanel, wablastHook.isLoggedIn]);

  const [countdown, setCountdown] = useState("");

  useEffect(() => {
    const c = wablastHook.campaign;
    if (!c?.startTime || c.status !== "running" || !c.total) {
      setCountdown("");
      return;
    }
    const avgDelay = (c.delaySeconds || 1) + ((c.jitterSeconds || 0) / 2);
    const estimatedMs = c.total * avgDelay * 1000;
    const endTime = c.startTime + estimatedMs;

    const tick = () => {
      const remaining = Math.max(0, endTime - Date.now());
      if (remaining <= 0) { setCountdown("Estimasi selesai"); return; }
      const mins = Math.floor(remaining / 60000);
      const secs = Math.floor((remaining % 60000) / 1000);
      setCountdown(`~${mins}m ${secs}d lagi`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [wablastHook.campaign?.startTime, wablastHook.campaign?.status, wablastHook.campaign?.total]);

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

  const formatDate = (date: string | null) =>
    date ? new Date(date + "T00:00:00").toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) : "...";

  const defaultTemplate = selectedInvitation
    ? [
        "Assalamu'alaikum Warahmatullahi Wabarakatuh,",
        "",
        "Kepada Yth. {nama_tamu}",
        "",
        "Tanpa mengurangi rasa hormat, kami mengundang Bapak/Ibu/Saudara/i untuk menghadiri acara pernikahan kami:",
        "",
        `*${selectedInvitation.groom_name || "Mempelai Pria"}* & *${selectedInvitation.bride_name || "Mempelai Wanita"}*`,
        "",
        `*Hari/Tanggal:* ${formatDate(selectedInvitation.akad_date || selectedInvitation.resepsi_date)}`,
        `*Jam:* ${selectedInvitation.akad_time || selectedInvitation.resepsi_time || "08:00"} - ${selectedInvitation.akad_end_time || selectedInvitation.resepsi_end_time || "10:30"} WIB`,
        `*Lokasi:* ${[selectedInvitation.akad_venue || selectedInvitation.resepsi_venue, selectedInvitation.akad_address || selectedInvitation.resepsi_address].filter(Boolean).join(", ") || "Nawasena Garden Resto & Ballroom, Jl. H. Agus Salim No.90, Pandean, Kec. Manguharjo, Kota Madiun, Jawa Timur 63129"}`,
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

  const handleBlastViaApi = async () => {
    if (!wablastHook.isLoggedIn) {
      toast.warning("Login ke App Blast terlebih dahulu");
      return;
    }
    if (wablastHook.deviceStatus !== "connected") {
      toast.warning("Sambungkan perangkat WA terlebih dahulu");
      return;
    }
    const withPhone = guests.filter((g) => g.phone);
    if (withPhone.length === 0) {
      toast.warning("Tidak ada tamu dengan nomor HP");
      return;
    }
    setBlastingViaApi(true);
    setBlastApiError("");
    try {
      const link = `${origin}/u/${selectedInvitation?.slug}`;
      const contacts = withPhone.map((g) => {
        const personalLink = `${link}?to=${encodeURIComponent(g.name)}`;
        const message = waTemplate
          .replace(/{nama_tamu}/g, g.name)
          .replace(/{link_undangan}/g, personalLink);
        return { name: g.name, phone: g.phone || "", message };
      });

      console.log("[BLAST DEBUG] Sending personalized blast to", contacts.length, "contacts");
      console.log("[BLAST DEBUG] First message:", contacts[0]?.message.slice(0, 100));

      await wablastHook.sendPersonalizedBlast(contacts, blastDelay, blastJitter);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Gagal mengirim blast";
      setBlastApiError(msg);
      toast.error(msg);
      setBlastStep(4);
    }
    setBlastingViaApi(false);
  };

  const handleCopyPairingCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Kode pairing disalin!");
  };

  const [markingInvited, setMarkingInvited] = useState(false);
  const handleMarkAsInvited = async () => {
    const successPhones = wablastHook.campaignMessages
      .filter((m) => m.status === "sent" || m.status === "success" || m.status === "delivered")
      .map((m) => m.phone?.replace(/[^0-9]/g, "") || "")
      .filter(Boolean);

    if (successPhones.length === 0) {
      toast.warning("Tidak ada pesan sukses");
      return;
    }

    let updated = 0;
    setMarkingInvited(true);
    for (const g of guests) {
      if (!g.phone) continue;
      const gPhone = g.phone.replace(/[^0-9]/g, "");
      if (successPhones.includes(gPhone) && g.status !== "invited" && g.status !== "confirmed") {
        try {
          const res = await fetch(`/api/guests/${g.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "invited" }),
          });
          if (res.ok) {
            setGuests((prev) => prev.map((gg) => gg.id === g.id ? { ...gg, status: "invited" as Guest["status"] } : gg));
            updated++;
          }
        } catch { /* skip */ }
      }
    }
    setMarkingInvited(false);
    if (updated > 0) {
      toast.success(`${updated} tamu ditandai "Diundang"`);
    } else {
      toast.info("Semua tamu sudah ditandai atau tidak ditemukan");
    }
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

              {/* WA Blast API Panel */}
              <div className="rounded-xl border bg-white p-4 sm:p-5 shadow-sm">
                <button
                  onClick={() => setShowApiPanel(!showApiPanel)}
                  className="flex w-full items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-amber-500" />
                    <h2 className="text-sm font-semibold text-gray-700">WA Blast API</h2>
                    {wablastHook.isLoggedIn && wablastHook.deviceStatus === "connected" && (
                      <span className="flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs text-green-600">
                        <Wifi className="h-3 w-3" /> Online
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-400">{showApiPanel ? "Sembunyikan" : "Tampilkan"}</span>
                </button>

                {showApiPanel && (
                  <div className="mt-4 space-y-4">
                    {!wablastHook.isLoggedIn ? (
                      <div className="space-y-3">
                        <p className="text-xs text-gray-500">
                          Login ke App Blast untuk mengirim undangan via API langsung tanpa membuka tab WA satu per satu.
                        </p>
                        {wablastHook.loginError && (
                          <div className="rounded-lg bg-red-50 border border-red-100 px-3 py-2 text-xs text-red-600">
                            {wablastHook.loginError}
                          </div>
                        )}
                        <div>
                          <label className="mb-1 block text-xs font-medium text-gray-500">Email</label>
                          <input
                            type="email"
                            value={apiEmail}
                            onChange={(e) => setApiEmail(e.target.value)}
                            placeholder="email@example.com"
                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-200"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-medium text-gray-500">Password</label>
                          <div className="relative">
                            <input
                              type={showApiPassword ? "text" : "password"}
                              value={apiPassword}
                              onChange={(e) => setApiPassword(e.target.value)}
                              placeholder="Password"
                              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 pr-10 text-xs outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-200"
                              onKeyDown={(e) => { if (e.key === "Enter") wablastHook.login(apiEmail, apiPassword); }}
                            />
                            <button
                              type="button"
                              onClick={() => setShowApiPassword(!showApiPassword)}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              {showApiPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                            </button>
                          </div>
                        </div>
                        <button
                          onClick={() => wablastHook.login(apiEmail, apiPassword)}
                          disabled={wablastHook.isLoggingIn || !apiEmail || !apiPassword}
                          className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-medium text-white hover:bg-amber-600 disabled:opacity-50 transition-colors"
                        >
                          {wablastHook.isLoggingIn ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Zap className="h-3.5 w-3.5" />
                          )}
                          {wablastHook.isLoggingIn ? "Login..." : "Login ke App Blast"}
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
                          <span className="text-xs text-gray-600 truncate max-w-[200px]">
                            {wablastHook.user?.email || "Logged in"}
                          </span>
                          <button
                            onClick={() => wablastHook.logout()}
                            className="text-xs text-red-400 hover:text-red-600 transition-colors"
                          >
                            Logout
                          </button>
                        </div>

                        <div className="flex items-center justify-between rounded-lg border p-3">
                          <div className="flex items-center gap-2">
                            {wablastHook.deviceStatus === "connected" ? (
                              <Wifi className="h-4 w-4 text-green-500" />
                            ) : wablastHook.deviceStatus === "connecting" ? (
                              <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
                            ) : (
                              <WifiOff className="h-4 w-4 text-gray-400" />
                            )}
                            <div>
                              <span className="text-xs font-medium text-gray-700">
                                {wablastHook.deviceStatus === "connected"
                                  ? `Terhubung${wablastHook.devicePhone ? ` (${wablastHook.devicePhone})` : ""}`
                                  : wablastHook.deviceStatus === "connecting"
                                  ? "Menghubungkan..."
                                  : "Tidak terhubung"}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => wablastHook.checkDeviceStatus()}
                              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 transition-colors"
                              title="Refresh status"
                            >
                              <RefreshCw className="h-3.5 w-3.5" />
                            </button>
                            {wablastHook.deviceStatus === "connected" ? (
                              <button
                                onClick={() => wablastHook.disconnectDevice()}
                                className="rounded-lg px-2 py-1 text-xs text-red-500 hover:bg-red-50 transition-colors"
                              >
                                Putuskan
                              </button>
                            ) : (
                              <button
                                onClick={() => wablastHook.connectDevice()}
                                disabled={wablastHook.deviceStatus === "connecting"}
                                className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-600 disabled:opacity-50 transition-colors"
                              >
                                Sambungkan
                              </button>
                            )}
                          </div>
                        </div>

                        {wablastHook.deviceStatus !== "connected" && (
                          <div className="space-y-2">
                            <div className="flex gap-2">
                              <button
                                onClick={async () => {
                                  try {
                                    setShowQrImage(true);
                                    setQrImageData(null);
                                    await wablastHook.connectDevice();
                                    const qr = await wablastHook.fetchQr();
                                    if (qr) setQrImageData(qr);
                                  } catch (e) {
                                    toast.error("Gagal mendapatkan QR");
                                  }
                                }}
                                className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                              >
                                <QrCode className="h-3.5 w-3.5" /> Scan QR
                              </button>
                              <button
                                onClick={async () => {
                                  setShowPairingCodeResult(true);
                                  setPairingCodeResult(null);
                                  setPairingCodeError("");
                                }}
                                className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                              >
                                <KeyRound className="h-3.5 w-3.5" /> Kode Pairing
                              </button>
                            </div>

                            {showPairingCodeResult && (
                              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 space-y-2">
                                <p className="text-xs text-amber-700">Masukkan nomor HP untuk mendapatkan kode pairing:</p>
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    value={pairingPhone}
                                    onChange={(e) => setPairingPhone(e.target.value)}
                                    placeholder="081234567890"
                                    className="flex-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs outline-none focus:border-amber-400"
                                  />
                                  <button
                                    onClick={async () => {
                                      setPairingCodeError("");
                                      try {
                                        const code = await wablastHook.fetchPairingCode(pairingPhone);
                                        if (code) setPairingCodeResult(code);
                                      } catch (e) {
                                        setPairingCodeError(e instanceof Error ? e.message : "Gagal");
                                      }
                                    }}
                                    disabled={wablastHook.isGettingPairingCode || !pairingPhone}
                                    className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-600 disabled:opacity-50 transition-colors"
                                  >
                                    {wablastHook.isGettingPairingCode ? "..." : "Dapatkan"}
                                  </button>
                                </div>
                                {pairingCodeError && (
                                  <p className="text-xs text-red-500">{pairingCodeError}</p>
                                )}
                                {pairingCodeResult && (
                                  <div className="flex items-center gap-2 rounded-lg bg-white border px-3 py-2">
                                    <code className="flex-1 text-sm font-bold text-amber-700 tracking-wider">{pairingCodeResult}</code>
                                    <button
                                      onClick={() => handleCopyPairingCode(pairingCodeResult)}
                                      className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 transition-colors"
                                    >
                                      <Copy className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}

                            {showQrImage && (
                              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 space-y-2 text-center">
                                <p className="text-xs text-amber-700">Scan QR code dengan WhatsApp:</p>
                                {qrImageData ? (
                                  <QrImage data={qrImageData} />
                                ) : (
                                  <div className="flex items-center justify-center py-8">
                                    <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
                                  </div>
                                )}
                                <button
                                  onClick={() => setShowQrImage(false)}
                                  className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                  Tutup
                                </button>
                              </div>
                            )}
                          </div>
                        )}

                        {wablastHook.campaign && (
                          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 space-y-3">
                            <div className="flex items-center gap-2">
                              {wablastHook.campaign.status === "running" ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-500" />
                              ) : wablastHook.campaign.status === "completed" ? (
                                <Check className="h-3.5 w-3.5 text-green-500" />
                              ) : (
                                <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-500" />
                              )}
                              <span className="text-xs font-medium text-blue-700">
                                {wablastHook.campaign.message}
                              </span>
                            </div>

                            {countdown && (
                              <div className="flex items-center gap-1.5 text-xs text-blue-600">
                                <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
                                {countdown}
                                <span className="text-blue-400">(delay: {wablastHook.campaign.delaySeconds ?? "-"}s + jitter: {wablastHook.campaign.jitterSeconds ?? "-"}s)</span>
                              </div>
                            )}

                            {(wablastHook.campaign.status === "running" || wablastHook.campaign.status === "completed") && (
                              <div className="space-y-1">
                                <div className="flex justify-between text-xs text-blue-600">
                                  <span>Terkirim: {wablastHook.campaign.sent ?? 0} / {wablastHook.campaign.total ?? 0}</span>
                                  <span>
                                    Sukses: <span className="text-green-600 font-medium">{wablastHook.campaign.successCount ?? 0}</span>
                                    {" · "}
                                    Gagal: <span className="text-red-500 font-medium">{wablastHook.campaign.failedCount ?? 0}</span>
                                  </span>
                                </div>
                                <div className="h-1.5 w-full rounded-full bg-blue-100 overflow-hidden">
                                  <div
                                    className="h-full rounded-full bg-blue-500 transition-all duration-500"
                                    style={{ width: `${wablastHook.campaign.total ? Math.min(100, ((wablastHook.campaign.sent ?? 0) / wablastHook.campaign.total) * 100) : 0}%` }}
                                  />
                                </div>
                              </div>
                            )}

                            {wablastHook.campaign.campaignId && (
                              <>
                                <button
                                  onClick={() => wablastHook.refreshCurrentCampaign()}
                                  disabled={wablastHook.isSyncing}
                                  className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-blue-500 px-3 py-2 text-xs font-medium text-white hover:bg-blue-600 disabled:opacity-50 transition-colors"
                                >
                                  {wablastHook.isSyncing ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <RefreshCw className="h-3 w-3" />
                                  )}
                                  {wablastHook.isSyncing ? "Syncing..." : "Sync Data Pesan"}
                                </button>
                                {wablastHook.campaignMessages.length > 0 && (
                                  <button
                                    onClick={handleMarkAsInvited}
                                    disabled={markingInvited}
                                    className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-green-500 px-3 py-2 text-xs font-medium text-white hover:bg-green-600 disabled:opacity-50 transition-colors"
                                  >
                                    {markingInvited ? (
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : (
                                      <Users className="h-3 w-3" />
                                    )}
                                    {markingInvited ? "Menandai..." : "Tandai Diundang"}
                                  </button>
                                )}
                              </>
                            )}

                            {wablastHook.campaignMessages.length > 0 && (
                              <div className="space-y-1 max-h-32 overflow-y-auto">
                                <p className="text-xs text-blue-600 font-medium">
                                  Detail Pengiriman ({wablastHook.campaignMessages.length}):
                                </p>
                                {wablastHook.campaignMessages.map((msg, i) => {
                                  const msgTime = msg.timestamp
                                    ? new Date(msg.timestamp).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
                                    : "";
                                  return (
                                  <div
                                    key={i}
                                    className={`flex items-center justify-between rounded-md px-2 py-1 text-xs ${
                                      msg.status === "sent" || msg.status === "success"
                                        ? "bg-green-50 text-green-700"
                                        : msg.status === "failed" || msg.status === "error"
                                        ? "bg-red-50 text-red-600"
                                        : "bg-white text-gray-500"
                                    }`}
                                  >
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2">
                                        <span className="truncate max-w-[100px] text-gray-700">{msg.phone || "-"}</span>
                                        <span className={`font-medium ${msg.status === "sent" || msg.status === "success" ? "text-green-600" : msg.status === "failed" ? "text-red-500" : "text-gray-400"}`}>
                                          {msg.status === "sent" || msg.status === "success" ? "Sent" : msg.status === "failed" || msg.status === "error" ? "Failed" : msg.status || "Pending"}
                                        </span>
                                      </div>
                                      {msg.reason && <div className="text-red-400 mt-0.5 text-[10px]">{msg.reason}</div>}
                                    </div>
                                    {msgTime && <span className="text-gray-400 ml-2 text-[10px]">{msgTime}</span>}
                                  </div>
                                )})}
                              </div>
                            )}
                          </div>
                        )}

                        {blastApiError && (
                          <div className="rounded-lg bg-red-50 border border-red-100 px-3 py-2 text-xs text-red-600">
                            {blastApiError}
                          </div>
                        )}

                        {wablastHook.isLoggedIn && (
                          <div className="space-y-1">
                            <button
                              onClick={() => { wablastHook.fetchCampaignList(); }}
                              disabled={wablastHook.isFetchingCampaigns}
                              className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                            >
                              <span className="flex items-center gap-1.5">
                                {wablastHook.isFetchingCampaigns ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <RefreshCw className="h-3 w-3" />
                                )}
                                Daftar Campaign
                              </span>
                              {wablastHook.campaignList.length > 0 && (
                                <span className="text-gray-400">{wablastHook.campaignList.length}</span>
                              )}
                            </button>
                            {wablastHook.campaignList.length > 0 && (
                              <div className="space-y-1 max-h-48 overflow-y-auto">
                                {wablastHook.campaignList.slice(0, 5).map((c, i) => {
                                  const cid = (c.id || c.campaign_id || "") as string;
                                  const cname = (c.name || c.campaign_name || "Campaign") as string;
                                  const cstatus = (c.status || "draft") as string;
                                  const ctotal = (c.total_count || c.total || 0) as number;
                                  const cdate = (c.created_at || c.started_at || c.date || "") as string;
                                  const formattedDate = cdate
                                    ? new Date(cdate).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) + " " +
                                      new Date(cdate).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
                                    : "";
                                  return (
                                    <details key={i} className="group rounded-lg border bg-white">
                                      <summary
                                        className="flex cursor-pointer items-center justify-between px-3 py-2 text-xs list-none"
                                        onClick={() => { if (cid) wablastHook.syncCampaignMessages(cid); }}
                                      >
                                        <div className="flex-1 min-w-0">
                                          <div className="truncate font-medium text-gray-700">{cname}</div>
                                          <div className="flex items-center gap-2 text-gray-400 mt-0.5">
                                            <span className={`inline-block h-1.5 w-1.5 rounded-full ${
                                              cstatus === "running" ? "bg-blue-500 animate-pulse" :
                                              cstatus === "completed" ? "bg-green-500" : "bg-gray-300"
                                            }`} />
                                            {cstatus} · {ctotal} kontak
                                            {formattedDate && <span>· {formattedDate}</span>}
                                          </div>
                                        </div>
                                        <span className="ml-2 text-xs text-gray-400 group-open:hidden">Lihat ▸</span>
                                        <span className="ml-2 text-xs text-gray-400 hidden group-open:inline">Tutup ▾</span>
                                      </summary>
                                      <div className="border-t px-3 py-2 space-y-1 max-h-32 overflow-y-auto">
                                        {(() => {
                                          const msgs = wablastHook.campaignMessagesMap[cid];
                                          if (!msgs || msgs.length === 0) {
                                            return (
                                              <div className="flex items-center justify-center py-4 text-xs text-gray-400">
                                                <Loader2 className="h-3 w-3 animate-spin mr-1.5" />
                                                Memuat data pesan...
                                              </div>
                                            );
                                          }
                                          return msgs.map((msg, j) => {
                                            const msgDate = msg.timestamp
                                              ? new Date(msg.timestamp).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
                                              : "";
                                            return (
                                              <div key={j} className={`flex items-center justify-between rounded-md px-2 py-1 text-xs ${
                                                msg.status === "sent" || msg.status === "success" ? "bg-green-50 text-green-700" :
                                                msg.status === "failed" || msg.status === "error" ? "bg-red-50 text-red-600" :
                                                "bg-white text-gray-500"
                                              }`}>
                                                <div className="flex-1 min-w-0">
                                                  <div className="flex items-center gap-2">
                                                    <span className="truncate max-w-[100px] text-gray-700">{msg.phone || "-"}</span>
                                                    <span className={`font-medium ${msg.status === "sent" || msg.status === "success" ? "text-green-600" : msg.status === "failed" ? "text-red-500" : "text-gray-400"}`}>
                                                      {msg.status === "sent" || msg.status === "success" ? "Sent" : msg.status === "failed" || msg.status === "error" ? "Failed" : msg.status || "-"}
                                                    </span>
                                                  </div>
                                                  {msg.reason && <div className="text-red-400 mt-0.5 text-[10px]">{msg.reason}</div>}
                                                </div>
                                                {msgDate && <span className="text-gray-400 ml-2 text-[10px]">{msgDate}</span>}
                                              </div>
                                            );
                                          });
                                        })()}
                                      </div>
                                    </details>
                                  );
                                })}
                                {wablastHook.campaignList.length > 5 && (
                                  <p className="text-center text-xs text-gray-400 py-1">
                                    + {wablastHook.campaignList.length - 5} campaign lainnya (scroll)
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        )}

                        {wablastHook.deviceStatus === "connected" && blastStep === 0 && (
                          <>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="mb-1 block text-xs text-gray-500">Delay (detik)</label>
                                <input
                                  type="number" min={0} max={60}
                                  value={blastDelay}
                                  onChange={(e) => setBlastDelay(Number(e.target.value) || 0)}
                                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs outline-none focus:border-amber-400"
                                />
                              </div>
                              <div>
                                <label className="mb-1 block text-xs text-gray-500">Jitter (detik)</label>
                                <input
                                  type="number" min={0} max={30}
                                  value={blastJitter}
                                  onChange={(e) => setBlastJitter(Number(e.target.value) || 0)}
                                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs outline-none focus:border-amber-400"
                                />
                              </div>
                            </div>
                            <button
                              onClick={() => { if (guests.filter((g) => g.phone).length > 0) setBlastStep(1); else toast.warning("Tidak ada tamu dengan nomor HP"); }}
                              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-medium text-white hover:from-amber-600 hover:to-orange-600 active:scale-[0.98] shadow-sm shadow-amber-200 transition-all"
                            >
                              <Zap className="h-4 w-4" />
                              Mulai Blast Step-by-Step ({guests.filter((g) => g.phone).length} tamu)
                            </button>
                          </>
                        )}

                        {wablastHook.deviceStatus === "connected" && blastStep === 1 && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-xs font-medium text-amber-700">
                              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-white text-xs font-bold">1</span>
                              Preview Data Kontak
                            </div>
                            <p className="text-xs text-gray-500">
                              {guests.filter((g) => g.phone).length} kontak dengan nomor HP akan dikirim:
                            </p>
                            <div className="max-h-28 overflow-y-auto rounded-lg border bg-white divide-y divide-gray-50">
                              {guests.filter((g) => g.phone).slice(0, 20).map((g) => (
                                <div key={g.id} className="flex items-center justify-between px-3 py-1.5 text-xs">
                                  <span className="truncate flex-1 text-gray-700">{g.name}</span>
                                  <span className="text-gray-400 font-mono ml-2">{g.phone}</span>
                                </div>
                              ))}
                              {guests.filter((g) => g.phone).length > 20 && (
                                <div className="px-3 py-1.5 text-xs text-gray-400 text-center">
                                  ... dan {guests.filter((g) => g.phone).length - 20} lainnya
                                </div>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => setBlastStep(0)} className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-xs text-gray-500 hover:bg-gray-50 transition-colors">Kembali</button>
                              <button onClick={() => setBlastStep(2)} className="flex-1 rounded-lg bg-amber-500 px-3 py-2 text-xs font-medium text-white hover:bg-amber-600 transition-colors">Lanjut</button>
                            </div>
                          </div>
                        )}

                        {wablastHook.deviceStatus === "connected" && blastStep === 2 && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-xs font-medium text-amber-700">
                              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-white text-xs font-bold">2</span>
                              Preview Template Pesan
                            </div>
                            <div className="rounded-lg bg-white border p-3 text-xs whitespace-pre-wrap leading-relaxed text-gray-600 font-mono max-h-48 overflow-y-auto">
                              {(() => {
                                const sample = guests.find((g) => g.phone);
                                if (!sample) return "⚠ Belum ada tamu dengan nomor HP";
                                const personalLink = `${origin}/u/${selectedInvitation?.slug}?to=${encodeURIComponent(sample.name)}`;
                                return (
                                  <span>
                                    <span className="text-amber-600 font-medium block mb-1">Preview untuk: {sample.name} ({sample.phone})</span>
                                    {waTemplate
                                      .replace(/{nama_tamu}/g, sample.name)
                                      .replace(/{link_undangan}/g, personalLink)}
                                  </span>
                                );
                              })()}
                            </div>
                            <p className="text-xs text-gray-400">
                              Tiap kontak dapat pesan dengan <strong>nama + link personal</strong> (1 campaign per kontak, template sudah di-render)
                            </p>
                            <div className="flex gap-2">
                              <button onClick={() => setBlastStep(1)} className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-xs text-gray-500 hover:bg-gray-50 transition-colors">Kembali</button>
                              <button onClick={() => setBlastStep(3)} className="flex-1 rounded-lg bg-amber-500 px-3 py-2 text-xs font-medium text-white hover:bg-amber-600 transition-colors">Lanjut</button>
                            </div>
                          </div>
                        )}

                        {wablastHook.deviceStatus === "connected" && blastStep === 3 && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-xs font-medium text-amber-700">
                              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-white text-xs font-bold">3</span>
                              Konfirmasi Pengaturan Pengiriman
                            </div>
                            <div className="rounded-lg border bg-white p-3 space-y-2">
                              <div className="flex justify-between text-xs">
                                <span className="text-gray-500">Delay antar pesan:</span>
                                <span className="font-medium text-gray-700">{blastDelay} detik</span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span className="text-gray-500">Jitter (variasi acak):</span>
                                <span className="font-medium text-gray-700">±{blastJitter} detik</span>
                              </div>
                              <div className="flex justify-between text-xs border-t pt-2">
                                <span className="text-gray-500">Estimasi total:</span>
                                <span className="font-medium text-gray-700">
                                  {(() => {
                                    const total = guests.filter((g) => g.phone).length;
                                    const avgDelay = blastDelay + blastJitter / 2;
                                    const seconds = total * avgDelay;
                                    if (seconds < 60) return `${Math.round(seconds)} detik`;
                                    if (seconds < 3600) return `~${Math.round(seconds / 60)} menit`;
                                    return `~${Math.round(seconds / 3600)} jam`;
                                  })()}
                                </span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => setBlastStep(2)} className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-xs text-gray-500 hover:bg-gray-50 transition-colors">Kembali</button>
                              <button onClick={() => setBlastStep(4)} className="flex-1 rounded-lg bg-amber-500 px-3 py-2 text-xs font-medium text-white hover:bg-amber-600 transition-colors">Lanjut</button>
                            </div>
                          </div>
                        )}

                        {wablastHook.deviceStatus === "connected" && blastStep === 4 && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-xs font-medium text-amber-700">
                              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-white text-xs font-bold">4</span>
                              Konfirmasi Kirim Blast
                            </div>
                            <div className="rounded-lg border bg-amber-50 p-3 space-y-1.5">
                              <div className="flex justify-between text-xs"><span className="text-gray-500">Penerima:</span><span className="font-medium text-gray-700">{guests.filter((g) => g.phone).length} nomor</span></div>
                              <div className="flex justify-between text-xs"><span className="text-gray-500">Delay:</span><span className="font-medium text-gray-700">{blastDelay}s</span></div>
                              <div className="flex justify-between text-xs"><span className="text-gray-500">Jitter:</span><span className="font-medium text-gray-700">{blastJitter}s</span></div>
                              <div className="flex justify-between text-xs"><span className="text-gray-500">Undangan:</span><span className="font-medium text-gray-700 truncate max-w-[150px]">{selectedInvitation?.title || "-"}</span></div>
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => setBlastStep(3)} className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-xs text-gray-500 hover:bg-gray-50 transition-colors">Kembali</button>
                              <button
                                onClick={async () => {
                                  setBlastStep(5);
                                  await handleBlastViaApi();
                                }}
                                disabled={blastingViaApi}
                                className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-2 text-xs font-medium text-white hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 transition-colors shadow-sm shadow-amber-200"
                              >
                                {blastingViaApi ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5" />}
                                {blastingViaApi ? "Mengirim..." : "Kirim Blast"}
                              </button>
                            </div>
                          </div>
                        )}

                        {wablastHook.deviceStatus === "connected" && blastStep === 5 && (
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 text-xs font-medium text-blue-700">
                              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-white text-xs font-bold">5</span>
                              {wablastHook.blastProgress?.status === "done" ? "Pengiriman Selesai" : wablastHook.blastProgress?.status === "cancelled" ? "Pengiriman Dibatalkan" : "Proses Pengiriman"}
                            </div>

                            {wablastHook.blastProgress && (
                              <>
                                <div className="space-y-1">
                                  <div className="flex justify-between text-xs text-blue-600">
                                    <span>{wablastHook.blastProgress.current} / {wablastHook.blastProgress.total}</span>
                                    <span>{Math.round((wablastHook.blastProgress.current / wablastHook.blastProgress.total) * 100)}%</span>
                                  </div>
                                  <div className="h-1.5 w-full rounded-full bg-blue-100 overflow-hidden">
                                    <div
                                      className="h-full rounded-full bg-blue-500 transition-all duration-300"
                                      style={{ width: `${(wablastHook.blastProgress.current / wablastHook.blastProgress.total) * 100}%` }}
                                    />
                                  </div>
                                </div>

                                {wablastHook.blastProgress.status === "sending" && wablastHook.blastProgress.currentName && (
                                  <div className="flex items-center gap-2 rounded-lg bg-blue-50 border border-blue-100 px-3 py-2">
                                    <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-500" />
                                    <div className="text-xs">
                                      <span className="text-blue-700">Mengirim ke </span>
                                      <span className="font-medium text-blue-800">{wablastHook.blastProgress.currentName}</span>
                                      <span className="text-blue-500"> — {wablastHook.blastProgress.currentPhone}</span>
                                    </div>
                                  </div>
                                )}

                                <div className="space-y-1 max-h-40 overflow-y-auto">
                                  {wablastHook.blastProgress.sent.map((s, i) => (
                                    <div key={i} className="flex items-center gap-2 rounded-md bg-green-50 px-2 py-1 text-xs">
                                      <Check className="h-3 w-3 text-green-500 flex-shrink-0" />
                                      <span className="text-green-700 truncate">{s.name}</span>
                                      <span className="text-green-500 font-mono text-[10px]">{s.phone}</span>
                                      <span className="text-green-400 ml-auto text-[10px]">Terkirim</span>
                                    </div>
                                  ))}
                                  {wablastHook.blastProgress.errors.map((e, i) => (
                                    <div key={`err-${i}`} className="flex items-center gap-2 rounded-md bg-red-50 px-2 py-1 text-xs">
                                      <span className="text-red-500 font-bold flex-shrink-0">✗</span>
                                      <span className="text-red-700 truncate">{e.name}</span>
                                      <span className="text-red-500 font-mono text-[10px]">{e.phone}</span>
                                      <span className="text-red-400 ml-auto text-[10px] truncate max-w-[80px]" title={e.error}>{e.error}</span>
                                    </div>
                                  ))}
                                </div>

                                <div className="flex gap-2 text-xs">
                                  <span>Terkirim: <span className="font-medium text-green-600">{wablastHook.blastProgress.sent.length}</span></span>
                                  <span>Gagal: <span className="font-medium text-red-500">{wablastHook.blastProgress.errors.length}</span></span>
                                </div>

                                {wablastHook.blastProgress.status === "sending" && (
                                  <button
                                    onClick={() => wablastHook.cancelBlast()}
                                    className="w-full rounded-lg border border-red-200 px-3 py-2 text-xs text-red-500 hover:bg-red-50 transition-colors"
                                  >
                                    Batalkan
                                  </button>
                                )}

                                {wablastHook.blastProgress.status === "done" && (
                                  <>
                                    {wablastHook.blastProgress.errors.length > 0 && (
                                      <button
                                        onClick={() => {
                                          const origin = window.location.origin;
                                          const slug = selectedInvitation?.slug || "";
                                          wablastHook.blastProgress?.errors.forEach((e) => {
                                            const link = `${origin}/u/${slug}?to=${encodeURIComponent(e.name)}`;
                                            const msg = waTemplate
                                              .replace(/{nama_tamu}/g, e.name)
                                              .replace(/{link_undangan}/g, link);
                                            const cleaned = e.phone.replace(/[^0-9]/g, "");
                                            const prefix = cleaned.startsWith("0") ? "62" + cleaned.slice(1) : cleaned.startsWith("62") ? cleaned : "62" + cleaned;
                                            setTimeout(() => {
                                              window.open(`https://wa.me/${prefix}?text=${encodeURIComponent(msg)}`, "_blank");
                                            }, 1000);
                                          });
                                          toast.success(`Membuka ${wablastHook.blastProgress?.errors.length} chat WA manual`);
                                        }}
                                        className="w-full rounded-lg bg-orange-500 px-3 py-2 text-xs font-medium text-white hover:bg-orange-600 transition-colors"
                                      >
                                        Buka WA Manual ({wablastHook.blastProgress.errors.length} gagal)
                                      </button>
                                    )}
                                    <button
                                      onClick={() => { setBlastStep(0); }}
                                      className="w-full rounded-lg bg-green-500 px-3 py-2 text-xs font-medium text-white hover:bg-green-600 transition-colors"
                                    >
                                      Selesai — Kembali ke Awal
                                    </button>
                                  </>
                                )}
                                {wablastHook.blastProgress.status === "cancelled" && (
                                  <button
                                    onClick={() => { setBlastStep(0); }}
                                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs text-gray-500 hover:bg-gray-50 transition-colors"
                                  >
                                    Kembali ke Awal
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="rounded-xl border bg-white p-4 sm:p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Aksi Cepat</h3>
                <div className="space-y-2.5 sm:space-y-3">
                  <button onClick={handleBlastWa} disabled={sending || guests.length === 0}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-500 px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-medium text-white hover:bg-green-600 disabled:opacity-40 transition-all active:scale-[0.98]">
                    {sending ? (
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                    ) : <Send className="h-4 w-4" />}
                    {sending ? "Membuka WhatsApp..." : `Blast WA Manual (${guests.filter((g) => g.phone).length} tamu)`}
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
