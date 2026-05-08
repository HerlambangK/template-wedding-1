"use client";

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
} from "lucide-react";

interface Props {
  invitations: Invitation[];
  profile: Profile | null;
  userEmail: string;
}

export default function DashboardClient({ invitations, profile, userEmail }: Props) {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin hapus undangan ini?")) return;
    await supabase.from("invitations").delete().eq("id", id);
    router.refresh();
  };

  const handlePublish = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "published" ? "draft" : "published";
    await supabase.from("invitations").update({ status: newStatus }).eq("id", id);
    router.refresh();
  };

  const freeLimit = 1;
  const canCreate = profile?.plan !== "free" || invitations.length < freeLimit;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Heart className="h-6 w-6 text-[#D4A843]" fill="#D4A843" />
            <span className="font-[family-name:var(--font-playfair)] text-xl italic text-gray-900">
              Undangan Nikah
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">{userEmail}</span>
            {profile?.plan === "free" && (
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-500">
                Free
              </span>
            )}
            {profile?.plan === "premium" && (
              <span className="flex items-center gap-1 rounded-full bg-[#D4A843]/10 px-3 py-1 text-xs text-[#B8860B]">
                <Crown className="h-3 w-3" /> Premium
              </span>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        {/* Title + Create */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Undangan Saya
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {invitations.length} undangan
              {profile?.plan === "free" && ` · ${freeLimit - invitations.length} tersisa (Free plan)`}
            </p>
          </div>
          {canCreate ? (
            <button
              onClick={() => router.push("/dashboard/create")}
              className="flex items-center gap-2 rounded-full bg-[#D4A843] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#B8860B] transition-colors"
            >
              <Plus className="h-4 w-4" />
              Buat Undangan
            </button>
          ) : (
            <button
              className="flex items-center gap-2 rounded-full bg-gray-100 px-6 py-2.5 text-sm text-gray-400 cursor-not-allowed"
              title="Upgrade ke Premium untuk buat undangan lebih banyak"
            >
              <Plus className="h-4 w-4" />
              Upgrade ke Premium
            </button>
          )}
        </div>

        {/* Empty state */}
        {invitations.length === 0 && (
          <div className="rounded-2xl border-2 border-dashed border-gray-200 py-20 text-center">
            <Heart className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-4 text-lg font-medium text-gray-600">
              Belum ada undangan
            </h3>
            <p className="mt-2 text-sm text-gray-400">
              Buat undangan pertamamu dalam 5 menit!
            </p>
            <button
              onClick={() => router.push("/dashboard/create")}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#D4A843] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#B8860B]"
            >
              <Plus className="h-4 w-4" />
              Buat Sekarang
            </button>
          </div>
        )}

        {/* Invitation cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {invitations.map((inv) => (
            <div
              key={inv.id}
              className="group rounded-xl border bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-[family-name:var(--font-playfair)] text-lg italic text-gray-900 truncate">
                    {inv.title || "Untitled"}
                  </h3>
                  <p className="mt-1 text-xs text-gray-400">
                    /{inv.slug}
                  </p>
                </div>
                <span
                  className={`ml-2 flex-shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    inv.status === "published"
                      ? "bg-green-50 text-green-600"
                      : inv.status === "archived"
                      ? "bg-gray-100 text-gray-400"
                      : "bg-yellow-50 text-yellow-600"
                  }`}
                >
                  {inv.status === "published" ? "Live" : inv.status === "archived" ? "Archived" : "Draft"}
                </span>
              </div>

              <div className="mt-4 flex items-center gap-4 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <Eye className="h-3.5 w-3.5" />
                  {inv.view_count} views
                </span>
                <span>
                  {inv.groom_name && inv.bride_name
                    ? `${inv.groom_name} & ${inv.bride_name}`
                    : "Belum diisi"}
                </span>
              </div>

              {/* Actions */}
              <div className="mt-5 flex items-center gap-2 border-t pt-4">
                <button
                  onClick={() => router.push(`/dashboard/edit/${inv.id}`)}
                  className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-50"
                >
                  <Edit className="h-3.5 w-3.5" /> Edit
                </button>
                <button
                  onClick={() => router.push(`/dashboard/stats/${inv.id}`)}
                  className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-50"
                >
                  <BarChart3 className="h-3.5 w-3.5" /> Stats
                </button>
                {inv.status === "published" && (
                  <a
                    href={`/u/${inv.slug}`}
                    target="_blank"
                    className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs text-[#B8860B] hover:bg-[#D4A843]/5"
                  >
                    <ExternalLink className="h-3.5 w-3.5" /> Lihat
                  </a>
                )}
                <div className="flex-1" />
                <button
                  onClick={() => handlePublish(inv.id, inv.status)}
                  className={`rounded-lg px-3 py-1.5 text-xs ${
                    inv.status === "published"
                      ? "text-yellow-600 hover:bg-yellow-50"
                      : "text-green-600 hover:bg-green-50"
                  }`}
                >
                  {inv.status === "published" ? "Unpublish" : "Publish"}
                </button>
                <button
                  onClick={() => handleDelete(inv.id)}
                  className="rounded-lg px-2 py-1.5 text-xs text-red-400 hover:bg-red-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
