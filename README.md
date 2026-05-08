# 💌 Undangan Nikah — Premium Wedding Invitation

Template undangan pernikahan digital yang elegan, customizable, dan modern dengan efek 3D.

**Tech Stack:** Next.js 16 · TypeScript · Tailwind CSS · Framer Motion · Three.js · React Three Fiber

## ✨ Fitur

- 🎭 **Cover animasi** — nama tamu dari URL `?to=Nama`
- 🕌 **Nuansa Islami** — Bismillah, ayat Al-Quran, salam
- 👫 **Profil mempelai** — foto, nama orang tua, Instagram
- 📅 **Akad & Resepsi** — tanggal, waktu, lokasi + Google Maps
- ⏰ **Countdown live** — hari/jam/menit/detik
- 🖼️ **Gallery** — masonry grid + lightbox viewer
- 💳 **Amplop digital** — rekening bank + tombol copy
- 📝 **RSVP** — konfirmasi hadir + ucapan doa (tersimpan di server)
- 🎵 **Background music** — auto-play + toggle button
- 🌟 **3D Elements** — floating rings, hearts, particles (Three.js)
- 🎨 **8 Theme presets** — ganti warna 1 baris kode
- ⚡ **Feature toggles** — on/off setiap section
- 📱 **100% Responsive** — mobile-first design

## 🚀 Quick Start

```bash
# 1. Clone
git clone https://github.com/gorillaworkout/undangan-nikah.git
cd undangan-nikah

# 2. Install
npm install

# 3. Run
npm run dev

# 4. Buka
# http://localhost:3000?to=Nama%20Tamu
```

## 📝 Cara Customize

**Semua customization ada di SATU FILE:** `src/config/wedding.ts`

### 1. Pilih Theme Warna

```typescript
// Pilihan: "gold" | "rose" | "navy" | "forest" | "lavender" | "monochrome" | "rustic" | "blush"
themePreset: "gold",
```

#### 🎨 Theme Presets:

| Preset | Warna | Vibe |
|--------|-------|------|
| `gold` | ✨ Gold + Sage | Mewah, elegan, timeless |
| `rose` | 🌹 Rose Pink | Romantis, soft, feminine |
| `navy` | 🌊 Navy + Gold | Maskulin, bold, modern |
| `forest` | 🌿 Green + Brown | Natural, earthy, rustic |
| `lavender` | 💜 Purple | Dreamy, soft, whimsical |
| `monochrome` | 🖤 Black + White | Minimalis, clean |
| `rustic` | ☕ Brown + Cream | Vintage, warm, cozy |
| `blush` | 🌸 Peach + Teal | Warm, cheerful, playful |

#### Custom Theme (warna sendiri):

```typescript
themePreset: null, // set null untuk pakai custom
customTheme: {
  name: "My Theme",
  primary: "#E91E63",      // Warna utama
  primaryLight: "#F48FB1",  // Warna utama terang
  primaryDark: "#AD1457",   // Warna utama gelap
  secondary: "#9E9E9E",    // Warna sekunder (label)
  secondaryLight: "#BDBDBD",
  background: "#FFFFFF",    // Background utama
  backgroundAlt: "#FAFAFA", // Background alternatif
  backgroundDark: "#F5F5F5",
  text: "#212121",          // Warna teks
  textLight: "#757575",
  coverBg: "#0a0a0a",      // Background cover (gelap)
  coverBgMid: "#1a1a1a",
  coverText: "#FFFFFF",     // Teks di cover
  particle: "#F48FB1",     // Warna partikel
},
```

### 2. Data Mempelai

```typescript
groom: {
  name: "Ahmad Wahyu",           // Nama panggilan
  fullName: "Ahmad Wahyu Pratama", // Nama lengkap
  father: "Bapak Surya Pratama",  // Nama ayah
  mother: "Ibu Dewi Lestari",    // Nama ibu
  childOrder: "Putra pertama",   // Anak ke-
  photo: "/images/groom.jpg",    // Foto (taruh di public/images/)
  instagram: "@wahyupratama",    // Instagram
},
```

### 3. Tanggal & Tempat

```typescript
akad: {
  date: "2026-06-15",
  time: "08:00",
  endTime: "09:30",
  venue: "Masjid Agung Al-Azhar",
  address: "Jl. Sisingamangaraja...",
  mapsUrl: "https://goo.gl/maps/xxx", // Link Google Maps
},
```

### 4. Gallery

Taruh foto prewedding di `public/images/gallery/`:

```typescript
gallery: [
  { src: "/images/gallery/1.jpg", alt: "Prewedding 1" },
  { src: "/images/gallery/2.jpg", alt: "Prewedding 2" },
  // Tambah/kurangi sesuka hati
],
```

### 5. Gift / Amplop Digital

```typescript
gifts: [
  {
    type: "bank",
    bankName: "Bank Central Asia (BCA)",
    accountNumber: "1234567890",
    accountHolder: "Ahmad Wahyu Pratama",
  },
  {
    type: "address",
    label: "Kirim Hadiah",
    address: "Jl. Mawar No. 10...",
    phone: "0812-3456-7890",
  },
],
```

### 6. Background Music

Taruh file MP3 di `public/music/`:

```typescript
music: {
  src: "/music/background.mp3",
  title: "Beautiful In White - Shane Filan",
},
```

### 7. Toggle Fitur

```typescript
features: {
  music: true,        // Background music
  particles: true,    // Floating particles
  threeD: true,       // 3D rings & hearts
  rsvp: true,         // RSVP form
  gifts: true,        // Amplop digital
  gallery: true,      // Photo gallery
  countdown: true,    // Countdown timer
  guestMessages: true, // Ucapan tamu
},
```

## 🗄️ Database Setup (RSVP)

### Opsi 1: File-based (Default — Zero Setup)

RSVP otomatis tersimpan di `data/rsvp.json`. Tidak perlu setup database.
Cocok untuk undangan kecil (< 500 tamu).

Cek data RSVP:
```bash
# Via API
curl http://localhost:3000/api/rsvp

# Atau buka file langsung
cat data/rsvp.json
```

### Opsi 2: Supabase (Gratis, Production-ready)

Untuk undangan besar atau butuh realtime updates:

1. **Buat project di [supabase.com](https://supabase.com)**

2. **Buat tabel:**
```sql
CREATE TABLE rsvp (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  attendance TEXT DEFAULT 'hadir',
  guests INTEGER DEFAULT 1,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Optional: Enable RLS
ALTER TABLE rsvp ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public insert" ON rsvp FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow public read" ON rsvp FOR SELECT TO anon USING (true);
```

3. **Set environment variables:**
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

4. **Install Supabase client:**
```bash
npm install @supabase/supabase-js
```

5. **Update `src/app/api/rsvp/route.ts`** — ganti file storage dengan Supabase client.

### Opsi 3: PostgreSQL (Self-hosted)

```bash
# Docker
docker run -d --name wedding-db \
  -e POSTGRES_USER=wedding \
  -e POSTGRES_PASSWORD=secret \
  -e POSTGRES_DB=undangan \
  -p 5432:5432 \
  postgres:16-alpine

# Buat tabel
docker exec -i wedding-db psql -U wedding -d undangan <<EOF
CREATE TABLE rsvp (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  attendance VARCHAR(20) DEFAULT 'hadir',
  guests INTEGER DEFAULT 1,
  message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
EOF
```

## 🚀 Deploy

### Vercel (Recommended — Gratis)

```bash
npm install -g vercel
vercel --prod
```

⚠️ **Catatan:** Kalau pakai file-based RSVP di Vercel, data tidak persisten (Vercel serverless = ephemeral). Pakai Supabase untuk production.

### VPS (Docker)

```dockerfile
# Sudah ada Dockerfile? Kalau belum:
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

```bash
docker build -t undangan-nikah .
docker run -d --name undangan -p 3000:3000 undangan-nikah
```

### Netlify / Static Export

```bash
# next.config.ts — tambahkan:
# output: "export"

npm run build
# Upload folder `out/` ke Netlify
```

## 📂 Struktur Project

```
undangan-nikah/
├── src/
│   ├── app/
│   │   ├── api/rsvp/route.ts    # RSVP API (GET/POST)
│   │   ├── globals.css          # CSS variables (auto dari theme)
│   │   ├── layout.tsx           # Font setup
│   │   └── page.tsx             # Main page
│   ├── components/
│   │   ├── Cover.tsx            # Cover + 3D scene
│   │   ├── HeroSection.tsx      # Bismillah + nama mempelai
│   │   ├── QuoteSection.tsx     # Ayat Al-Quran
│   │   ├── CoupleSection.tsx    # Profil mempelai
│   │   ├── EventSection.tsx     # Akad & Resepsi
│   │   ├── CountdownSection.tsx # Countdown timer + 3D
│   │   ├── GallerySection.tsx   # Photo gallery + lightbox
│   │   ├── GiftSection.tsx      # Amplop digital
│   │   ├── RSVPSection.tsx      # Form RSVP
│   │   ├── FooterSection.tsx    # Footer + hashtag
│   │   ├── MusicPlayer.tsx      # Audio player
│   │   ├── Particles.tsx        # Floating particles (CSS)
│   │   ├── Scene3D.tsx          # 3D elements (Three.js)
│   │   └── ThemeProvider.tsx    # Dynamic CSS variables
│   └── config/
│       └── wedding.ts           # ⭐ ALL CUSTOMIZATION HERE
├── public/
│   ├── images/
│   │   ├── groom.jpg
│   │   ├── bride.jpg
│   │   └── gallery/1-6.jpg
│   └── music/background.mp3
├── data/
│   └── rsvp.json               # RSVP data (auto-created)
└── README.md
```

## 🔗 Cara Kirim Undangan

Tambahkan `?to=` di URL untuk personalisasi:

```
https://undangan-kamu.vercel.app/?to=Bapak%20dan%20Ibu%20Hasan
https://undangan-kamu.vercel.app/?to=Keluarga%20Besar%20Pratama
https://undangan-kamu.vercel.app/?to=Teman%20Kantor
```

## 📄 License

MIT — free untuk dipakai, dimodifikasi, dan didistribusikan.

---

Made with ❤️ by [gorillaworkout](https://github.com/gorillaworkout)
