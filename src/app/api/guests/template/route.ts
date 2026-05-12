import { NextResponse } from "next/server";
import * as XLSX from "xlsx";

export async function GET() {
  const wsData = [
    {
      "Nama": "Contoh Tamu 1",
      "No. HP": "081234567890",
      "Email": "tamu1@email.com",
      "Alamat": "Jl. Contoh No. 1, Kota",
      "Kategori": "Keluarga",
      "Catatan": "",
    },
    {
      "Nama": "Contoh Tamu 2",
      "No. HP": "081234567891",
      "Email": "tamu2@email.com",
      "Alamat": "Jl. Contoh No. 2, Kota",
      "Kategori": "Teman",
      "Catatan": "Bawa plus 1",
    },
  ];

  const ws = XLSX.utils.json_to_sheet(wsData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Template");

  ws["!cols"] = [
    { wch: 25 },
    { wch: 18 },
    { wch: 30 },
    { wch: 40 },
    { wch: 15 },
    { wch: 30 },
  ];

  const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="template-import-tamu.xlsx"`,
    },
  });
}
