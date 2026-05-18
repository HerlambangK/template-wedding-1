-- ============================================================
-- UPDATE GIFTS — Amplop Digital Herlambang & Rela
-- Jalankan di Supabase SQL Editor
-- ============================================================
-- Cara:
-- 1. Buka Supabase Dashboard > SQL Editor > New Query
-- 2. Copy & jalankan query di bawah ini
-- 3. Pastikan slug sudah benar (cek dengan SELECT *)
-- ============================================================

-- Pastikan feature_gifts = true
UPDATE invitations
SET feature_gifts = true
WHERE slug = 'herlambang-dan-rela';

-- Masukkan data amplop digital (BCA 8950648229 a.n. Herlambang)
UPDATE invitations
SET gifts = '[
  {
    "type": "bank",
    "bankName": "BCA",
    "accountNumber": "8950648229",
    "accountHolder": "Herlambang"
  }
]'::jsonb
WHERE slug = 'herlambang-dan-rela';

-- Verifikasi hasil
SELECT slug, feature_gifts, gifts FROM invitations WHERE slug = 'herlambang-dan-rela';
