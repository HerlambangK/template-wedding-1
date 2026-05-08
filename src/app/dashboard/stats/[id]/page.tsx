import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import StatsClient from "./stats-client";

export default async function StatsPage({ params }: { params: Promise<{ id: string }> }) {
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

  const { data: rsvps } = await supabase
    .from("rsvps")
    .select("*")
    .eq("invitation_id", id)
    .order("created_at", { ascending: false });

  const { data: messages } = await supabase
    .from("guest_messages")
    .select("*")
    .eq("invitation_id", id)
    .order("created_at", { ascending: false });

  return (
    <StatsClient
      invitation={invitation}
      rsvps={rsvps || []}
      messages={messages || []}
    />
  );
}
