import { jsPDF } from 'jspdf';

const COPYRIGHT = '\u00a9 2026 Padmasani Srimadhan. All rights reserved.';

// ── Professional Color Palette ──
const NAVY: [number, number, number] = [10, 22, 40];
const ACCENT: [number, number, number] = [59, 130, 246];
const WHITE: [number, number, number] = [255, 255, 255];
const DARK_TEXT: [number, number, number] = [30, 41, 59];
const MED_TEXT: [number, number, number] = [71, 85, 105];
const LIGHT_TEXT: [number, number, number] = [148, 163, 184];
const SUCCESS: [number, number, number] = [22, 163, 74];
const TABLE_HEADER_BG: [number, number, number] = [30, 41, 59];
const TABLE_STRIPE: [number, number, number] = [248, 250, 252];
const TABLE_BORDER: [number, number, number] = [226, 232, 240];
const DIVIDER: [number, number, number] = [203, 213, 225];
const LABEL_BG: [number, number, number] = [241, 245, 249];

// ── Enhanced interfaces ──
interface ReportItem {
  label: string;
  value: string;
  type?: string;
  columns?: { key: string; header: string }[];
  subFields?: { key: string; label: string }[];
}

interface ReportSection {
  title: string;
  items: ReportItem[];
}

import { safeParseJSON, sanitizeText, capArray } from './safe-json';

// ── Helpers ──

function truncate(text: string, maxLen: number): string {
  if (!text || text.length <= maxLen) return text || '';
  return text.substring(0, maxLen - 3) + '...';
}

function addPageFooter(doc: jsPDF, projectName: string) {
  const pageH = doc.internal.pageSize.getHeight();
  const pageW = doc.internal.pageSize.getWidth();
  doc.setDrawColor(...DIVIDER);
  doc.setLineWidth(0.3);
  doc.line(20, pageH - 20, pageW - 20, pageH - 20);
  doc.setFontSize(7);
  doc.setTextColor(...LIGHT_TEXT);
  doc.text(COPYRIGHT, 20, pageH - 14);
  doc.setTextColor(...MED_TEXT);
  doc.text(truncate(projectName, 50), pageW / 2, pageH - 14, { align: 'center' });
  doc.setTextColor(...LIGHT_TEXT);
  doc.text(`Page ${doc.getNumberOfPages()}`, pageW - 25, pageH - 14, { align: 'right' });
}

function addSectionHeader(doc: jsPDF, title: string, y: number): number {
  const pageW = doc.internal.pageSize.getWidth();
  doc.setFillColor(...NAVY);
  doc.roundedRect(15, y - 1, pageW - 30, 12, 2, 2, 'F');
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...WHITE);
  doc.text(title.toUpperCase(), 22, y + 7);
  return y + 16;
}

function checkPageBreak(doc: jsPDF, y: number, needed: number, projectName: string): number {
  if (y + needed > 265) {
    addPageFooter(doc, projectName);
    doc.addPage();
    return 22;
  }
  return y;
}

// ── Markdown-aware text rendering ──
// Parses basic markdown: ## headings, **bold**, - bullet lists, 1. numbered lists
// and renders them with proper PDF formatting instead of raw symbols.

interface MdBlock {
  type: 'heading' | 'bold_paragraph' | 'paragraph' | 'bullet' | 'numbered';
  level?: number; // heading level 1-3
  text: string;
  number?: string; // for numbered items like "1."
}

function parseMarkdown(text: string): MdBlock[] {
  if (!text) return [];
  const lines = text.split('\n');
  const blocks: MdBlock[] = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    // ## Heading
    const headingMatch = line.match(/^(#{1,3})\s+(.+)/);
    if (headingMatch) {
      blocks.push({ type: 'heading', level: headingMatch[1].length, text: stripMarkdownInline(headingMatch[2]) });
      continue;
    }

    // Numbered list: "1. text" or "1) text"
    const numMatch = line.match(/^(\d+)[.)]\s+(.+)/);
    if (numMatch) {
      blocks.push({ type: 'numbered', number: numMatch[1] + '.', text: stripMarkdownInline(numMatch[2]) });
      continue;
    }

    // Bullet list: "- text" or "* text"
    const bulletMatch = line.match(/^[-*]\s+(.+)/);
    if (bulletMatch) {
      blocks.push({ type: 'bullet', text: stripMarkdownInline(bulletMatch[1]) });
      continue;
    }

    // Check if entire line is bold: **text**
    const fullBoldMatch = line.match(/^\*\*(.+)\*\*$/);
    if (fullBoldMatch) {
      blocks.push({ type: 'bold_paragraph', text: stripMarkdownInline(fullBoldMatch[1]) });
      continue;
    }

    // Regular paragraph (strip inline markdown)
    blocks.push({ type: 'paragraph', text: stripMarkdownInline(line) });
  }

  return blocks;
}

// Strip inline markdown symbols: **bold** → bold, *italic* → italic, `code` → code
function stripMarkdownInline(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1')  // **bold**
    .replace(/\*(.+?)\*/g, '$1')       // *italic*
    .replace(/`(.+?)`/g, '$1')         // `code`
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // [link](url)
    .replace(/^#+\s*/, '');            // leftover # in headings
}

// Render parsed markdown blocks into PDF
function renderMarkdownText(
  doc: jsPDF,
  text: string,
  startY: number,
  projectName: string,
  maxWidth: number = 155,
  startX: number = 20
): number {
  const blocks = parseMarkdown(text);
  let y = startY;

  for (const block of blocks) {
    switch (block.type) {
      case 'heading': {
        const fontSize = block.level === 1 ? 11 : block.level === 2 ? 10 : 9;
        y = checkPageBreak(doc, y, 10, projectName);
        y += 2;
        doc.setFontSize(fontSize);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...NAVY);
        const hLines = doc.splitTextToSize(block.text, maxWidth);
        doc.text(hLines, startX, y);
        y += hLines.length * (fontSize * 0.45) + 3;
        // Subtle underline for h1/h2
        if (block.level && block.level <= 2) {
          doc.setDrawColor(...DIVIDER);
          doc.setLineWidth(0.2);
          doc.line(startX, y - 1, startX + Math.min(doc.getTextWidth(block.text), maxWidth), y - 1);
          y += 1;
        }
        break;
      }
      case 'bold_paragraph': {
        y = checkPageBreak(doc, y, 8, projectName);
        doc.setFontSize(8.5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...DARK_TEXT);
        const bLines = doc.splitTextToSize(block.text, maxWidth);
        doc.text(bLines, startX, y);
        y += bLines.length * 3.8 + 2;
        break;
      }
      case 'bullet': {
        y = checkPageBreak(doc, y, 6, projectName);
        doc.setFontSize(8);
        doc.setTextColor(...ACCENT);
        doc.text('\u2022', startX + 2, y);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...DARK_TEXT);
        const bulletLines = doc.splitTextToSize(block.text, maxWidth - 8);
        doc.text(bulletLines, startX + 7, y);
        y += bulletLines.length * 3.5 + 1.5;
        break;
      }
      case 'numbered': {
        y = checkPageBreak(doc, y, 6, projectName);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...ACCENT);
        doc.text(block.number || '', startX + 1, y);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...DARK_TEXT);
        const numLines = doc.splitTextToSize(block.text, maxWidth - 10);
        doc.text(numLines, startX + 9, y);
        y += numLines.length * 3.5 + 1.5;
        break;
      }
      default: { // paragraph
        y = checkPageBreak(doc, y, 6, projectName);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...DARK_TEXT);
        const pLines = doc.splitTextToSize(block.text, maxWidth);
        doc.text(pLines, startX, y);
        y += pLines.length * 3.5 + 1.5;
        break;
      }
    }
  }

  return y;
}

// Check if text contains markdown syntax
function hasMarkdown(text: string): boolean {
  if (!text) return false;
  return /(\*\*.+?\*\*|^#{1,3}\s|^[-*]\s|^\d+[.)]\s)/m.test(text);
}


// ── Table Renderer ──
function renderTable(
  doc: jsPDF,
  rows: Record<string, string>[],
  columns: { key: string; header: string }[],
  startY: number,
  projectName: string
): number {
  const pageW = doc.internal.pageSize.getWidth();
  const tableW = pageW - 40;
  const colCount = columns.length;
  const colW = tableW / colCount;
  const cellPadding = 2;
  let y = startY;

  // Header row
  y = checkPageBreak(doc, y, 10, projectName);
  doc.setFillColor(...TABLE_HEADER_BG);
  doc.roundedRect(20, y, tableW, 8, 1, 1, 'F');
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...WHITE);
  for (let i = 0; i < colCount; i++) {
    const headerText = truncate(columns[i].header, Math.floor(colW / 1.8));
    doc.text(headerText, 20 + i * colW + cellPadding, y + 5.5);
  }
  y += 9;

  // Data rows
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  for (let r = 0; r < rows.length; r++) {
    let maxLines = 1;
    const cellTexts: string[][] = [];
    for (let c = 0; c < colCount; c++) {
      const cellVal = stripMarkdownInline(rows[r][columns[c].key] || '');
      const lines = doc.splitTextToSize(cellVal, colW - cellPadding * 2 - 1);
      cellTexts.push(lines);
      maxLines = Math.max(maxLines, lines.length);
    }
    const rowH = Math.max(7, maxLines * 3.5 + 2);

    y = checkPageBreak(doc, y, rowH + 2, projectName);

    if (r % 2 === 0) {
      doc.setFillColor(...TABLE_STRIPE);
      doc.rect(20, y, tableW, rowH, 'F');
    }

    doc.setDrawColor(...TABLE_BORDER);
    doc.setLineWidth(0.2);
    doc.rect(20, y, tableW, rowH);
    for (let i = 1; i < colCount; i++) {
      doc.line(20 + i * colW, y, 20 + i * colW, y + rowH);
    }

    doc.setTextColor(...DARK_TEXT);
    for (let c = 0; c < colCount; c++) {
      const lines = cellTexts[c];
      for (let l = 0; l < Math.min(lines.length, 6); l++) {
        doc.text(lines[l], 20 + c * colW + cellPadding, y + 3.5 + l * 3.5);
      }
    }
    y += rowH;
  }

  return y + 4;
}

// ── Repeatable Entries Renderer ──
function renderRepeatable(
  doc: jsPDF,
  entries: Record<string, string>[],
  subFields: { key: string; label: string }[],
  startY: number,
  projectName: string
): number {
  let y = startY;

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    y = checkPageBreak(doc, y, 20, projectName);

    // Entry number badge
    doc.setFillColor(...ACCENT);
    doc.roundedRect(22, y, 14, 5, 1.5, 1.5, 'F');
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...WHITE);
    doc.text(`#${i + 1}`, 25, y + 3.7);
    y += 8;

    for (const sf of subFields) {
      const val = entry[sf.key] || '';
      if (!val) continue;

      y = checkPageBreak(doc, y, 10, projectName);

      // Sub-field label
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...ACCENT);
      doc.text(sf.label + ':', 28, y);
      y += 4;

      // Sub-field value with markdown support
      if (hasMarkdown(val)) {
        y = renderMarkdownText(doc, val, y, projectName, 128, 28);
      } else {
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...DARK_TEXT);
        doc.setFontSize(7.5);
        const valLines = doc.splitTextToSize(val, 128);
        doc.text(valLines.slice(0, 8), 28, y);
        y += Math.max(4, valLines.length * 3.5 + 1);
      }
    }

    if (i < entries.length - 1) {
      y = checkPageBreak(doc, y, 5, projectName);
      doc.setDrawColor(...DIVIDER);
      doc.setLineWidth(0.2);
      doc.setLineDashPattern([2, 2], 0);
      doc.line(28, y, 170, y);
      doc.setLineDashPattern([], 0);
      y += 4;
    }
  }

  return y + 3;
}

// ── Checkbox with Rationale Renderer ──
function renderCheckboxWithRationale(
  doc: jsPDF,
  label: string,
  data: { checked: boolean; rationale: string },
  startY: number,
  projectName: string
): number {
  let y = checkPageBreak(doc, startY, 12, projectName);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  if (data.checked) {
    doc.setTextColor(...SUCCESS);
    doc.text('\u2713', 22, y);
  } else {
    doc.setTextColor(...LIGHT_TEXT);
    doc.text('\u2717', 22, y);
  }

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...DARK_TEXT);
  doc.text(label, 29, y);
  y += 5;

  if (data.rationale?.trim()) {
    y = checkPageBreak(doc, y, 8, projectName);
    doc.setFontSize(7.5);
    doc.setTextColor(...MED_TEXT);
    doc.setFont('helvetica', 'italic');
    const rLines = doc.splitTextToSize(`Rationale: ${data.rationale}`, 140);
    doc.text(rLines.slice(0, 4), 29, y);
    doc.setFont('helvetica', 'normal');
    y += rLines.length * 3.5 + 2;
  }

  return y + 2;
}

// ── Render a key-value field with proper label/value layout ──
function renderKeyValueField(
  doc: jsPDF,
  label: string,
  rawValue: string,
  y: number,
  projectName: string,
  pageW: number
): number {
  y = checkPageBreak(doc, y, 12, projectName);

  const cleanLabel = sanitizeText(label);
  const contentWidth = pageW - 42;

  // Label with subtle background
  doc.setFillColor(...LABEL_BG);
  doc.roundedRect(20, y - 3, doc.getTextWidth(cleanLabel) * 1.15 + 6, 5.5, 1, 1, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...ACCENT);
  doc.text(cleanLabel, 22, y);
  y += 5;

  // Value — check for markdown content
  if (hasMarkdown(rawValue)) {
    y = renderMarkdownText(doc, rawValue, y, projectName, contentWidth, 22);
  } else {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...DARK_TEXT);
    doc.setFontSize(8);
    const displayVal = rawValue || '\u2014';
    const valLines = doc.splitTextToSize(displayVal, contentWidth);
    doc.text(valLines.slice(0, 20), 22, y);
    y += Math.max(5, Math.min(valLines.length, 20) * 3.5 + 2);
  }

  return y + 1;
}


// ── Main PDF Generator ──
export function generateProjectPdf(
  projectName: string,
  projectDescription: string,
  sections: ReportSection[],
  meta: { status: string; framework?: string; architecture?: string; createdAt: string }
): Buffer {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();

  // ────────────────────────────────────────────
  // TITLE PAGE
  // ────────────────────────────────────────────

  // Full-width navy hero
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, pageW, 105, 'F');

  // Accent bar at very top
  doc.setFillColor(...ACCENT);
  doc.rect(0, 0, pageW, 3, 'F');

  // Branding
  doc.setFontSize(9);
  doc.setTextColor(...ACCENT);
  doc.setFont('helvetica', 'bold');
  doc.text('AGENT DEPLOYMENT PLAYBOOK', 25, 25);
  doc.setDrawColor(...ACCENT);
  doc.setLineWidth(0.5);
  doc.line(25, 28, 90, 28);

  // Project Name (large)
  doc.setFontSize(28);
  doc.setTextColor(...WHITE);
  doc.setFont('helvetica', 'bold');
  const titleLines = doc.splitTextToSize(projectName, pageW - 50);
  doc.text(titleLines, 25, 45);

  // Description
  const descY = 45 + titleLines.length * 12;
  doc.setFontSize(11);
  doc.setTextColor(...LIGHT_TEXT);
  doc.setFont('helvetica', 'normal');
  const descLines = doc.splitTextToSize(projectDescription || 'Project Summary Report', pageW - 50);
  doc.text(descLines.slice(0, 3), 25, descY);

  // Meta info badges
  const metaY = 115;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  const metaParts = [
    { label: 'STATUS', value: meta.status.toUpperCase() },
    meta.framework ? { label: 'FRAMEWORK', value: meta.framework } : null,
    meta.architecture ? { label: 'ARCHITECTURE', value: meta.architecture } : null,
    { label: 'GENERATED', value: meta.createdAt },
  ].filter(Boolean) as { label: string; value: string }[];

  let metaX = 25;
  for (const mp of metaParts) {
    doc.setFillColor(...TABLE_STRIPE);
    const badgeW = Math.max(doc.getTextWidth(`${mp.label}: ${mp.value}`) + 8, 30);
    doc.roundedRect(metaX, metaY, badgeW, 8, 2, 2, 'F');
    doc.setTextColor(...ACCENT);
    doc.setFont('helvetica', 'bold');
    doc.text(mp.label + ':', metaX + 3, metaY + 5.5);
    doc.setTextColor(...DARK_TEXT);
    doc.setFont('helvetica', 'normal');
    doc.text(mp.value, metaX + 3 + doc.getTextWidth(mp.label + ': '), metaY + 5.5);
    metaX += badgeW + 4;
  }

  // Built by line
  doc.setFontSize(8);
  doc.setTextColor(...LIGHT_TEXT);
  doc.text('Built by Padmasani Srimadhan', 25, 135);
  doc.text(COPYRIGHT, 25, 141);

  // Decorative accent line
  doc.setFillColor(...ACCENT);
  doc.rect(0, 148, pageW, 1, 'F');

  // Table of Contents
  if (sections.length > 0) {
    doc.setFontSize(12);
    doc.setTextColor(...NAVY);
    doc.setFont('helvetica', 'bold');
    doc.text('CONTENTS', 25, 162);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    let tocY = 172;
    for (let i = 0; i < sections.length; i++) {
      if (tocY > 275) break;
      doc.setTextColor(...ACCENT);
      doc.text(`${(i + 1).toString().padStart(2, '0')}`, 25, tocY);
      doc.setTextColor(...DARK_TEXT);
      const tocTitle = truncate(sections[i].title, 70);
      doc.text(tocTitle, 35, tocY);
      // Dotted leader line
      doc.setDrawColor(...DIVIDER);
      doc.setLineWidth(0.15);
      doc.setLineDashPattern([1, 1.5], 0);
      const titleW = doc.getTextWidth(tocTitle);
      if (35 + titleW + 5 < pageW - 30) {
        doc.line(35 + titleW + 2, tocY, pageW - 30, tocY);
      }
      doc.setLineDashPattern([], 0);
      tocY += 7;
    }
  }

  addPageFooter(doc, projectName);

  // ────────────────────────────────────────────
  // CONTENT PAGES
  // ────────────────────────────────────────────
  for (const section of sections) {
    doc.addPage();
    let y = addSectionHeader(doc, section.title, 12);
    y += 2;

    for (const item of section.items) {
      const rawValue = sanitizeText(item.value || '');
      const parsed = rawValue ? safeParseJSON(rawValue) : null;

      // ── TABLE DATA ──
      if (item.type === 'table' && item.columns && Array.isArray(parsed)) {
        y = checkPageBreak(doc, y, 15, projectName);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...ACCENT);
        doc.text(sanitizeText(item.label), 20, y);
        y += 5;
        y = renderTable(doc, capArray(parsed as Record<string, string>[]), item.columns, y, projectName);
        continue;
      }

      // ── TABLE DATA (auto-detected) ──
      if (!item.type && Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'object') {
        y = checkPageBreak(doc, y, 15, projectName);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...ACCENT);
        doc.text(sanitizeText(item.label), 20, y);
        y += 5;
        const autoColumns = Object.keys(parsed[0] as Record<string, unknown>).map(k => ({
          key: k,
          header: k.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        }));
        y = renderTable(doc, capArray(parsed as Record<string, string>[]), autoColumns, y, projectName);
        continue;
      }

      // ── REPEATABLE DATA ──
      if (item.type === 'repeatable' && item.subFields && Array.isArray(parsed)) {
        y = checkPageBreak(doc, y, 15, projectName);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...ACCENT);
        doc.text(sanitizeText(item.label), 20, y);
        y += 5;
        y = renderRepeatable(doc, capArray(parsed as Record<string, string>[]), item.subFields, y, projectName);
        continue;
      }

      // ── REPEATABLE DATA (auto-detected) ──
      if (!item.type && Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'object') {
        continue;
      }

      // ── CHECKBOX WITH RATIONALE ──
      if (item.type === 'checkbox_with_rationale') {
        let cbData: { checked: boolean; rationale: string };
        if (parsed && typeof parsed === 'object' && 'checked' in (parsed as Record<string, unknown>)) {
          cbData = parsed as { checked: boolean; rationale: string };
          cbData.rationale = sanitizeText(cbData.rationale || '');
        } else {
          cbData = { checked: rawValue === 'true', rationale: '' };
        }
        y = renderCheckboxWithRationale(doc, sanitizeText(item.label), cbData, y, projectName);
        continue;
      }

      // ── SIMPLE CHECKBOX ──
      if (item.type === 'checkbox') {
        y = checkPageBreak(doc, y, 8, projectName);
        doc.setFontSize(9);
        if (rawValue === 'true') {
          doc.setTextColor(...SUCCESS);
          doc.setFont('helvetica', 'bold');
          doc.text('\u2713', 22, y);
        } else {
          doc.setTextColor(...LIGHT_TEXT);
          doc.setFont('helvetica', 'normal');
          doc.text('\u2717', 22, y);
        }
        doc.setTextColor(...DARK_TEXT);
        doc.setFont('helvetica', 'normal');
        doc.text(sanitizeText(item.label), 29, y);
        y += 6;
        continue;
      }

      // ── SECTION DIVIDER ──
      if (item.label.startsWith('\u2500') && !item.value) {
        y = checkPageBreak(doc, y, 10, projectName);
        y += 3;
        doc.setDrawColor(...ACCENT);
        doc.setLineWidth(0.3);
        doc.line(20, y, 60, y);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...ACCENT);
        doc.text(item.label.replace(/\u2500/g, '').trim(), 63, y + 0.5);
        const labelEndX = 63 + doc.getTextWidth(item.label.replace(/\u2500/g, '').trim()) + 3;
        doc.line(labelEndX, y, pageW - 20, y);
        y += 7;
        continue;
      }

      // ── STANDARD KEY-VALUE FIELD (with markdown support) ──
      y = renderKeyValueField(doc, item.label, rawValue, y, projectName, pageW);
    }

    addPageFooter(doc, projectName);
  }

  const arrayBuffer = doc.output('arraybuffer');
  return Buffer.from(arrayBuffer);
}
