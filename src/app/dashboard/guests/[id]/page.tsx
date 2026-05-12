import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import GuestsClient from "./guests-client";
import type { Guest, Invitation } from "@/lib/types";

export default async function GuestsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) redirect("/login");

  const { data: invitation } = await supabase
    .from("invitations")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!invitation) notFound();

  const { data: guests } = await supabase
    .from("guests")
    .select("*")
    .eq("invitation_id", id)
    .order("created_at", { ascending: false });

  return (
    <GuestsClient
      invitation={invitation as unknown as Invitation}
      guests={(guests || []) as unknown as Guest[]}
    />
  );
}
