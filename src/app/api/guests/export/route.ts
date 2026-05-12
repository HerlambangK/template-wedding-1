import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import * as XLSX from "xlsx";
import { getWaMessage, getWaUrl } from "@/lib/wa-template";
import type { Guest } from "@/lib/types";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const invitation_id = searchParams.get("invitation_id");
    const format = searchParams.get("format") || "xlsx";

    if (!invitation_id) {
      return NextResponse.json({ error: "invitation_id required" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: invitation } = await supabase
      .from("invitations")
      .select("id, slug, title")
      .eq("id", invitation_id)
      .eq("user_id", user.id)
      .single();

    if (!invitation) {
      return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
    }

    const { data: guests } = await supabase
      .from("guests")
      .select("*")
      .eq("invitation_id", invitation_id)
      .order("created_at", { ascending: false });

    if (!guests || guests.length === 0) {
      return NextResponse.json({ error: "Tidak ada data tamu" }, { status: 404 });
    }

    const origin = `${request.url.split("/api")[0]}`;

    const wsData = (guests as Guest[]).map((g) => {
      const link = `${origin}/u/${invitation.slug}?to=${encodeURIComponent(g.name)}`;
      const waMessage = g.phone ? getWaMessage({ guestName: g.name, invitationLink: link }) : "";
      const waUrl = g.phone ? getWaUrl(g.phone, waMessage) : "";
      return {
        "Nama": g.name,
        "No. HP": g.phone || "",
        "Link WhatsApp": waUrl,
        "Pesan WA": waMessage,
        "Link Undangan": link,
        "Email": g.email || "",
        "Alamat": g.address || "",
        "Kategori": g.category || "",
        "Status": g.status,
        "Catatan": g.notes || "",
        "Tanggal Dibuat": new Date(g.created_at).toLocaleDateString("id-ID"),
      };
    });

    const ws = XLSX.utils.json_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Daftar Tamu");

    ws["!cols"] = [
      { wch: 25 },
      { wch: 18 },
      { wch: 50 },
      { wch: 60 },
      { wch: 50 },
      { wch: 25 },
      { wch: 40 },
      { wch: 15 },
      { wch: 12 },
      { wch: 30 },
      { wch: 15 },
    ];

    if (format === "csv") {
      const csv = XLSX.utils.sheet_to_csv(ws);
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="daftar-tamu-${invitation.slug}.csv"`,
        },
      });
    }

    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="daftar-tamu-${invitation.slug}.xlsx"`,
      },
    });
  } catch (error) {
    console.error("Export guests error:", error);
    return NextResponse.json({ error: "Gagal export data" }, { status: 500 });
  }
}
