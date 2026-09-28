import jsPDF from "jspdf";
import type { Country, Requirement, VisaType } from "@/data/types";

interface PdfRequirementsOptions {
  visaType: VisaType;
  country: Country;
  requirements: Requirement[];
  agencyName?: string;
}

function cleanPdfText(str?: string | null): string {
  if (!str) return "";
  return str
    // Remove surrogate pairs (emojis like flags)
    .replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, "")
    // Remove miscellaneous symbols & pictographs
    .replace(/[\u2600-\u27BF]/g, "")
    // Replace smart quotes and special dashes/dots with standard ASCII
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/[\u00B7\u2022]/g, "|")
    .replace(/\s+/g, " ")
    .trim();
}

export function downloadRequirementsPDF({ visaType, country, requirements, agencyName = "Serendib Visa Services" }: PdfRequirementsOptions) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const PAGE_W = 210;
  const PAGE_H = 297;
  const MARGIN = 18;
  const CONTENT_W = PAGE_W - MARGIN * 2;
  let y = 0;

  // ── helpers ───────────────────────────────────────────────
  const hex2rgb = (hex: string): [number, number, number] => {
    const h = hex.replace("#", "");
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  };
  const rgb = (hex: string) => doc.setTextColor(...hex2rgb(hex));
  const fill = (hex: string) => doc.setFillColor(...hex2rgb(hex));
  const stroke = (hex: string) => doc.setDrawColor(...hex2rgb(hex));

  const ensurePage = (needed = 10) => {
    if (y + needed > PAGE_H - 15) {
      doc.addPage();
      y = MARGIN;
    }
  };

  // ── HEADER ────────────────────────────────────────────────
  fill("#1a5c40");
  doc.rect(0, 0, PAGE_W, 42, "F");

  // Agency name
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  rgb("#a6d9c0");
  doc.text(cleanPdfText(agencyName).toUpperCase(), MARGIN, 14);

  // Country Code badge in header
  const countryCode = cleanPdfText(country.code).toUpperCase();
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  const badgeW = doc.getTextWidth(countryCode) + 8;
  const badgeH = 6;
  fill("#144a33");
  stroke("#2d7d59");
  doc.roundedRect(PAGE_W - MARGIN - badgeW, 10, badgeW, badgeH, 1.5, 1.5, "FD");
  rgb("#d4ede1");
  doc.text(countryCode, PAGE_W - MARGIN - badgeW + 4, 14.2);

  // Visa title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  rgb("#ffffff");
  const mainTitle = `${cleanPdfText(country.name)} - ${cleanPdfText(visaType.category)} Visa`;
  doc.text(mainTitle, MARGIN, 27, { maxWidth: CONTENT_W - badgeW - 10 });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  rgb("#c7e8d8");
  doc.text(`${cleanPdfText(visaType.name)} | Document Checklist`, MARGIN, 36);

  // ── META CHIPS ────────────────────────────────────────────
  y = 52;
  const chips: [string, string][] = [
    ["Processing Time", visaType.processingTime],
    ["Validity", visaType.validity],
    ["Entry", visaType.entry],
    ["Service Fee", `LKR ${visaType.fee.toLocaleString()}`],
    ...(visaType.governmentFee > 0 ? [["Government Fee", `LKR ${visaType.governmentFee.toLocaleString()}`] as [string, string]] : []),
  ];

  let cx = MARGIN;
  const chipH = 13;
  for (const [label, val] of chips) {
    const chipW = Math.max(36, doc.getTextWidth(val) + 14);
    if (cx + chipW > PAGE_W - MARGIN) {
      cx = MARGIN;
      y += chipH + 3;
    }
    fill("#eef6f2");
    stroke("#c5ddd4");
    doc.roundedRect(cx, y, chipW, chipH, 2, 2, "FD");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    rgb("#4a7a63");
    doc.text(label.toUpperCase(), cx + 5, y + 4.5);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    rgb("#1a3d2b");
    doc.text(val, cx + 5, y + 10);

    cx += chipW + 4;
  }
  y += chipH + 10;

  // ── SECTION DIVIDER ───────────────────────────────────────
  const sectionTitle = (title: string) => {
    ensurePage(14);
    fill("#1a5c40");
    doc.rect(MARGIN, y, 3, 7, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    rgb("#1a3d2b");
    doc.text(title, MARGIN + 6, y + 5.5);
    y += 13;
  };

  // ── DOCUMENT REQUIREMENTS ─────────────────────────────────
  const groups = ["Required", "Optional", "Conditional"] as const;
  const groupColors: Record<string, string> = {
    Required: "#16603f",
    Optional: "#5a6472",
    Conditional: "#8a6412",
  };
  const groupBg: Record<string, string> = {
    Required: "#eef6f2",
    Optional: "#f4f5f6",
    Conditional: "#fffbec",
  };
  const groupBorder: Record<string, string> = {
    Required: "#b2ddc7",
    Optional: "#d0d4d8",
    Conditional: "#e2c96d",
  };

  sectionTitle("Required Documents Checklist");

  for (const grp of groups) {
    const items = requirements.filter((r) => r.level === grp);
    if (items.length === 0) continue;

    ensurePage(16);

    // Group header row
    fill(groupBg[grp]);
    stroke(groupBorder[grp]);
    doc.roundedRect(MARGIN, y, CONTENT_W, 8, 2, 2, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    rgb(groupColors[grp]);
    doc.text(`${grp.toUpperCase()} (${items.length})`, MARGIN + 4, y + 5.5);
    y += 11;

    for (let i = 0; i < items.length; i++) {
      const r = items[i];
      const rowH = r.note ? 12 : 9;
      ensurePage(rowH + 3);

      const rowBg = i % 2 === 0 ? "#ffffff" : "#f9faf9";
      fill(rowBg);
      stroke("#e5ebe8");
      doc.rect(MARGIN, y, CONTENT_W, rowH, "FD");

      // Checkbox circle
      stroke("#aec9bc");
      fill("#ffffff");
      doc.circle(MARGIN + 5, y + rowH / 2, 2, "FD");

      // Document name
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      rgb("#1a3d2b");
      doc.text(`${i + 1}. ${cleanPdfText(r.name)}`, MARGIN + 11, y + (r.note ? 5 : rowH / 2 + 1.5));

      // Category badge
      const cleanCat = cleanPdfText(r.category);
      const catW = doc.getTextWidth(cleanCat) + 6;
      fill("#ddeee6");
      doc.roundedRect(PAGE_W - MARGIN - catW - 1, y + 1.5, catW, 5, 1, 1, "F");
      doc.setFont("helvetica", "normal");
      doc.setFontSize(6);
      rgb("#1a5c40");
      doc.text(cleanCat, PAGE_W - MARGIN - catW + 2, y + 5);

      // Note
      if (r.note) {
        doc.setFont("helvetica", "italic");
        doc.setFontSize(7);
        rgb("#6b8f80");
        doc.text(cleanPdfText(r.note), MARGIN + 11, y + 9);
      }

      y += rowH + 1;
    }
    y += 5;
  }

  // ── FOOTER ────────────────────────────────────────────────
  const totalPages = (doc as unknown as { internal: { getNumberOfPages(): number } }).internal.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    fill("#f4f6f5");
    doc.rect(0, PAGE_H - 12, PAGE_W, 12, "F");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    rgb("#7a9a8a");
    doc.text(cleanPdfText(agencyName), MARGIN, PAGE_H - 5);
    doc.text(`Generated: ${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}`, PAGE_W / 2, PAGE_H - 5, { align: "center" });
    doc.text(`Page ${p} of ${totalPages}`, PAGE_W - MARGIN, PAGE_H - 5, { align: "right" });
  }

  // ── SAVE ─────────────────────────────────────────────────
  const filename = `${country.code}_${visaType.category.replace(/\s+/g, "_")}_Requirements.pdf`;
  doc.save(filename);
}
