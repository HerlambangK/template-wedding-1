-- ============================================================
-- Undangan Nikah SaaS — Supabase Database Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Profiles (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'premium', 'business')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Invitations (each user can have multiple)
CREATE TABLE invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),

  -- Groom data
  groom_name TEXT,
  groom_full_name TEXT,
  groom_father TEXT,
  groom_mother TEXT,
  groom_child_order TEXT,
  groom_photo TEXT,
  groom_instagram TEXT,

  -- Bride data
  bride_name TEXT,
  bride_full_name TEXT,
  bride_father TEXT,
  bride_mother TEXT,
  bride_child_order TEXT,
  bride_photo TEXT,
  bride_instagram TEXT,

  -- Akad
  akad_date DATE,
  akad_time TEXT,
  akad_end_time TEXT,
  akad_venue TEXT,
  akad_address TEXT,
  akad_maps_url TEXT,

  -- Resepsi
  resepsi_date DATE,
  resepsi_time TEXT,
  resepsi_end_time TEXT,
  resepsi_venue TEXT,
  resepsi_address TEXT,
  resepsi_maps_url TEXT,
  resepsi_dress_code TEXT,

  -- Theme & config
  theme_preset TEXT DEFAULT 'gold',
  custom_theme JSONB,
  quotes JSONB DEFAULT '[{"text": "Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang.", "source": "QS. Ar-Rum: 21"}]',
  gallery JSONB DEFAULT '[]',
  gifts JSONB DEFAULT '[]',
  music_url TEXT,
  hashtag TEXT,
  footer_text TEXT,

  -- Feature toggles
  feature_music BOOLEAN DEFAULT true,
  feature_particles BOOLEAN DEFAULT true,
  feature_three_d BOOLEAN DEFAULT true,
  feature_rsvp BOOLEAN DEFAULT true,
  feature_gifts BOOLEAN DEFAULT true,
  feature_gallery BOOLEAN DEFAULT true,
  feature_countdown BOOLEAN DEFAULT true,
  feature_guest_book BOOLEAN DEFAULT true,

  -- Stats
  view_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. RSVP responses
CREATE TABLE rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id UUID NOT NULL REFERENCES invitations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  attendance TEXT DEFAULT 'hadir' CHECK (attendance IN ('hadir', 'tidak', 'mungkin')),
  guests INTEGER DEFAULT 1,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Guest book messages (separate from RSVP for public display)
CREATE TABLE guest_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id UUID NOT NULL REFERENCES invitations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  message TEXT NOT NULL,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Indexes
-- ============================================================
CREATE INDEX idx_invitations_user_id ON invitations(user_id);
CREATE INDEX idx_invitations_slug ON invitations(slug);
CREATE INDEX idx_rsvps_invitation_id ON rsvps(invitation_id);
CREATE INDEX idx_guest_messages_invitation_id ON guest_messages(invitation_id);

-- ============================================================
-- Row Level Security
-- ============================================================

-- Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Auto-create profile on signup" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Invitations
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own invitations" ON invitations FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Published invitations are public" ON invitations FOR SELECT USING (status = 'published');

-- RSVPs
ALTER TABLE rsvps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit RSVP to published invitation" ON rsvps FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM invitations WHERE id = invitation_id AND status = 'published')
);
CREATE POLICY "Invitation owners can view RSVPs" ON rsvps FOR SELECT USING (
  EXISTS (SELECT 1 FROM invitations WHERE id = invitation_id AND user_id = auth.uid())
);

-- Guest messages
ALTER TABLE guest_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can post message to published invitation" ON guest_messages FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM invitations WHERE id = invitation_id AND status = 'published')
);
CREATE POLICY "Anyone can view visible messages" ON guest_messages FOR SELECT USING (is_visible = true);
CREATE POLICY "Owners can manage messages" ON guest_messages FOR ALL USING (
  EXISTS (SELECT 1 FROM invitations WHERE id = invitation_id AND user_id = auth.uid())
);

-- ============================================================
-- Functions
-- ============================================================

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Increment view count
CREATE OR REPLACE FUNCTION increment_view_count(invitation_slug TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE invitations SET view_count = view_count + 1 WHERE slug = invitation_slug;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
