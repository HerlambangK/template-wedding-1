import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const { invitation_id, name, message, guestName } = await request.json();

    if (!invitation_id) {
      return NextResponse.json({ error: "Anda belum jadi undangan" }, { status: 400 });
    }
    if (!message?.trim()) {
      return NextResponse.json({ error: "Pesan tidak boleh kosong" }, { status: 400 });
    }

    const submitName = name?.trim() || "Anonim";
    const supabase = await createClient();

    // If guestName is provided from URL ?to=, validate it exists in guests table
    if (guestName?.trim()) {
      const { data: matchedGuest } = await supabase
        .from("guests")
        .select("id, name")
        .eq("invitation_id", invitation_id)
        .ilike("name", guestName.trim())
        .maybeSingle();

      if (!matchedGuest) {
        return NextResponse.json(
          { error: "Anda bukan undangan. Hanya tamu yang terdaftar dapat mengirim pesan." },
          { status: 403 }
        );
      }
    }

    // Insert into guest_messages
    const { data, error } = await supabase
      .from("guest_messages")
      .insert({
        invitation_id,
        name: submitName,
        message: message.trim(),
      })
      .select()
      .single();

    if (error) {
      console.error("Insert guest message error:", error);
      return NextResponse.json({ error: "Gagal mengirim pesan" }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (err) {
    console.error("Guest message API error:", err);
    return NextResponse.json({ error: "Gagal memproses pesan" }, { status: 500 });
  }
}
