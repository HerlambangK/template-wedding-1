-- ============================================================
-- SEED DATA — Undangan Default Herlambang & Rela
-- ============================================================
-- CARA PAKAI:
-- 1. Login dulu ke aplikasi (biar profile ter-create otomatis)
-- 2. Jalankan query ini untuk tahu user_id kamu:
--    SELECT id, email FROM auth.users WHERE email = 'email_kamu@example.com';
-- 3. Ganti 'USER_ID_HERE' dengan id yang didapat
-- 4. Jalankan query di bawah
-- ============================================================

-- Insert undangan default
INSERT INTO invitations (
  user_id,
  slug,
  title,
  status,
  groom_name,
  groom_full_name,
  groom_photo,
  bride_name,
  bride_full_name,
  bride_photo,
  akad_date,
  akad_time,
  akad_end_time,
  akad_venue,
  akad_address,
  akad_maps_url,
  resepsi_date,
  resepsi_time,
  resepsi_venue,
  resepsi_address,
  resepsi_maps_url,
  theme_preset,
  feature_music,
  feature_particles,
  feature_three_d,
  feature_rsvp,
  feature_gifts,
  feature_gallery,
  feature_countdown,
  feature_guest_book
)
SELECT
  id,
  'herlambang-dan-rela',
  'Herlambang & Rela',
  'published',
  'Herlambang',
  'Herlambang Kuswicaksonojati',
  NULL,
  'Rela',
  'Rela Hastuti',
  NULL,
  '2026-05-29',
  '09:30',
  '10:30',
  'NAWASENA GARDEN BALLROOM',
  'Jl. H.A. Salim No. 90, Pandean, Manguharjo, Kota Madiun, Jawa Timur',
  'https://maps.app.goo.gl/SCFZSetJYAHDEHa67',
  '2026-05-29',
  '09:30',
  'NAWASENA GARDEN BALLROOM',
  'Jl. H.A. Salim No. 90, Pandean, Manguharjo, Kota Madiun, Jawa Timur',
  'https://maps.app.goo.gl/SCFZSetJYAHDEHa67',
  'gold',
  true, true, true, true, true, false, true, true
FROM profiles
WHERE email = (SELECT email FROM profiles LIMIT 1)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- Cek hasil
-- ============================================================
-- SELECT * FROM invitations WHERE slug = 'herlambang-dan-rela';
