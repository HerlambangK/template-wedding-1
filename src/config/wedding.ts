// ============================================================
// 📝 EDIT FILE INI UNTUK CUSTOMIZE UNDANGAN KAMU
// Cuma edit file ini, semua website berubah otomatis!
// ============================================================

// 🎨 THEME PRESETS — Pilih salah satu atau bikin sendiri
export const themePresets = {
	// ✨ Gold Classic — Mewah, elegan, timeless
	gold: {
		name: 'Gold Classic',
		primary: '#B8860B',
		primaryLight: '#D4A843',
		primaryDark: '#8B6914',
		secondary: '#7C8C6E',
		secondaryLight: '#9AAB8C',
		background: '#FEFCF6',
		backgroundAlt: '#FAF3E0',
		backgroundDark: '#F0E6CC',
		text: '#2C2C2C',
		textLight: '#666666',
		coverBg: '#0a0a0a',
		coverBgMid: '#1a1a1a',
		coverText: '#FFFFFF',
		particle: '#D4A843',
	},

	// 🌹 Rose Garden — Romantis, soft, feminine
	rose: {
		name: 'Rose Garden',
		primary: '#B76E79',
		primaryLight: '#D4919A',
		primaryDark: '#8B4A52',
		secondary: '#9AACB8',
		secondaryLight: '#B8C8D4',
		background: '#FFF9F9',
		backgroundAlt: '#FFF0F0',
		backgroundDark: '#FFE4E4',
		text: '#3D2B2B',
		textLight: '#6B5555',
		coverBg: '#1a0f0f',
		coverBgMid: '#2a1515',
		coverText: '#FFFFFF',
		particle: '#D4919A',
	},

	// 🌊 Navy Elegance — Maskulin, bold, modern
	navy: {
		name: 'Navy Elegance',
		primary: '#C9A96E',
		primaryLight: '#DFC494',
		primaryDark: '#A68B4B',
		secondary: '#8B9EB0',
		secondaryLight: '#A8B8C8',
		background: '#F8F9FC',
		backgroundAlt: '#EEF1F7',
		backgroundDark: '#DDE3EE',
		text: '#1B2A4A',
		textLight: '#4A5568',
		coverBg: '#0A1628',
		coverBgMid: '#152238',
		coverText: '#FFFFFF',
		particle: '#C9A96E',
	},

	// 🌿 Forest Romance — Natural, earthy, rustic
	forest: {
		name: 'Forest Romance',
		primary: '#6B7F5E',
		primaryLight: '#8DA07E',
		primaryDark: '#4E6043',
		secondary: '#B8A98C',
		secondaryLight: '#D4C8AE',
		background: '#FAFAF5',
		backgroundAlt: '#F0F0E6',
		backgroundDark: '#E4E4D4',
		text: '#2C3325',
		textLight: '#5A6350',
		coverBg: '#0A0F08',
		coverBgMid: '#1A2215',
		coverText: '#FFFFFF',
		particle: '#8DA07E',
	},

	// 💜 Lavender Dream — Dreamy, soft, whimsical
	lavender: {
		name: 'Lavender Dream',
		primary: '#8B7EC8',
		primaryLight: '#A99ADA',
		primaryDark: '#6B5EA8',
		secondary: '#C4A882',
		secondaryLight: '#D8C4A2',
		background: '#FAFAFF',
		backgroundAlt: '#F2F0FF',
		backgroundDark: '#E6E2F8',
		text: '#2D2840',
		textLight: '#5A5470',
		coverBg: '#0E0A1A',
		coverBgMid: '#1A1428',
		coverText: '#FFFFFF',
		particle: '#A99ADA',
	},

	// 🖤 Monochrome — Minimalis, modern, clean
	monochrome: {
		name: 'Monochrome',
		primary: '#888888',
		primaryLight: '#AAAAAA',
		primaryDark: '#555555',
		secondary: '#666666',
		secondaryLight: '#999999',
		background: '#FFFFFF',
		backgroundAlt: '#F5F5F5',
		backgroundDark: '#E8E8E8',
		text: '#1A1A1A',
		textLight: '#555555',
		coverBg: '#000000',
		coverBgMid: '#111111',
		coverText: '#FFFFFF',
		particle: '#AAAAAA',
	},

	// ☕ Rustic Brown — Vintage, warm, cozy
	rustic: {
		name: 'Rustic Brown',
		primary: '#8B6F47',
		primaryLight: '#B08E60',
		primaryDark: '#6B5030',
		secondary: '#A4916A',
		secondaryLight: '#C4B490',
		background: '#FDF8F0',
		backgroundAlt: '#F5EDE0',
		backgroundDark: '#EAE0D0',
		text: '#3D2E1E',
		textLight: '#6B5840',
		coverBg: '#0F0A05',
		coverBgMid: '#1F1510',
		coverText: '#FFFFFF',
		particle: '#B08E60',
	},

	// 🌸 Blush Peach — Warm, cheerful, playful
	blush: {
		name: 'Blush Peach',
		primary: '#D4836B',
		primaryLight: '#E8A48F',
		primaryDark: '#B06048',
		secondary: '#8AAFB0',
		secondaryLight: '#A8CDD0',
		background: '#FFFBF8',
		backgroundAlt: '#FFF0EA',
		backgroundDark: '#FFE4DA',
		text: '#3D2A22',
		textLight: '#6B5045',
		coverBg: '#150A05',
		coverBgMid: '#251510',
		coverText: '#FFFFFF',
		particle: '#E8A48F',
	},
} as const;

// ============================================================
// 👇 PILIH THEME DI SINI — ganti "gold" jadi preset lain
//    Atau bikin custom theme sendiri (lihat contoh di bawah)
// ============================================================
export type ThemePresetKey = keyof typeof themePresets;

export const config = {
	// 🎨 THEME
	// Pilihan: "gold" | "rose" | "navy" | "forest" | "lavender" | "monochrome" | "rustic" | "blush"
	// Atau set null dan isi customTheme di bawah
	themePreset: null as ThemePresetKey | null,

	// Custom theme (dipakai kalau themePreset = null)
	customTheme: {
		name: 'Elegant Cream Gold',
		primary: '#C8A96B',
		primaryLight: '#D4A843',
		primaryDark: '#A68B4B',
		secondary: '#C8A96B',
		secondaryLight: '#D4A843',
		background: '#F7F1E8',
		backgroundAlt: '#FFFFFF',
		backgroundDark: '#E8E0D0',
		text: '#2C2C2C',
		textLight: '#666666',
		coverBg: '#0a0a0a',
		coverBgMid: '#1a1a1a',
		coverText: '#FFFFFF',
		particle: '#C8A96B',
	},

	// 👫 Data Mempelai
	groom: {
		name: 'Herlambang',
		fullName: 'Herlambang Kuswicaksonojati',
		father: '',
		mother: '',
		childOrder: 'Putra tercinta',
		photo: '',
		instagram: '',
	},
	bride: {
		name: 'Rela',
		fullName: 'Rela Hastuti',
		father: '',
		mother: '',
		childOrder: 'Putri tercinta',
		photo: '',
		instagram: '',
	},

	// 📅 Tanggal & Acara
	makanKeluarga: {
		date: '2026-05-29',
		time: '09:30',
		endTime: '10:30',
		venue: 'NAWASENA GARDEN BALLROOM',
		address: 'Jl. H.A. Salim No. 90, Pandean, Manguharjo, Kota Madiun, Jawa Timur',
		mapsUrl: 'https://maps.app.goo.gl/SCFZSetJYAHDEHa67',
	},

	// 📍 Lokasi Penting
	locations: {
		familyGathering: {
			name: 'NAWASENA GARDEN BALLROOM',
			address: 'Jl. H.A. Salim No. 90, Pandean, Manguharjo, Kota Madiun, Jawa Timur',
			mapsUrl: 'https://maps.app.goo.gl/SCFZSetJYAHDEHa67',
		},
	},

	// 💝 Quote / Ayat
	quotes: [
		{
			arabic:
				'وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا لِّتَسْكُنُوا إِلَيْهَا وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً',
			text: 'Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu pasangan hidup dari jenismu sendiri supaya kamu mendapatkan ketenangan hati.',
			source: 'QS. Ar-Rum: 21',
		},
	],

	// 🎵 Musik
	music: {
		src: '/music/hindia-a-feeling.mp3',
		title: 'Islamic Wedding Nasheed',
	},

	// 🖼️ Gallery — tambah/kurangi sesuai kebutuhan
	gallery: [
		{ src: '/images/gallery/1.jpg', alt: 'Prewedding 1' },
		{ src: '/images/gallery/2.jpg', alt: 'Prewedding 2' },
		{ src: '/images/gallery/3.jpg', alt: 'Prewedding 3' },
		{ src: '/images/gallery/4.jpg', alt: 'Prewedding 4' },
		{ src: '/images/gallery/5.jpg', alt: 'Prewedding 5' },
		{ src: '/images/gallery/6.jpg', alt: 'Prewedding 6' },
	],

	// 💳 Gift / Amplop Digital
	gifts: [
		{
			type: 'bank',
			bankName: 'BCA',
			accountNumber: '8950648229',
			accountHolder: 'Herlambang',
		},
	],

	// 📱 Social / Footer
	hashtag: '#TEMPUHSELAMANYA',
	footerText: 'With Love, Herlambang & Rela',

	// ⚙️ Features Toggle
	features: {
		music: true, // Background music
		particles: true, // Floating particles effect
		threeD: true, // 3D elements (rings, hearts)
		rsvp: true, // RSVP form
		gifts: true, // Gift/amplop section
		gallery: false, // Photo gallery
		countdown: true, // Countdown timer
		guestMessages: true, // Show previous guest messages
	},
};

// ============================================================
// 🔧 Helper — jangan edit di bawah ini
// ============================================================
export interface ThemeColors {
	name: string;
	primary: string;
	primaryLight: string;
	primaryDark: string;
	secondary: string;
	secondaryLight: string;
	background: string;
	backgroundAlt: string;
	backgroundDark: string;
	text: string;
	textLight: string;
	coverBg: string;
	coverBgMid: string;
	coverText: string;
	particle: string;
}

export function getTheme(): ThemeColors {
	if (config.themePreset && themePresets[config.themePreset]) {
		return { ...themePresets[config.themePreset] };
	}
	return { ...config.customTheme };
}
