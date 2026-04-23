import { jsPDF } from 'jspdf';

const COPYRIGHT = '\u00a9 2026 Padmasani Srimadhan. All rights reserved.';
const ACCENT_HEX: [number, number, number] = [59, 130, 246];
const NAVY_HEX: [number, number, number] = [10, 22, 40];
const GRAY_HEX: [number, number, number] = [148, 163, 184];

interface ReportSection {
  title: string;
  items: { label: string; value: string }[];
}

function addPdfFooter(doc: jsPDF) {
  const pageH = doc.internal.pageSize.getHeight();
  const pageW = doc.internal.pageSize.getWidth();
  doc.setDrawColor(...GRAY_HEX);
  doc.line(20, pageH - 18, pageW - 20, pageH - 18);
  doc.setFontSize(7);
  doc.setTextColor(...GRAY_HEX);
  doc.text(COPYRIGHT, 20, pageH - 12);
  doc.text(`Page ${doc.getNumberOfPages()}`, pageW - 35, pageH - 12);
}

export function generateProjectPdf(
  projectName: string,
  projectDescription: string,
  sections: ReportSection[],
  meta: { status: string; framework?: string; architecture?: string; createdAt: string }
): Buffer {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();

  // ── Title Page ──
  doc.setFillColor(...NAVY_HEX);
  doc.rect(0, 0, pageW, 100, 'F');

  doc.setFontSize(10);
  doc.setTextColor(...ACCENT_HEX);
  doc.text('AGENT DEPLOYMENT PLAYBOOK', 20, 30);

  doc.setFontSize(26);
  doc.setTextColor(255, 255, 255);
  doc.text(projectName, 20, 50, { maxWidth: pageW - 40 });

  doc.setFontSize(11);
  doc.setTextColor(...GRAY_HEX);
  doc.text(projectDescription || 'Project Summary Report', 20, 70, { maxWidth: pageW - 40 });

  const metaLine = [
    `Status: ${meta.status}`,
    meta.framework ? `Framework: ${meta.framework}` : '',
    meta.architecture ? `Pattern: ${meta.architecture}` : '',
    `Created: ${meta.createdAt}`,
  ].filter(Boolean).join('  \u00b7  ');
  doc.setFontSize(8);
  doc.text(metaLine, 20, 88);

  doc.setFontSize(9);
  doc.setTextColor(...GRAY_HEX);
  doc.text('Built by Padmasani Srimadhan', 20, 115);
  doc.text(COPYRIGHT, 20, 122);

  addPdfFooter(doc);

  // ── Content Pages ──
  for (const section of sections) {
    doc.addPage();
    // Header
    doc.setFillColor(...NAVY_HEX);
    doc.rect(0, 0, pageW, 16, 'F');
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.text(section.title.toUpperCase(), 20, 11);

    let y = 26;
    for (const item of section.items) {
      if (y > 265) { doc.addPage(); y = 20; }
      doc.setFontSize(9);
      doc.setTextColor(...ACCENT_HEX);
      doc.setFont('helvetica', 'bold');
      doc.text(item.label, 20, y);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(51, 65, 85);
      const val = item.value || '\u2014';
      const split = doc.splitTextToSize(val, pageW - 85);
      doc.text(split, 70, y);
      y += Math.max(7, split.length * 5 + 3);
    }
    addPdfFooter(doc);
  }

  const arrayBuffer = doc.output('arraybuffer');
  return Buffer.from(arrayBuffer);
}
