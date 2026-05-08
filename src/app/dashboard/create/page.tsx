import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import InvitationForm from "@/components/InvitationForm";

export default async function CreatePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <InvitationForm userId={user.id} />
  );
}
