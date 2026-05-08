"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Utensils } from "lucide-react";
import { config } from "@/config/wedding";

declare global {
  interface Window {
    L: any;
  }
}

export default function InteractiveMapSection() {
  const mapRef = useRef<HTMLDivElement>(null);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [showFamily, setShowFamily] = useState(false);
  const [L, setL] = useState<any>(null);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);

    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.onload = () => setL(window.L);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(link);
      document.head.removeChild(script);
    };
  }, []);

  // Inject CSS to remove Leaflet's default marker background
  useEffect(() => {
    if (!L) return;
    const style = document.createElement("style");
    style.innerHTML = `
      .leaflet-marker-icon {
        background: transparent !important;
        border: none !important;
        box-shadow: none !important;
      }
    `;
    document.head.appendChild(style);
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, [L]);

  useEffect(() => {
    if (!L || !mapRef.current || !isInView) return;

    const map = L.map(mapRef.current).setView([-7.6, 111.0], 9);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    // Locations
    const wonosari: [number, number] = [-8.0084, 110.6067]; // Wonosari, Gunungkidul (Herlambang)
    const grogogan: [number, number] = [-7.2000, 111.6500]; // Grogogan, Madiun (Rela)
    const kua: [number, number] = [-7.5970, 111.5335]; // KUA Jiwan

    // Calculate bearing (0° = north, clockwise)
    const calculateBearing = (lat1: number, lng1: number, lat2: number, lng2: number) => {
      const toRad = (deg: number) => (deg * Math.PI) / 180;
      const toDeg = (rad: number) => (rad * 180) / Math.PI;

      const φ1 = toRad(lat1);
      const φ2 = toRad(lat2);
      const Δλ = toRad(lng2 - lng1);

      const y = Math.sin(Δλ) * Math.cos(φ2);
      const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);

      const θ = Math.atan2(y, x);
      return (toDeg(θ) + 360) % 360;
    };

    // Create car icon - 🚗 points RIGHT (east = 90°) by default
    // To align with bearing: rotation = bearing - 90
    const createCarIcon = (bearing: number, name: string) => {
      const rotation = bearing - 90; // Adjust because 🚗 points right (90°)
      return L.divIcon({
        html: `<div style="text-align: center; background: transparent;">
          <div style="font-size: 32px; transform: rotate(${rotation}deg); transform-origin: center; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">🚗</div>
          <div style="display: inline-block; background: linear-gradient(135deg, #C8A96B, #D8B4A0); color: white; font-size: 10px; font-weight: bold; padding: 2px 8px; border-radius: 10px; margin-top: 2px; box-shadow: 0 1px 3px rgba(0,0,0,0.2); white-space: nowrap;">${name}</div>
        </div>`,
        iconSize: [50, 65],
        iconAnchor: [25, 25],
      });
    };

    // Beautified home icon for Herlambang & Rela (no white background)
    const homeIcon = (emoji: string, label: string, color1: string, color2: string) => {
      return L.divIcon({
        html: `<div style="text-align: center; background: transparent;">
          <div style="font-size: 40px; filter: drop-shadow(0 3px 10px rgba(0,0,0,0.4));">${emoji}</div>
          <div style="display: inline-block; background: linear-gradient(135deg, ${color1}, ${color2}); color: white; font-size: 11px; font-weight: bold; padding: 4px 12px; border-radius: 15px; margin-top: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.2); white-space: nowrap;">${label}</div>
        </div>`,
        iconSize: [75, 90],
        iconAnchor: [37, 50],
      });
    };

    // Wedding-themed icon for KUA Jiwan (using 💒 wedding rings)
    const kuaIcon = L.divIcon({
      html: `<div style="text-align: center; background: transparent;">
        <div style="font-size: 44px; filter: drop-shadow(0 3px 10px rgba(0,0,0,0.4));">💒</div>
        <div style="display: inline-block; background: linear-gradient(135deg, #C8A96B, #D8B4A0); color: white; font-size: 11px; font-weight: bold; padding: 4px 12px; border-radius: 15px; margin-top: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.2); white-space: nowrap;">KUA Jiwan</div>
      </div>`,
      iconSize: [85, 100],
      iconAnchor: [42, 60],
    });

    // Add markers
    L.marker(wonosari, { icon: homeIcon("🏠", "Herlambang", "#C8A96B", "#D8B4A0") })
      .addTo(map)
      .bindPopup("<b>Wonosari, Gunungkidul</b><br>Rumah Herlambang");

    L.marker(grogogan, { icon: homeIcon("🏡", "Rela", "#D8B4A0", "#C8A96B") })
      .addTo(map)
      .bindPopup("<b>Grogogan, Madiun</b><br>Rumah Rela Hastuti");

    L.marker(kua, { icon: kuaIcon })
      .addTo(map)
      .bindPopup("<b>KUA Jiwan, Madiun</b><br>Lokasi Akad Nikah - 29 Mei 2026");

    // Routes with thicker, more visible lines
    const routeHerlambang: [number, number][] = [
      [-8.0084, 110.6067], // Wonosari
      [-8.0, 110.7],
      [-7.9, 110.9],
      [-7.8, 111.1],
      [-7.7, 111.25],
      [-7.65, 111.35],
      [-7.62, 111.45],
      [-7.60, 111.52],
      [-7.5970, 111.5335], // KUA Jiwan
    ];

    const routeRela: [number, number][] = [
      [-7.2000, 111.6500], // Grogogan, Madiun
      [-7.3, 111.64],
      [-7.4, 111.60],
      [-7.5, 111.57],
      [-7.55, 111.55],
      [-7.58, 111.54],
      [-7.5970, 111.5335], // KUA Jiwan
    ];

    // Draw routes - thicker and more visible
    L.polyline(routeHerlambang, {
      color: "#C8A96B",
      weight: 5,
      opacity: 0.8,
      dashArray: "15, 10",
    }).addTo(map);

    L.polyline(routeRela, {
      color: "#D8B4A0",
      weight: 5,
      opacity: 0.8,
      dashArray: "15, 10",
    }).addTo(map);

    // Animated cars with correct initial rotation
    const carHerlambang = L.marker(wonosari, {
      icon: createCarIcon(
        calculateBearing(wonosari[0], wonosari[1], routeHerlambang[1][0], routeHerlambang[1][1]),
        "Herlambang"
      ),
    }).addTo(map);

    const carRela = L.marker(grogogan, {
      icon: createCarIcon(
        calculateBearing(grogogan[0], grogogan[1], routeRela[1][0], routeRela[1][1]),
        "Rela"
      ),
    }).addTo(map);

    // Popups on cars (show names)
    carHerlambang.bindPopup("<b>🚗 Herlambang</b><br>Dari Wonosari, Gunungkidul menuju KUA Jiwan");
    carRela.bindPopup("<b>🚗 Rela</b><br>Dari Grogogan, Madiun menuju KUA Jiwan");

    // Animation function
    const animateCar = (
      car: any,
      route: [number, number][],
      progress: number,
      setProgress: (p: number) => void,
      speed: number
    ) => {
      if (progress >= 1) {
        setProgress(0);
        car.setLatLng(route[0]);
        return;
      }

      const totalSegments = route.length - 1;
      const exactPosition = progress * totalSegments;
      const segmentIndex = Math.floor(exactPosition);
      const segmentProgress = exactPosition % 1;

      const startIdx = Math.min(segmentIndex, totalSegments - 1);
      const endIdx = Math.min(segmentIndex + 1, totalSegments);

      const start = route[startIdx];
      const end = route[endIdx];

      const lat = start[0] + (end[0] - start[0]) * segmentProgress;
      const lng = start[1] + (end[1] - start[1]) * segmentProgress;

      // Calculate bearing for rotation (direction of travel)
      const bearing = calculateBearing(start[0], start[1], end[0], end[1]);
      
      car.setLatLng([lat, lng]);
      car.setIcon(createCarIcon(bearing, car === carHerlambang ? "Herlambang" : "Rela"));

      setProgress(progress + speed);
    };

    let progressH = 0;
    let progressR = 0;

    // SYNCHRONIZED ARRIVAL: Both cars reach KUA at the same time
    // Herlambang: 8 segments, ~200km (FASTER)
    // Rela: 6 segments, ~50km (SLOWER since closer)
    const interval = setInterval(() => {
      animateCar(carHerlambang, routeHerlambang, progressH, (p) => {
        progressH = p;
      }, 0.004); // Faster (longer distance)

      animateCar(carRela, routeRela, progressR, (p) => {
        progressR = p;
      }, 0.003); // Slower (shorter distance - arrives same time)
    }, 50);

    return () => {
      clearInterval(interval);
      map.remove();
    };
  }, [L, isInView]);

  return (
    <section ref={ref} className="relative py-24" style={{ backgroundColor: "var(--bg)" }}>
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <h2
            className="font-[family-name:var(--font-playfair)] text-4xl font-bold sm:text-5xl"
            style={{ color: "var(--text)" }}
          >
            🗺️ Peta Lokasi
          </h2>
          <div className="ornament-divider mt-6">
            <span style={{ color: "var(--primary)" }}>❋</span>
          </div>
          <p
            className="font-[family-name:var(--font-poppins)] mt-4 text-sm"
            style={{ color: "var(--text-light)" }}
          >
            Perjalanan menuju hari bahagia kami
          </p>
        </motion.div>

        {/* Leaflet Map */}
        <motion.div
          ref={mapRef}
          className="mb-12 overflow-hidden rounded-2xl"
          style={{
            height: "500px",
            backgroundColor: "var(--bg-alt)",
            border: "1px solid color-mix(in srgb, var(--primary-light) 30%, transparent)",
          }}
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, delay: 0.3 }}
        />

        {/* Location Cards */}
        <div className="mb-8 grid gap-6 sm:grid-cols-3">
          {[
            {
              emoji: "🏠",
              title: "Wonosari, Gunungkidul",
              subtitle: "Rumah Herlambang",
              color: "#C8A96B",
            },
            {
              emoji: "🏡",
              title: "Grogogan, Madiun",
              subtitle: "Rumah Rela Hastuti",
              color: "#D8B4A0",
            },
            {
              emoji: "💒",
              title: "KUA Jiwan, Madiun",
              subtitle: "Lokasi Akad Nikah",
              color: "#C8A96B",
            },
          ].map((loc, index) => (
            <motion.a
              key={index}
              href={config.akad.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl p-6 text-center transition-all hover:scale-105"
              style={{
                backgroundColor: "var(--bg-alt)",
                border: `1px solid color-mix(in srgb, ${loc.color} 30%, transparent)`,
              }}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.2 }}
            >
              <div className="mb-3 text-3xl">{loc.emoji}</div>
              <h3
                className="font-[family-name:var(--font-playfair)] text-lg font-semibold"
                style={{ color: "var(--text)" }}
              >
                {loc.title}
              </h3>
              <p
                className="font-[family-name:var(--font-poppins)] mt-2 text-sm"
                style={{ color: "var(--text-light)" }}
              >
                {loc.subtitle}
              </p>
            </motion.a>
          ))}
        </div>

        {/* Family Gathering Button */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 1.5 }}
        >
          <button
            onClick={() => setShowFamily(!showFamily)}
            className="inline-flex items-center gap-2 rounded-full px-8 py-3 font-[family-name:var(--font-poppins)] text-sm font-medium transition-all hover:opacity-80"
            style={{
              backgroundColor: "var(--primary)",
              color: "#FFFFFF",
            }}
          >
            <Utensils className="h-4 w-4" />
            Lokasi Pertemuan Keluarga - Resto Nawasena
          </button>

          {showFamily && (
            <motion.div
              className="mt-6 overflow-hidden rounded-2xl"
              style={{
                border: "1px solid color-mix(in srgb, var(--primary-light) 30%, transparent)",
                height: "400px",
              }}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "400px", opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <iframe
                src="https://maps.google.com/maps?q=Resto+Nawasena+Madiun&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
