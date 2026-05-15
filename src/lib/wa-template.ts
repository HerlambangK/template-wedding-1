import { config } from "@/config/wedding";

export interface WaMessageParams {
  guestName: string;
  invitationLink: string;
  groomName?: string;
  brideName?: string;
  date?: string;
  time?: string;
  venue?: string;
}

export function getWaMessage({
  guestName,
  invitationLink,
  groomName = config.groom.fullName,
  brideName = config.bride.fullName,
  date = "29 Mei 2026",
  time = "09:30 - 10:30 WIB",
  venue = "Nawasena Garden Resto & Ballroom, Jl. H. Agus Salim No.90, Pandean, Kec. Manguharjo, Kota Madiun, Jawa Timur 63129",
}: WaMessageParams): string {
  const message = [
    `Assalamu'alaikum Warahmatullahi Wabarakatuh,`,
    ``,
    `Kepada Yth. ${guestName}`,
    ``,
    `Tanpa mengurangi rasa hormat, kami mengundang Bapak/Ibu/Saudara/i untuk menghadiri acara pernikahan kami:`,
    ``,
    `*${groomName}* & *${brideName}*`,
    ``,
    `*Hari & Tanggal:* ${date}`,
    `*Jam:* ${time}`,
    `*Lokasi:* ${venue}`,
    ``,
    `Link undangan lengkap:`,
    `${invitationLink}`,
    ``,
    `Merupakan suatu kehormatan dan kebahagiaan apabila Bapak/Ibu/Saudara/i berkenan hadir untuk memberikan doa restu.`,
    ``,
    `Terima kasih atas perhatiannya.`,
    `Wassalamu'alaikum Warahmatullahi Wabarakatuh.`,
  ].join("\n");

  return message;
}

export function getWaUrl(phone: string, message: string): string {
  const cleaned = phone.replace(/[^0-9]/g, "");
  const prefix = cleaned.startsWith("0") ? "62" + cleaned.slice(1) : cleaned.startsWith("62") ? cleaned : "62" + cleaned;
  return `https://wa.me/${prefix}?text=${encodeURIComponent(message)}`;
}
