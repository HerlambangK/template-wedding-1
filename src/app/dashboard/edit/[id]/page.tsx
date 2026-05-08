import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import InvitationForm from "@/components/InvitationForm";

export default async function EditPage({ params }: { params: Promise<{ id: string }> }) {
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

  return (
    <InvitationForm userId={user.id} existingData={invitation} />
  );
}
