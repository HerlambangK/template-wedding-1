import { createClient } from "@/lib/supabase/server";
import { ensureProfileExists } from "@/lib/supabase/profile";
import { redirect } from "next/navigation";
import DashboardClient from "./dashboard-client";
import { config } from "@/config/wedding";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const profile = await ensureProfileExists(user.id, user.email);

  let { data: invitations } = await supabase
    .from("invitations")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // Auto-create default invitation (Herlambang & Rela) if none exists
  if (!invitations || invitations.length === 0) {
    const defaultInv = {
      user_id: user.id,
      slug: "herlambang-dan-rela",
      title: "Herlambang & Rela",
      status: "published",
      groom_name: config.groom.name,
      groom_full_name: config.groom.fullName,
      groom_photo: config.groom.photo,
      bride_name: config.bride.name,
      bride_full_name: config.bride.fullName,
      bride_photo: config.bride.photo,
      akad_date: config.makanKeluarga.date,
      akad_time: config.makanKeluarga.time,
      akad_end_time: config.makanKeluarga.endTime,
      akad_venue: config.makanKeluarga.venue,
      akad_address: config.makanKeluarga.address,
      akad_maps_url: config.makanKeluarga.mapsUrl,
      resepsi_date: config.makanKeluarga.date,
      resepsi_time: config.makanKeluarga.time,
      resepsi_venue: config.makanKeluarga.venue,
      resepsi_address: config.makanKeluarga.address,
      resepsi_maps_url: config.makanKeluarga.mapsUrl,
      theme_preset: "gold",
      feature_music: config.features.music,
      feature_particles: config.features.particles,
      feature_three_d: config.features.threeD,
      feature_rsvp: config.features.rsvp,
      feature_gifts: config.features.gifts,
      feature_gallery: config.features.gallery,
      feature_countdown: config.features.countdown,
      feature_guest_book: config.features.guestMessages,
    };

    const { data: newInv } = await supabase
      .from("invitations")
      .insert(defaultInv)
      .select()
      .single();

    invitations = newInv ? [newInv] : [];
  }

  const hasPassword = user.user_metadata?.has_password === true;

  return (
    <DashboardClient
      invitations={invitations || []}
      profile={profile}
      userEmail={user.email || ""}
      hasPassword={hasPassword}
    />
  );
}
