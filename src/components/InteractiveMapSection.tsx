'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useInView } from 'framer-motion';
import { Utensils } from 'lucide-react';
import { config } from '@/config/wedding';

declare global {
	interface Window {
		L: any;
	}
}

// ============= COORDINATES =============
const WONOSARI: [number, number] = [-8.0084, 110.6067];
const GROBOGAN: [number, number] = [-7.55, 111.65];
const KUA: [number, number] = [-7.597, 111.5335];
const NAWASENA: [number, number] = [-7.6337693, 111.5168667];

// ============= ROUTES =============
const ROUTE_WONOSARI: [number, number][] = [
	[-8.0084, 110.6067],
	[-8.0, 110.7],
	[-7.9, 110.9],
	[-7.8, 111.1],
	[-7.7, 111.25],
	[-7.65, 111.35],
	[-7.62, 111.45],
	[-7.6, 111.52],
	[-7.597, 111.5335],
];

const ROUTE_GROBOGAN: [number, number][] = [
	[-7.55, 111.65],
	[-7.56, 111.62],
	[-7.57, 111.58],
	[-7.58, 111.55],
	[-7.59, 111.54],
	[-7.595, 111.535],
	[-7.597, 111.5335],
];

// ============= HELPERS =============
function interpolate(
	route: [number, number][],
	progress: number,
): { lat: number; lng: number; segIdx: number } {
	const total = route.length - 1;
	const p = Math.min(progress, 0.9999);
	const exact = p * total;
	const idx = Math.min(Math.floor(exact), total - 1);
	const frac = exact - idx;
	const from = route[idx];
	const to = route[Math.min(idx + 1, total)];
	return {
		lat: from[0] + (to[0] - from[0]) * frac,
		lng: from[1] + (to[1] - from[1]) * frac,
		segIdx: idx,
	};
}

function buildDrawnRoute(
	route: [number, number][],
	progress: number,
): [number, number][] {
	const total = route.length - 1;
	const p = Math.min(progress, 0.9999);
	const exact = p * total;
	const idx = Math.min(Math.floor(exact), total - 1);
	const frac = exact - idx;
	const points: [number, number][] = route.slice(0, idx + 1);
	if (idx < total) {
		const from = route[idx];
		const to = route[idx + 1];
		points.push([
			from[0] + (to[0] - from[0]) * frac,
			from[1] + (to[1] - from[1]) * frac,
		]);
	}
	return points;
}

export default function InteractiveMapSection() {
	const mapRef = useRef<HTMLDivElement>(null);
	const sectionRef = useRef(null);
	const isInView = useInView(sectionRef, { once: true, margin: '-80px' });
	const [L, setL] = useState<any>(null);
	const [arrived, setArrived] = useState(false);
	const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

	const galleryImages = [
		{ src: '/images/nawasena/nawasena-ballroom.jpg', alt: 'Ballroom' },
		{ src: '/images/nawasena/nawasena-resto-ballroom.jpg', alt: 'Resto Ballroom' },
		{ src: '/images/nawasena/nawasena-ballrom.png', alt: 'Ballroom Interior' },
	];

	const openLightbox = useCallback((i: number) => setLightboxIdx(i), []);
	const closeLightbox = useCallback(() => setLightboxIdx(null), []);
	const prevImage = useCallback(() => {
		setLightboxIdx(i => (i !== null ? (i - 1 + galleryImages.length) % galleryImages.length : null));
	}, []);
	const nextImage = useCallback(() => {
		setLightboxIdx(i => (i !== null ? (i + 1) % galleryImages.length : null));
	}, []);

	useEffect(() => {
		if (lightboxIdx === null) return;
		const handler = (e: KeyboardEvent) => {
			if (e.key === 'Escape') closeLightbox();
			if (e.key === 'ArrowLeft') prevImage();
			if (e.key === 'ArrowRight') nextImage();
		};
		window.addEventListener('keydown', handler);
		return () => window.removeEventListener('keydown', handler);
	}, [lightboxIdx, closeLightbox, prevImage, nextImage]);

	// Load Leaflet CDN
	useEffect(() => {
		const link = document.createElement('link');
		link.rel = 'stylesheet';
		link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
		document.head.appendChild(link);
		const script = document.createElement('script');
		script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
		script.onload = () => setL(window.L);
		document.head.appendChild(script);
		return () => {
			document.head.removeChild(link);
			document.head.removeChild(script);
		};
	}, []);

	// Marker style override
	useEffect(() => {
		if (!L) return;
		const s = document.createElement('style');
		s.innerHTML = `.leaflet-marker-icon{background:transparent!important;border:none!important;box-shadow:none!important}`;
		document.head.appendChild(s);
		return () => {
			if (document.head.contains(s)) document.head.removeChild(s);
		};
	}, [L]);

	// Map + animation
	useEffect(() => {
		if (!L || !mapRef.current || !isInView) return;

		const map = L.map(mapRef.current).setView([-7.6, 111.0], 9);
		L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution:
				'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
		}).addTo(map);

		// ---- Icon factories ----
		const pin = (emoji: string, label: string, c1: string, c2: string) =>
			L.divIcon({
				html: `<div style="text-align:center;background:transparent">
          <div style="font-size:40px;filter:drop-shadow(0 3px 10px rgba(0,0,0,0.4))">${emoji}</div>
          <div style="display:inline-block;background:linear-gradient(135deg,${c1},${c2});color:#fff;font-size:11px;font-weight:bold;padding:4px 12px;border-radius:15px;margin-top:4px;box-shadow:0 2px 8px rgba(0,0,0,0.2);white-space:nowrap">${label}</div>
        </div>`,
				iconSize: [85, 100],
				iconAnchor: [42, 60],
			});

		const kuaIcon = (scale = 1) =>
			L.divIcon({
				html: `<div style="text-align:center;background:transparent;transform:scale(${scale});transform-origin:bottom center">
          <div style="font-size:40px;filter:drop-shadow(0 3px 10px rgba(0,0,0,0.4))">🕌</div>
          <div style="display:inline-flex;align-items:center;gap:6px;background:linear-gradient(135deg,#D8B48A,#C8A97E);color:#fff;font-size:10px;font-weight:600;padding:4px 14px;border-radius:20px;margin-top:4px;box-shadow:0 2px 8px rgba(0,0,0,0.15);white-space:nowrap;letter-spacing:0.3px">
            <span>❤️</span>Menikah
          </div>
        </div>`,
				iconSize: [85 * scale, 95 * scale],
				iconAnchor: [42 * scale, 60 * scale],
			});

		// 🚘 always faces screen (no tilt)
		const carIcon = (name: string, shadow = false) => {
			if (shadow) {
				return L.divIcon({
					html: `<div style="font-size:26px;opacity:0.2;filter:blur(3px)">🚘</div>`,
					iconSize: [40, 40],
					iconAnchor: [20, 25],
				});
			}
			return L.divIcon({
				html: `<div style="text-align:center;background:transparent">
          <div style="font-size:32px;filter:drop-shadow(0 4px 6px rgba(0,0,0,0.35))">🚘</div>
          <div style="display:inline-block;background:linear-gradient(135deg,#C8A96B,#D8B4A0);color:#fff;font-size:10px;font-weight:bold;padding:2px 8px;border-radius:10px;margin-top:2px;box-shadow:0 1px 3px rgba(0,0,0,0.2);white-space:nowrap">${name}</div>
        </div>`,
				iconSize: [50, 65],
				iconAnchor: [25, 25],
			});
		};

		const trailHeart = L.divIcon({
			html: `<div style="font-size:10px;opacity:0.7">❤️</div>`,
			iconSize: [14, 14],
			iconAnchor: [7, 7],
		});

		// ---- Static markers ----
		L.marker(WONOSARI, {
			icon: pin('🏠', 'Yogyakarta', '#C8A96B', '#D8B4A0'),
		}).addTo(map);
		L.marker(GROBOGAN, {
			icon: pin('🏡', 'Madiun', '#D8B4A0', '#C8A96B'),
		}).addTo(map);

		const kuaMarker = L.marker(KUA, { icon: kuaIcon(1) }).addTo(map);

		// ---- Zoom handler: bigger when zoom in, smaller when zoom out ----
		const updateZoom = () => {
			const z = map.getZoom();
			const s =
				z >= 13 ? 1.5 : z >= 12 ? 1.25 : z >= 11 ? 1.0 : z >= 10 ? 0.8 : 0.6;
			kuaMarker.setIcon(kuaIcon(s));
		};
		map.on('zoomend', updateZoom);

		// ---- Route lines ----
		const bgLineWonosari = L.polyline(ROUTE_WONOSARI, {
			color: '#C8A96B',
			weight: 3,
			opacity: 0.15,
			dashArray: '8, 8',
		}).addTo(map);
		const bgLineGrobogan = L.polyline(ROUTE_GROBOGAN, {
			color: '#D8B4A0',
			weight: 3,
			opacity: 0.15,
			dashArray: '8, 8',
		}).addTo(map);

		const fgLineWonosari = L.polyline([ROUTE_WONOSARI[0]], {
			color: '#C8A96B',
			weight: 5,
			opacity: 0.9,
		}).addTo(map);
		const fgLineGrobogan = L.polyline([ROUTE_GROBOGAN[0]], {
			color: '#D8B4A0',
			weight: 5,
			opacity: 0.9,
		}).addTo(map);

		// ---- Cars ----
		const shadowWonosari = L.marker(WONOSARI, {
			icon: carIcon('', true),
		}).addTo(map);
		const shadowGrobogan = L.marker(GROBOGAN, {
			icon: carIcon('', true),
		}).addTo(map);
		const carWonosari = L.marker(WONOSARI, {
			icon: carIcon('Herlambang'),
		}).addTo(map);
		const carGrobogan = L.marker(GROBOGAN, { icon: carIcon('Rela') }).addTo(
			map,
		);

		// ---- Animation loop ----
		let pWonosari = 0;
		let pGrobogan = 0;
		const SPEED = 0.0015;
		let animInterval: any;
		let restartTO: any;

		const trailHearts: any[] = [];

		function dropTrail(lat: number, lng: number) {
			const h = L.marker([lat, lng], { icon: trailHeart }).addTo(map);
			trailHearts.push(h);
			setTimeout(() => {
				map.removeLayer(h);
				const idx = trailHearts.indexOf(h);
				if (idx >= 0) trailHearts.splice(idx, 1);
			}, 1500);
		}

		function resetCars() {
			pWonosari = 0;
			pGrobogan = 0;
			carWonosari.setLatLng(WONOSARI);
			carWonosari.setIcon(carIcon('Herlambang'));
			shadowWonosari.setLatLng(WONOSARI);
			shadowWonosari.setIcon(carIcon('', true));
			carGrobogan.setLatLng(GROBOGAN);
			carGrobogan.setIcon(carIcon('Rela'));
			shadowGrobogan.setLatLng(GROBOGAN);
			shadowGrobogan.setIcon(carIcon('', true));
			fgLineWonosari.setLatLngs([ROUTE_WONOSARI[0]]);
			fgLineGrobogan.setLatLngs([ROUTE_GROBOGAN[0]]);
			trailHearts.forEach((h) => map.removeLayer(h));
			trailHearts.length = 0;
		}

		let frame = 0;

		function tick() {
			if (pWonosari >= 1 && pGrobogan >= 1) return;

			pWonosari = Math.min(pWonosari + SPEED, 1);
			pGrobogan = Math.min(pGrobogan + SPEED, 1);

			const posWonosari = interpolate(ROUTE_WONOSARI, pWonosari);
			fgLineWonosari.setLatLngs(buildDrawnRoute(ROUTE_WONOSARI, pWonosari));
			carWonosari.setLatLng([posWonosari.lat, posWonosari.lng]);
			shadowWonosari.setLatLng([posWonosari.lat, posWonosari.lng]);

			const posGrobogan = interpolate(ROUTE_GROBOGAN, pGrobogan);
			fgLineGrobogan.setLatLngs(buildDrawnRoute(ROUTE_GROBOGAN, pGrobogan));
			carGrobogan.setLatLng([posGrobogan.lat, posGrobogan.lng]);
			shadowGrobogan.setLatLng([posGrobogan.lat, posGrobogan.lng]);

			frame++;
			if (frame % 4 === 0) dropTrail(posWonosari.lat, posWonosari.lng);
			if (frame % 6 === 0) dropTrail(posGrobogan.lat, posGrobogan.lng);

			if (pWonosari >= 1 && pGrobogan >= 1) {
				clearInterval(animInterval);
				setArrived(true);
				restartTO = setTimeout(() => {
					resetCars();
					setArrived(false);
					animInterval = setInterval(tick, 50);
				}, 3000);
			}
		}

		animInterval = setInterval(tick, 50);

		return () => {
			clearInterval(animInterval);
			clearTimeout(restartTO);
			map.remove();
		};
	}, [L, isInView]);

	return (
		<section
			ref={sectionRef}
			className='relative py-16 sm:py-24'
			style={{ backgroundColor: 'var(--bg)' }}
		>
			<div className='mx-auto max-w-6xl px-4 sm:px-6'>
				<motion.div
					className='mb-10 sm:mb-16 text-center'
					initial={{ opacity: 0, y: 30 }}
					animate={isInView ? { opacity: 1, y: 0 } : {}}
					transition={{ duration: 0.8 }}
				>
					<p
						className='font-[family-name:var(--font-cormorant)] text-sm tracking-[0.4em] uppercase'
						style={{ color: 'var(--secondary)' }}
					>
						Wedding Journey
					</p>
					<div className='ornament-divider mt-4 mb-6'>
						<span className='text-xs' style={{ color: 'var(--primary)' }}>
							✦
						</span>
					</div>
					<h2
						className='font-[family-name:var(--font-playfair)] text-3xl font-light leading-tight sm:text-4xl'
						style={{ color: 'var(--text)' }}
					>
						Perjalanan Menuju
						<br />
						Hari Bahagia
					</h2>
					<p
						className='font-[family-name:var(--font-cormorant)] mt-5 text-sm tracking-[0.3em] uppercase'
						style={{ color: 'var(--text-light)' }}
					>
						Dari dua kota, satu cinta menuju pelaminan
					</p>
				</motion.div>

				{/* Map */}
				<div className='relative mb-12'>
					<motion.div
						ref={mapRef}
						className='overflow-hidden rounded-2xl h-[350px] md:h-[500px]'
						style={{
							backgroundColor: 'var(--bg-alt)',
							border: '1px solid color-mix(in srgb, var(--primary-light) 30%, transparent)',
							zIndex: 1,
						}}
						initial={{ opacity: 0, y: 50 }}
						animate={isInView ? { opacity: 1, y: 0 } : {}}
						transition={{ duration: 1, delay: 0.3 }}
					/>

					{/* Arrival overlay */}
					{arrived && (
						<motion.div
							className='absolute inset-0 flex items-center justify-center pointer-events-none z-[1000]'
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ duration: 0.6 }}
							style={{
								backdropFilter: 'blur(4px)',
								WebkitBackdropFilter: 'blur(4px)',
							}}
						>
							<div
								className='rounded-xl px-8 py-5 text-center shadow-lg'
								style={{
									backgroundColor: 'rgba(255,255,255,0.4)',
									border: '1px solid rgba(200,169,107,0.3)',
								}}
							>
								<div
									className='font-[family-name:var(--font-playfair)] text-2xl font-bold sm:text-3xl'
									style={{ color: 'var(--primary)' }}
								>
									29 Mei 2026
								</div>
								<p
									className='font-[family-name:var(--font-lora)] mt-1 text-xs'
									style={{ color: 'var(--text)', opacity: 0.6 }}
								>
									— sampai jumpa di hari bahagia —
								</p>
							</div>
						</motion.div>
					)}

					{/* Ballroom Nawasena info card */}
					<div className='absolute bottom-2 left-2 right-2 md:bottom-4 md:left-4 md:right-4 z-[1001]'>
						<motion.div
							className='rounded-lg md:rounded-xl p-2 md:p-4 shadow-lg'
							style={{
								backgroundColor: 'rgba(255,255,255,0.9)',
								backdropFilter: 'blur(8px)',
								WebkitBackdropFilter: 'blur(8px)',
								border: '1px solid rgba(200,169,107,0.3)',
							}}
							initial={{ opacity: 0, y: 20 }}
							animate={isInView ? { opacity: 1, y: 0 } : {}}
							transition={{ duration: 0.6, delay: 0.5 }}
						>
							<div className='flex items-center gap-2 md:gap-3'>
								<div
									className='flex h-7 w-7 md:h-10 md:w-10 shrink-0 items-center justify-center rounded-full'
									style={{ backgroundColor: 'var(--primary-light)' }}
								>
									<span className='text-sm md:text-lg'>🍽️</span>
								</div>
								<div className='min-w-0 flex-1'>
									<p
										className='font-[family-name:var(--font-playfair)] text-xs font-bold md:text-base'
										style={{ color: 'var(--text)' }}
									>
										Ballroom Nawasena Madiun
									</p>
									<p
										className='hidden md:block font-[family-name:var(--font-cormorant)] text-xs tracking-wider uppercase'
										style={{ color: 'var(--text-light)' }}
									>
										Tasyakuran Keluarga
									</p>
								</div>
								<a
									href={config.locations.familyGathering.mapsUrl}
									target='_blank'
									rel='noopener noreferrer'
									className='inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-2 text-xs font-semibold md:px-4 md:py-2 md:text-sm md:gap-1.5'
									style={{
										background: 'linear-gradient(135deg, #C8A96B, #D8B4A0)',
										color: '#fff',
									}}
								>
									<span>📍</span>
									<span className='hidden md:inline'>Buka Maps</span>
									<span className='md:hidden'>Maps</span>
								</a>
							</div>
							<p
								className='hidden md:block font-[family-name:var(--font-lora)] mt-2 text-xs italic leading-relaxed'
								style={{ color: 'var(--text-light)', opacity: 0.7 }}
							>
								Jl. H.A. Salim No. 90, Pandean, Manguharjo, Kota Madiun
							</p>
						</motion.div>
					</div>
				</div>

				{/* Mini Wedding Journey Timeline */}
				<div
					className='mb-8 sm:mb-12 overflow-x-auto pb-1'
					style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(200,169,107,0.3) transparent' }}
				>
					<motion.div
						className='mx-auto flex w-max min-w-full items-center justify-center gap-0 px-4'
						initial={{ opacity: 0 }}
						whileInView={{ opacity: 1 }}
						viewport={{ once: true, margin: '-50px' }}
						transition={{ duration: 0.8, delay: 0.6 }}
					>
						{[
							{ icon: '🏠', label: 'Berangkat', color: '#C8A96B' },
							{ icon: '🚘', label: 'Perjalanan', color: '#D8B4A0' },
							{ icon: '🕌', label: 'Menikah', color: '#C8A96B' },
							{ icon: '🍽️', label: 'Family Time', color: '#D8B4A0' },
						].map((step, i, arr) => (
							<motion.div
								key={i}
								className='flex items-center'
								initial={{ opacity: 0, x: -40 }}
								whileInView={{ opacity: 1, x: 0 }}
								viewport={{ once: true, margin: '-50px' }}
								transition={{ duration: 0.8, delay: 0.8 + i * 0.2, ease: 'easeOut' }}
							>
								<div className='flex flex-col items-center'>
									<div
										className='flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full text-sm sm:text-lg'
										style={{
											backgroundColor: `color-mix(in srgb, ${step.color} 20%, transparent)`,
											border: `2px solid ${step.color}`,
										}}
									>
										{step.icon}
									</div>
									<span
										className='mt-1 whitespace-nowrap text-[9px] sm:text-[10px] font-medium tracking-wide'
										style={{ color: 'var(--text-light)' }}
									>
										{step.label}
									</span>
								</div>
								{i < arr.length - 1 && (
									<div
										className='mx-1 sm:mx-2 mt-[-1rem] sm:mt-[-1.2rem] h-px w-4 sm:w-12 lg:w-20'
										style={{
											background: `linear-gradient(to right, ${step.color}, ${arr[i + 1].color})`,
											opacity: 0.4,
										}}
									/>
								)}
							</motion.div>
						))}
					</motion.div>
				</div>

				{/* Ballroom Nawasena - Tasyakuran Keluarga */}
				<motion.div
					className='mb-8 text-center'
					initial={{ opacity: 0, y: 20 }}
					animate={isInView ? { opacity: 1, y: 0 } : {}}
					transition={{ duration: 0.6, delay: 0.8 }}
				>
					<p
						className='font-[family-name:var(--font-cormorant)] text-sm tracking-[0.2em] uppercase mb-4'
						style={{ color: 'var(--secondary)' }}
					>
						Tasyakuran Keluarga
					</p>
					<a
						href={config.locations.familyGathering.mapsUrl}
						target='_blank'
						rel='noopener noreferrer'
						className='inline-flex items-center gap-3 rounded-full px-8 py-4 font-[family-name:var(--font-poppins)] text-sm font-medium transition-all hover:scale-105 hover:opacity-90 shadow-lg'
						style={{
							background: 'linear-gradient(135deg, #D8B4A0, #C8A96B)',
							color: '#FFFFFF',
						}}
					>
						<span className='text-xl'>🎉</span>
						<span>Ballroom Nawasena Madiun</span>
						<span className='text-lg'>📍</span>
					</a>
					<p
						className='font-[family-name:var(--font-lora)] mt-3 text-xs italic'
						style={{ color: 'var(--text-light)', opacity: 0.7 }}
					>
						Jl. H.A. Salim No. 90, Pandean, Manguharjo, Kota Madiun
					</p>
				</motion.div>
				{/* Nawasena Garden Gallery — satu baris kecil */}
				<motion.div
					className='mt-8 sm:mt-10 text-center'
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, margin: '-50px' }}
					transition={{ duration: 0.8, delay: 0.4 }}
				>
					<p
						className='font-[family-name:var(--font-cormorant)] text-xs tracking-[0.3em] uppercase mb-4'
						style={{ color: 'var(--secondary)' }}
					>
						Nawasena Garden Resto & Ballroom
					</p>
					<div
						className='mx-auto flex max-w-lg items-center justify-center gap-2 overflow-x-auto pb-1'
						style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(200,169,107,0.3) transparent' }}
					>
						{galleryImages.map((img, i) => (
							<motion.button
								key={i}
								onClick={() => openLightbox(i)}
								initial={{ opacity: 0, x: -20 }}
								whileInView={{ opacity: 1, x: 0 }}
								viewport={{ once: true, margin: '-50px' }}
								transition={{ duration: 0.6, delay: 0.6 + i * 0.12, ease: 'easeOut' }}
								className='flex-shrink-0 overflow-hidden rounded-md shadow-sm cursor-pointer'
							>
								<img
									src={img.src}
									alt={img.alt}
									className='h-16 w-24 sm:h-20 sm:w-28 object-cover transition-transform duration-300 hover:scale-105'
									loading='lazy'
								/>
							</motion.button>
						))}
					</div>
					<a
						href='https://www.instagram.com/nawasena_garden/'
						target='_blank'
						rel='noopener noreferrer'
						className='mt-3 inline-flex items-center gap-1.5 text-xs transition-opacity hover:opacity-70'
						style={{ color: 'var(--secondary)' }}
					>
						<svg className='h-3.5 w-3.5' viewBox='0 0 24 24' fill='currentColor'>
							<path d='M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z'/>
						</svg>
						<span>@nawasena_garden</span>
					</a>
				</motion.div>

			{/* Lightbox */}
			<AnimatePresence>
				{lightboxIdx !== null && (
					<motion.div
						className='fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md'
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						onClick={closeLightbox}
					>
						{/* Close */}
						<button
							onClick={closeLightbox}
							className='absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white/80 backdrop-blur transition-colors hover:bg-white/20 hover:text-white'
						>
							<svg className='h-5 w-5' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth={2}>
								<path d='M18 6L6 18M6 6l12 12' />
							</svg>
						</button>

						{/* Prev */}
						<button
							onClick={e => { e.stopPropagation(); prevImage(); }}
							className='absolute left-2 sm:left-6 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white/80 backdrop-blur transition-colors hover:bg-white/20 hover:text-white'
						>
							<svg className='h-5 w-5' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth={2}>
								<path d='M15 18l-6-6 6-6' />
							</svg>
						</button>

						{/* Next */}
						<button
							onClick={e => { e.stopPropagation(); nextImage(); }}
							className='absolute right-2 sm:right-6 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white/80 backdrop-blur transition-colors hover:bg-white/20 hover:text-white'
						>
							<svg className='h-5 w-5' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth={2}>
								<path d='M9 18l6-6-6-6' />
							</svg>
						</button>

						{/* Image */}
						<motion.div
							key={lightboxIdx}
							className='flex max-h-[85vh] max-w-[92vw] items-center justify-center'
							initial={{ opacity: 0, scale: 0.85 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.85 }}
							transition={{ duration: 0.3, ease: 'easeOut' }}
							onClick={e => e.stopPropagation()}
						>
							<img
								src={galleryImages[lightboxIdx].src}
								alt={galleryImages[lightboxIdx].alt}
								className='max-h-[85vh] max-w-[92vw] rounded-lg object-contain shadow-2xl'
							/>
						</motion.div>

						{/* Counter */}
						<span
							className='absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-black/40 px-4 py-1.5 text-xs font-medium tracking-wider text-white/80 backdrop-blur'
						>
							{lightboxIdx + 1} / {galleryImages.length}
						</span>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
		</section>
	);
}
