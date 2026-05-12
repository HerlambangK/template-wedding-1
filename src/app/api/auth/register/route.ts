import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const { email, password, fullName } = await request.json();

    if (!email || !password || password.length < 6) {
      return NextResponse.json({ error: "Email dan password (min 6 karakter) wajib diisi" }, { status: 400 });
    }

    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceKey) {
      return NextResponse.json({
        error: "SUPABASE_SERVICE_ROLE_KEY belum diisi. Tambahkan ke .env file.",
        hint: "Cari Service Role Key di Supabase Dashboard → Settings → API → service_role key"
      }, { status: 500 });
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      serviceKey,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName || email.split("@")[0] },
    });

    if (error) {
      console.error("Admin createUser error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ user: data.user });
  } catch (err) {
    console.error("Register API error:", err);
    return NextResponse.json({ error: "Gagal mendaftarkan akun" }, { status: 500 });
  }
}
