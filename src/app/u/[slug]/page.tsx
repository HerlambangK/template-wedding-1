import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import PublicInvitation from "./invitation-client";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: inv } = await supabase
    .from("invitations")
    .select("title, groom_name, bride_name, akad_date")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (!inv) return { title: "Undangan Tidak Ditemukan" };

  const title = `Undangan Pernikahan ${inv.groom_name || ""} & ${inv.bride_name || ""}`;
  const description = `Anda diundang ke pernikahan ${inv.groom_name} & ${inv.bride_name}. ${
    inv.akad_date ? new Date(inv.akad_date).toLocaleDateString("id-ID", { dateStyle: "long" }) : ""
  }`;

  return {
    title,
    description,
    openGraph: { title, description },
  };
}

export default async function PublicPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: invitation } = await supabase
    .from("invitations")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (!invitation) notFound();

  // Increment view count (fire and forget)
  supabase.rpc("increment_view_count", { invitation_slug: slug }).then();

  // Fetch guest messages
  const { data: messages } = await supabase
    .from("guest_messages")
    .select("*")
    .eq("invitation_id", invitation.id)
    .eq("is_visible", true)
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <PublicInvitation
      invitation={invitation}
      messages={messages || []}
    />
  );
}
