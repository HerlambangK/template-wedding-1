import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import SendClient from "./send-client";
import type { Invitation, Guest } from "@/lib/types";

export default async function SendPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: invitations } = await supabase
    .from("invitations")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (!invitations || invitations.length === 0) {
    redirect("/dashboard");
  }

  const firstInvitation = invitations[0];

  const { data: guests } = await supabase
    .from("guests")
    .select("*")
    .eq("invitation_id", firstInvitation.id)
    .order("created_at", { ascending: false });

  return (
    <SendClient
      invitations={invitations as unknown as Invitation[]}
      allGuests={(guests || []) as unknown as Guest[]}
      defaultInvitationId={firstInvitation.id}
    />
  );
}
