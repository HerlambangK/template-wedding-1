import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, attendance, guests, message, invitation_id, guestName } = body;

    if (!name) {
      return NextResponse.json({ error: "Nama wajib diisi" }, { status: 400 });
    }

    if (!invitation_id) {
      return NextResponse.json({ error: "Anda belum jadi undangan" }, { status: 400 });
    }

    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const supabase = await createClient();

      // Validate guestName against guests table
      if (guestName?.trim()) {
        const { data: matchedGuest } = await supabase
          .from("guests")
          .select("id, name")
          .eq("invitation_id", invitation_id)
          .ilike("name", guestName.trim())
          .maybeSingle();

        if (!matchedGuest) {
          return NextResponse.json(
            { error: "Anda bukan undangan. Hanya tamu yang terdaftar yang dapat mengirim konfirmasi." },
            { status: 403 }
          );
        }
      }

      const { error } = await supabase.from("rsvps").insert({
        invitation_id,
        name,
        attendance: attendance || "hadir",
        guests: parseInt(guests) || 1,
        message: message || null,
      });

      if (error) {
        console.error("Supabase RSVP error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Anda belum jadi undangan" }, { status: 400 });
  } catch (error) {
    console.error("RSVP error:", error);
    return NextResponse.json({ error: "Gagal menyimpan" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const invitation_id = url.searchParams.get("invitation_id");

    if (!invitation_id || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return NextResponse.json({ total: 0, data: [] });
    }

    const supabase = await createClient();
    const { data } = await supabase
      .from("rsvps")
      .select("*")
      .eq("invitation_id", invitation_id);

    const rows = (data || []) as Array<{ attendance: string }>;
    return NextResponse.json({
      total: rows.length,
      hadir: rows.filter((r) => r.attendance === "hadir").length,
      tidak: rows.filter((r) => r.attendance === "tidak").length,
      data: data || [],
    });
  } catch {
    return NextResponse.json({ total: 0, data: [] });
  }
}
