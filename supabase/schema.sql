-- ============================================================
-- UNDANGAN NIKAH SAAS — Supabase Database Schema (LATEST)
-- Jalankan ini di Supabase SQL Editor untuk setup database lengkap
--
-- TERMASUK PERBAIKAN:
-- 1. Auto-create profile ketika user login (trigger)
-- 2. Tabel guests untuk manajemen daftar tamu
-- 3. Semua index dan RLS policies
-- ============================================================

-- ============================================================
-- 1. Profiles (extends auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'premium', 'business')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 2. Invitations (each user can have multiple)
-- ============================================================
CREATE TABLE IF NOT EXISTS invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),

  groom_name TEXT,
  groom_full_name TEXT,
  groom_father TEXT,
  groom_mother TEXT,
  groom_child_order TEXT,
  groom_photo TEXT,
  groom_instagram TEXT,

  bride_name TEXT,
  bride_full_name TEXT,
  bride_father TEXT,
  bride_mother TEXT,
  bride_child_order TEXT,
  bride_photo TEXT,
  bride_instagram TEXT,

  akad_date DATE,
  akad_time TEXT,
  akad_end_time TEXT,
  akad_venue TEXT,
  akad_address TEXT,
  akad_maps_url TEXT,

  resepsi_date DATE,
  resepsi_time TEXT,
  resepsi_end_time TEXT,
  resepsi_venue TEXT,
  resepsi_address TEXT,
  resepsi_maps_url TEXT,
  resepsi_dress_code TEXT,

  theme_preset TEXT DEFAULT 'gold',
  custom_theme JSONB,
  quotes JSONB DEFAULT '[{"arabic": "وَمِنْ اٰيٰتِهٖٓ اَنْ خَلَقَ لَكُمْ مِّنْ اَنْفُسِكُمْ اَزْوَاجًا لِّتَسْكُنُوْٓا اِلَيْهَا وَجَعَلَ بَيْنَكُمْ مَّوَدَّةً وَّرَحْمَةً ۗاِنَّ فِيْ ذٰلِكَ لَاٰيٰتٍ لِّقَوْمٍ يَّتَفَكَّرُوْنَ", "text": "Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang.", "source": "QS. Ar-Rum: 21"}]',
  gallery JSONB DEFAULT '[]',
  gifts JSONB DEFAULT '[]',
  music_url TEXT,
  hashtag TEXT,
  footer_text TEXT,

  feature_music BOOLEAN DEFAULT true,
  feature_particles BOOLEAN DEFAULT true,
  feature_three_d BOOLEAN DEFAULT true,
  feature_rsvp BOOLEAN DEFAULT true,
  feature_gifts BOOLEAN DEFAULT true,
  feature_gallery BOOLEAN DEFAULT true,
  feature_countdown BOOLEAN DEFAULT true,
  feature_guest_book BOOLEAN DEFAULT true,

  view_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 3. RSVP responses
-- ============================================================
CREATE TABLE IF NOT EXISTS rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id UUID NOT NULL REFERENCES invitations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  attendance TEXT DEFAULT 'hadir' CHECK (attendance IN ('hadir', 'tidak', 'mungkin')),
  guests INTEGER DEFAULT 1,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 4. Guest book messages
-- ============================================================
CREATE TABLE IF NOT EXISTS guest_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id UUID NOT NULL REFERENCES invitations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  message TEXT NOT NULL,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 5. Guest List (for bulk invitation management) — BARU!
-- ============================================================
CREATE TABLE IF NOT EXISTS guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id UUID NOT NULL REFERENCES invitations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  category TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'invited', 'confirmed', 'declined')),
  notes TEXT,
  rsvp_id UUID REFERENCES rsvps(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_invitations_user_id ON invitations(user_id);
CREATE INDEX IF NOT EXISTS idx_invitations_slug ON invitations(slug);
CREATE INDEX IF NOT EXISTS idx_rsvps_invitation_id ON rsvps(invitation_id);
CREATE INDEX IF NOT EXISTS idx_guest_messages_invitation_id ON guest_messages(invitation_id);
CREATE INDEX IF NOT EXISTS idx_guests_invitation_id ON guests(invitation_id);
CREATE INDEX IF NOT EXISTS idx_guests_name ON guests(name);
CREATE INDEX IF NOT EXISTS idx_guests_status ON guests(status);
CREATE INDEX IF NOT EXISTS idx_guests_category ON guests(category);

-- ============================================================
-- Row Level Security
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Auto-create profile on signup" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own invitations" ON invitations FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Published invitations are public" ON invitations FOR SELECT USING (status = 'published');

ALTER TABLE rsvps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit RSVP to published invitation" ON rsvps FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM invitations WHERE id = invitation_id AND status = 'published')
);
CREATE POLICY "Invitation owners can view RSVPs" ON rsvps FOR SELECT USING (
  EXISTS (SELECT 1 FROM invitations WHERE id = invitation_id AND user_id = auth.uid())
);

ALTER TABLE guest_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can post message to published invitation" ON guest_messages FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM invitations WHERE id = invitation_id AND status = 'published')
);
CREATE POLICY "Anyone can view visible messages" ON guest_messages FOR SELECT USING (is_visible = true);
CREATE POLICY "Owners can manage messages" ON guest_messages FOR ALL USING (
  EXISTS (SELECT 1 FROM invitations WHERE id = invitation_id AND user_id = auth.uid())
);

ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own guests" ON guests FOR ALL USING (
  EXISTS (SELECT 1 FROM invitations WHERE id = invitation_id AND user_id = auth.uid())
);
CREATE POLICY "Anyone can view guests for published invitations" ON guests FOR SELECT USING (
  EXISTS (SELECT 1 FROM invitations WHERE id = invitation_id AND status = 'published')
);

-- ============================================================
-- Functions & Triggers
-- ============================================================

-- Auto-create profile on signup
-- DIBUNGKUS EXCEPTION supaya error insert profile TIDAK menggagalkan pembuatan user
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, avatar_url, plan, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url',
    'free',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'handle_new_user gagal untuk user %: %', NEW.id, SQLERRM;
  RETURN NEW;  -- tetap return NEW biar user tetap terdaftar
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Increment view count
CREATE OR REPLACE FUNCTION increment_view_count(invitation_slug TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE invitations SET view_count = view_count + 1 WHERE slug = invitation_slug;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- CARA MENGGUNAKAN:
--
-- 1. Buka Supabase Dashboard > SQL Editor
-- 2. Klik "New Query"
-- 3. Copy SEMUA isi file ini
-- 4. Klik "Run"
--
-- Atau jika sudah ada tabel lama, jalankan ini terpisah:
-- - DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
-- - Lalu buat ulang function dan trigger di atas
--
-- ATAU untuk user yang SUDAH login SEBELUM trigger dibuat:
-- Jalankan ini untuk insert profile secara manual:
--
-- INSERT INTO profiles (id, email, full_name, plan, created_at, updated_at)
-- SELECT 
--   id,
--   email,
--   COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', split_part(email, '@', 1)),
--   'free',
--   NOW(),
--   NOW()
-- FROM auth.users
-- ON CONFLICT (id) DO NOTHING;
-- ============================================================
