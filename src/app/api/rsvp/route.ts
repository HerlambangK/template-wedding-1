import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import fs from "fs";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "data", "rsvp.json");

function ensureDataDir() {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, "[]");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, attendance, guests, message, invitation_id } = body;

    if (!name) {
      return NextResponse.json({ error: "Nama wajib diisi" }, { status: 400 });
    }

    // If invitation_id provided, save to Supabase
    if (invitation_id && process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const supabase = await createClient();
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

    // Fallback: file-based storage
    ensureDataDir();
    const rsvps = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
    rsvps.push({
      id: Date.now(),
      name,
      attendance: attendance || "hadir",
      guests: parseInt(guests) || 1,
      message: message || "",
      createdAt: new Date().toISOString(),
    });
    fs.writeFileSync(DATA_FILE, JSON.stringify(rsvps, null, 2));
    return NextResponse.json({ success: true, total: rsvps.length });
  } catch (error) {
    console.error("RSVP error:", error);
    return NextResponse.json({ error: "Gagal menyimpan" }, { status: 500 });
  }
}

export async function GET() {
  try {
    ensureDataDir();
    const rsvps = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
    return NextResponse.json({
      total: rsvps.length,
      hadir: rsvps.filter((r: { attendance: string }) => r.attendance === "hadir").length,
      tidak: rsvps.filter((r: { attendance: string }) => r.attendance === "tidak").length,
      data: rsvps,
    });
  } catch {
    return NextResponse.json({ total: 0, data: [] });
  }
}
