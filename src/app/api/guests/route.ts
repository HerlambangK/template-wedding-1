import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const invitation_id = searchParams.get("invitation_id");

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
      .select("id")
      .eq("id", invitation_id)
      .eq("user_id", user.id)
      .single();

    if (!invitation) {
      return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
    }

    const { data: guests, error } = await supabase
      .from("guests")
      .select("*")
      .eq("invitation_id", invitation_id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: guests || [] });
  } catch (error) {
    console.error("Get guests error:", error);
    return NextResponse.json({ error: "Failed to get guests" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { invitation_id, name, phone, email, address, category, notes } = body;

    if (!invitation_id || !name) {
      return NextResponse.json({ error: "invitation_id and name required" }, { status: 400 });
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

    const { data: guest, error } = await supabase
      .from("guests")
      .insert({
        invitation_id,
        name,
        phone: phone || null,
        email: email || null,
        address: address || null,
        category: category || null,
        status: "pending",
        notes: notes || null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: guest });
  } catch (error) {
    console.error("Create guest error:", error);
    return NextResponse.json({ error: "Failed to create guest" }, { status: 500 });
  }
}
