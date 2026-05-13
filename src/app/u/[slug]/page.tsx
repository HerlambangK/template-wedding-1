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
    .select("title, groom_name, bride_name, akad_date, resepsi_date, gallery, groom_photo, bride_photo, akad_venue")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (!inv) return { title: "Undangan Tidak Ditemukan" };

  const groom = inv.groom_name || "";
  const bride = inv.bride_name || "";
  const title = `Undangan Pernikahan ${groom} & ${bride}`;
  const date = inv.akad_date || inv.resepsi_date || "";
  const formattedDate = date
    ? new Date(date).toLocaleDateString("id-ID", { dateStyle: "long" })
    : "";
  const description = `Anda diundang ke pernikahan ${groom} & ${bride}. ${formattedDate}${
    inv.akad_venue ? ` — ${inv.akad_venue}` : ""
  }`;

  const ogImage =
    inv.gallery && Array.isArray(inv.gallery) && inv.gallery.length > 0
      ? inv.gallery[0].src
      : inv.groom_photo || inv.bride_photo || "/images/gallery/1.jpg";

  return {
    title,
    description,
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "any" },
        { url: "/icon.svg", type: "image/svg+xml" },
      ],
      apple: [{ url: inv.groom_photo || "/images/groom.jpg" }],
    },
    openGraph: {
      type: "website",
      locale: "id_ID",
      siteName: "Undangan Pernikahan",
      title,
      description,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${groom} & ${bride}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
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
