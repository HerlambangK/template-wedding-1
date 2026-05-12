import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import * as XLSX from "xlsx";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const invitation_id = formData.get("invitation_id") as string;

    if (!file || !invitation_id) {
      return NextResponse.json({ error: "File and invitation_id required" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: invitation } = await supabase
      .from("invitations")
      .select("id")
      .eq("id", invitation_id)
      .eq("user_id", user.id)
      .single();

    if (!invitation) {
      return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet) as Record<string, unknown>[];

    const guests: Record<string, unknown>[] = [];
    const errors: string[] = [];

    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i];
      const name = String(row["Nama"] || row["name"] || row["Name"] || "").trim();
      
      if (!name) {
        errors.push(`Baris ${i + 2}: Nama tidak boleh kosong`);
        continue;
      }

      guests.push({
        invitation_id,
        name,
        phone: String(row["No. HP"] || row["Phone"] || row["phone"] || row["Telepon"] || "").trim() || null,
        email: String(row["Email"] || row["email"] || "").trim() || null,
        address: String(row["Alamat"] || row["Address"] || row["address"] || "").trim() || null,
        category: String(row["Kategori"] || row["Category"] || row["category"] || row["Kelompok"] || "").trim() || null,
        status: "pending",
        notes: String(row["Catatan"] || row["Notes"] || row["notes"] || "").trim() || null,
      });
    }

    if (guests.length === 0) {
      return NextResponse.json({ error: "Tidak ada data tamu yang valid", errors }, { status: 400 });
    }

    const { error: insertError } = await supabase.from("guests").insert(guests);

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      imported: guests.length,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error("Import guests error:", error);
    return NextResponse.json({ error: "Gagal import data" }, { status: 500 });
  }
}
