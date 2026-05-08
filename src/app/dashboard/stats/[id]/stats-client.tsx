"use client";

import { useRouter } from "next/navigation";
import type { Invitation, RSVP, GuestMessage } from "@/lib/types";
import {
  ArrowLeft,
  Eye,
  Users,
  UserCheck,
  UserX,
  HelpCircle,
  MessageCircle,
  Download,
  ExternalLink,
} from "lucide-react";

interface Props {
  invitation: Invitation;
  rsvps: RSVP[];
  messages: GuestMessage[];
}

export default function StatsClient({ invitation, rsvps, messages }: Props) {
  const router = useRouter();

  const hadir = rsvps.filter((r) => r.attendance === "hadir");
  const tidak = rsvps.filter((r) => r.attendance === "tidak");
  const mungkin = rsvps.filter((r) => r.attendance === "mungkin");
  const totalGuests = hadir.reduce((sum, r) => sum + r.guests, 0);

  const exportCSV = () => {
    const headers = "Nama,Kehadiran,Jumlah Tamu,Ucapan,Tanggal\n";
    const rows = rsvps
      .map((r) => `"${r.name}","${r.attendance}",${r.guests},"${r.message || ""}","${new Date(r.created_at).toLocaleString("id-ID")}"`)
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rsvp-${invitation.slug}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-4 w-4" /> Dashboard
          </button>
          <div className="flex items-center gap-3">
            {invitation.status === "published" && (
              <a
                href={`/u/${invitation.slug}`}
                target="_blank"
                className="flex items-center gap-1 text-sm text-[#B8860B] hover:underline"
              >
                <ExternalLink className="h-4 w-4" /> Lihat Undangan
              </a>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        <h1 className="text-2xl font-semibold text-gray-900">
          📊 {invitation.title || "Statistik"}
        </h1>
        <p className="mt-1 text-sm text-gray-400">/{invitation.slug}</p>

        {/* Stats cards */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-xl border bg-white p-5">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Eye className="h-4 w-4" /> Views
            </div>
            <p className="mt-2 text-3xl font-semibold text-gray-900">{invitation.view_count}</p>
          </div>
          <div className="rounded-xl border bg-white p-5">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Users className="h-4 w-4" /> Total RSVP
            </div>
            <p className="mt-2 text-3xl font-semibold text-gray-900">{rsvps.length}</p>
          </div>
          <div className="rounded-xl border bg-white p-5">
            <div className="flex items-center gap-2 text-sm text-green-500">
              <UserCheck className="h-4 w-4" /> Hadir
            </div>
            <p className="mt-2 text-3xl font-semibold text-green-600">{hadir.length}</p>
            <p className="text-xs text-gray-400 mt-1">{totalGuests} tamu</p>
          </div>
          <div className="rounded-xl border bg-white p-5">
            <div className="flex items-center gap-2 text-sm text-red-400">
              <UserX className="h-4 w-4" /> Tidak Hadir
            </div>
            <p className="mt-2 text-3xl font-semibold text-red-500">{tidak.length}</p>
          </div>
          <div className="rounded-xl border bg-white p-5">
            <div className="flex items-center gap-2 text-sm text-yellow-500">
              <HelpCircle className="h-4 w-4" /> Ragu
            </div>
            <p className="mt-2 text-3xl font-semibold text-yellow-600">{mungkin.length}</p>
          </div>
        </div>

        {/* RSVP Table */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Daftar RSVP ({rsvps.length})
            </h2>
            {rsvps.length > 0 && (
              <button
                onClick={exportCSV}
                className="flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-50"
              >
                <Download className="h-3.5 w-3.5" /> Export CSV
              </button>
            )}
          </div>

          {rsvps.length === 0 ? (
            <div className="rounded-xl border bg-white py-12 text-center">
              <Users className="mx-auto h-10 w-10 text-gray-300" />
              <p className="mt-3 text-sm text-gray-400">Belum ada RSVP</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border bg-white">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs uppercase text-gray-400">
                  <tr>
                    <th className="px-4 py-3 text-left">Nama</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-center">Tamu</th>
                    <th className="px-4 py-3 text-left">Ucapan</th>
                    <th className="px-4 py-3 text-right">Tanggal</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {rsvps.map((rsvp) => (
                    <tr key={rsvp.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-700">{rsvp.name}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs ${
                          rsvp.attendance === "hadir" ? "bg-green-50 text-green-600"
                          : rsvp.attendance === "tidak" ? "bg-red-50 text-red-500"
                          : "bg-yellow-50 text-yellow-600"
                        }`}>
                          {rsvp.attendance}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-gray-500">{rsvp.guests}</td>
                      <td className="px-4 py-3 text-gray-400 max-w-xs truncate">{rsvp.message || "-"}</td>
                      <td className="px-4 py-3 text-right text-gray-400">
                        {new Date(rsvp.created_at).toLocaleDateString("id-ID")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Guest Messages */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            <MessageCircle className="inline h-5 w-5 mr-1" /> Ucapan Tamu ({messages.length})
          </h2>
          <div className="space-y-3">
            {messages.map((msg) => (
              <div key={msg.id} className="rounded-lg border bg-white p-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-gray-700">{msg.name}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(msg.created_at).toLocaleDateString("id-ID")}
                  </p>
                </div>
                <p className="mt-1 text-sm text-gray-500">{msg.message}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
