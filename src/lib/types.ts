export interface Invitation {
  id: string;
  user_id: string;
  slug: string;
  title: string;
  status: "draft" | "published" | "archived";

  groom_name: string | null;
  groom_full_name: string | null;
  groom_father: string | null;
  groom_mother: string | null;
  groom_child_order: string | null;
  groom_photo: string | null;
  groom_instagram: string | null;

  bride_name: string | null;
  bride_full_name: string | null;
  bride_father: string | null;
  bride_mother: string | null;
  bride_child_order: string | null;
  bride_photo: string | null;
  bride_instagram: string | null;

  akad_date: string | null;
  akad_time: string | null;
  akad_end_time: string | null;
  akad_venue: string | null;
  akad_address: string | null;
  akad_maps_url: string | null;

  resepsi_date: string | null;
  resepsi_time: string | null;
  resepsi_end_time: string | null;
  resepsi_venue: string | null;
  resepsi_address: string | null;
  resepsi_maps_url: string | null;
  resepsi_dress_code: string | null;

  theme_preset: string;
  custom_theme: Record<string, string> | null;
  quotes: { text: string; source: string }[];
  gallery: { src: string; alt: string }[];
  gifts: GiftItem[];
  music_url: string | null;
  hashtag: string | null;
  footer_text: string | null;

  feature_music: boolean;
  feature_particles: boolean;
  feature_three_d: boolean;
  feature_rsvp: boolean;
  feature_gifts: boolean;
  feature_gallery: boolean;
  feature_countdown: boolean;
  feature_guest_book: boolean;

  view_count: number;
  created_at: string;
  updated_at: string;
}

export interface GiftItem {
  type: "bank" | "address" | "qris";
  bankName?: string;
  accountNumber?: string;
  accountHolder?: string;
  label?: string;
  address?: string;
  phone?: string;
  qrisUrl?: string;
}

export interface RSVP {
  id: string;
  invitation_id: string;
  name: string;
  attendance: "hadir" | "tidak" | "mungkin";
  guests: number;
  message: string | null;
  created_at: string;
}

export interface GuestMessage {
  id: string;
  invitation_id: string;
  name: string;
  message: string;
  is_visible: boolean;
  created_at: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  plan: "free" | "premium" | "business";
  created_at: string;
}
