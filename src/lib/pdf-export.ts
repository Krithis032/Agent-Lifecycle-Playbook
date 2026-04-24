import { jsPDF } from 'jspdf';
import fs from 'fs';
import path from 'path';
import { safeParseJSON, sanitizeText, capArray } from './safe-json';

const COPYRIGHT = '\u00a9 2026 Padmasani Srimadhan. All rights reserved.';

// ── Professional Color Palette (refined) ──
const NAVY: [number, number, number] = [15, 23, 42];
const ACCENT: [number, number, number] = [37, 99, 235];
const ACCENT_LIGHT: [number, number, number] = [96, 165, 250];
const WHITE: [number, number, number] = [255, 255, 255];
const DARK_TEXT: [number, number, number] = [15, 23, 42];
const BODY_TEXT: [number, number, number] = [51, 65, 85];
const MED_TEXT: [number, number, number] = [100, 116, 139];
const LIGHT_TEXT: [number, number, number] = [148, 163, 184];
const SUCCESS: [number, number, number] = [22, 163, 74];
const TABLE_HEADER_BG: [number, number, number] = [30, 41, 59];
const TABLE_STRIPE: [number, number, number] = [248, 250, 252];
const TABLE_BORDER: [number, number, number] = [226, 232, 240];
const DIVIDER: [number, number, number] = [226, 232, 240];
const LABEL_BG: [number, number, number] = [241, 245, 249];
const BULLET_COLOR: [number, number, number] = [37, 99, 235];
const HEADING_RULE: [number, number, number] = [199, 210, 254];

// ── Typography sizes (all +2pt from original) ──
const FONT = {
  TITLE_PAGE_NAME: 30,
  TITLE_PAGE_DESC: 13,
  TITLE_PAGE_BRAND: 11,
  TITLE_PAGE_META: 10,
  TOC_HEADING: 14,
  TOC_ITEM: 11,
  SECTION_HEADER: 13,
  HEADING_1: 13,
  HEADING_2: 12,
  HEADING_3: 11,
  LABEL: 10,
  BODY: 10,
  BODY_BOLD: 10.5,
  BULLET: 10,
  TABLE_HEADER: 9,
  TABLE_BODY: 9,
  FOOTER: 8,
  BADGE: 8,
  EYEBROW: 8,
  CHECKBOX: 11,
  CHECKBOX_RATIONALE: 9.5,
  REPEATABLE_BADGE: 9,
  REPEATABLE_LABEL: 9.5,
  REPEATABLE_VALUE: 9.5,
  DIVIDER_LABEL: 10,
};

// ── Line height multipliers ──
const LH = {
  BODY: 4.2,
  BULLET: 4.2,
  HEADING: 5.5,
  TABLE: 4.0,
  TIGHT: 3.8,
};

// ── Layout constants ──
const MARGIN_L = 22;
const MARGIN_R = 22;
const CONTENT_START_X = MARGIN_L;
const PAGE_BOTTOM = 270;

// ── Interfaces ──
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

interface MdBlock {
  type: 'heading' | 'bold_paragraph' | 'paragraph' | 'bullet' | 'numbered';
  level?: number;
  text: string;
  number?: string;
}

// ── Font Registration ──
function registerUrbanistFonts(doc: jsPDF): boolean {
  try {
    const fontDir = path.join(process.cwd(), 'public/fonts/urbanist');

    const regularPath = path.join(fontDir, 'Urbanist-Regular.ttf');
    const boldPath = path.join(fontDir, 'Urbanist-Bold.ttf');
    const semiBoldPath = path.join(fontDir, 'Urbanist-SemiBold.ttf');
    const italicPath = path.join(fontDir, 'Urbanist-Italic.ttf');

    if (!fs.existsSync(regularPath) || !fs.existsSync(boldPath)) {
      return false;
    }

    const regularBase64 = fs.readFileSync(regularPath).toString('base64');
    const boldBase64 = fs.readFileSync(boldPath).toString('base64');

    doc.addFileToVFS('Urbanist-Regular.ttf', regularBase64);
    doc.addFont('Urbanist-Regular.ttf', 'Urbanist', 'normal');

    doc.addFileToVFS('Urbanist-Bold.ttf', boldBase64);
    doc.addFont('Urbanist-Bold.ttf', 'Urbanist', 'bold');

    if (fs.existsSync(semiBoldPath)) {
      const semiBoldBase64 = fs.readFileSync(semiBoldPath).toString('base64');
      doc.addFileToVFS('Urbanist-SemiBold.ttf', semiBoldBase64);
      doc.addFont('Urbanist-SemiBold.ttf', 'Urbanist', 'normal', 600);
    }

    if (fs.existsSync(italicPath)) {
      const italicBase64 = fs.readFileSync(italicPath).toString('base64');
      doc.addFileToVFS('Urbanist-Italic.ttf', italicBase64);
      doc.addFont('Urbanist-Italic.ttf', 'Urbanist', 'italic');
    }

    return true;
  } catch {
    return false;
  }
}

// ── Helpers ──

function truncate(text: string, maxLen: number): string {
  if (!text || text.length <= maxLen) return text || '';
  return text.substring(0, maxLen - 3) + '...';
}

/** Render lines one by one to avoid jsPDF's text justification / spacing bugs.
 *  Every line is sanitized for safe PDF rendering before being drawn. */
function drawLines(doc: jsPDF, lines: string[], x: number, startY: number, lineHeight: number): number {
  let y = startY;
  for (const line of lines) {
    doc.text(sanitizeForPdf(line), x, y);
    y += lineHeight;
  }
  return y;
}

function getContentWidth(doc: jsPDF): number {
  return doc.internal.pageSize.getWidth() - MARGIN_L - MARGIN_R;
}

function addPageFooter(doc: jsPDF, projectName: string, fontName: string) {
  const pageH = doc.internal.pageSize.getHeight();
  const pageW = doc.internal.pageSize.getWidth();
  doc.setDrawColor(...DIVIDER);
  doc.setLineWidth(0.3);
  doc.line(MARGIN_L, pageH - 18, pageW - MARGIN_R, pageH - 18);
  doc.setFontSize(FONT.FOOTER);
  doc.setFont(fontName, 'normal');
  doc.setTextColor(...LIGHT_TEXT);
  doc.text(COPYRIGHT, MARGIN_L, pageH - 12);
  doc.setTextColor(...MED_TEXT);
  doc.text(truncate(projectName, 50), pageW / 2, pageH - 12, { align: 'center' });
  doc.setTextColor(...LIGHT_TEXT);
  doc.text(`Page ${doc.getNumberOfPages()}`, pageW - MARGIN_R, pageH - 12, { align: 'right' });
}

function addSectionHeader(doc: jsPDF, title: string, y: number, fontName: string): number {
  const pageW = doc.internal.pageSize.getWidth();
  // Navy banner with rounded corners
  doc.setFillColor(...NAVY);
  doc.roundedRect(MARGIN_L - 4, y - 2, pageW - MARGIN_L - MARGIN_R + 8, 14, 2.5, 2.5, 'F');
  // Accent left bar
  doc.setFillColor(...ACCENT);
  doc.roundedRect(MARGIN_L - 4, y - 2, 3, 14, 1.5, 1.5, 'F');
  doc.setFontSize(FONT.SECTION_HEADER);
  doc.setFont(fontName, 'bold');
  doc.setTextColor(...WHITE);
  doc.text(sanitizeForPdf(title.toUpperCase()), MARGIN_L + 4, y + 8);
  return y + 18;
}

function checkPageBreak(doc: jsPDF, y: number, needed: number, projectName: string, fontName: string): number {
  if (y + needed > PAGE_BOTTOM) {
    addPageFooter(doc, projectName, fontName);
    doc.addPage();
    return 24;
  }
  return y;
}

// ── Markdown Parser ──

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

    // Bullet list: "- text" or "* text" or "• text"
    const bulletMatch = line.match(/^[-*\u2022]\s+(.+)/);
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

function stripMarkdownInline(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/`(.+?)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^#+\s*/, '');
}

/**
 * Sanitize text for safe jsPDF rendering.
 * Replaces Unicode characters that are not in the Urbanist/Helvetica glyph tables
 * with ASCII equivalents. Characters the font cannot render cause jsPDF to fall back
 * to character-by-character placement with broken letter-spacing.
 */
function sanitizeForPdf(text: string): string {
  if (!text) return '';
  return text
    // Currency symbols
    .replace(/\u20B9/g, 'Rs.')   // ₹ Indian Rupee
    .replace(/\u20AC/g, 'EUR')   // € Euro
    .replace(/\u00A3/g, 'GBP')   // £ Pound (sometimes missing)
    .replace(/\u00A5/g, 'JPY')   // ¥ Yen
    // Superscript / subscript digits
    .replace(/\u00B9/g, '1')     // ¹
    .replace(/\u00B2/g, '2')     // ²
    .replace(/\u00B3/g, '3')     // ³
    .replace(/\u2070/g, '0')     // ⁰
    .replace(/\u2074/g, '4')     // ⁴
    .replace(/\u2075/g, '5')     // ⁵
    .replace(/\u2076/g, '6')     // ⁶
    .replace(/\u2077/g, '7')     // ⁷
    .replace(/\u2078/g, '8')     // ⁸
    .replace(/\u2079/g, '9')     // ⁹
    // Common typographic replacements
    .replace(/\u2018|\u2019/g, "'")  // Smart quotes → straight
    .replace(/\u201C|\u201D/g, '"')  // Smart double quotes
    .replace(/\u2026/g, '...')       // Ellipsis
    .replace(/\u00AD/g, '')          // Soft hyphen
    // Arrows
    .replace(/\u2192/g, '->')   // →
    .replace(/\u2190/g, '<-')   // ←
    .replace(/\u2194/g, '<->') // ↔
    // Strip any remaining chars > U+2800 that aren't common symbols we use
    // (keeps \u2022 bullet, \u2014 em-dash, \u00b7 middle dot, \u2713/\u2717 check/cross, \u00a9 copyright, \u2500 box drawing)
    .replace(/[\u2800-\uFFFF]/g, '')
    // Also strip markdown asterisks that may have survived parsing
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1');
}

function hasMarkdown(text: string): boolean {
  if (!text) return false;
  return /(\*\*.+?\*\*|^#{1,3}\s|^[-*\u2022]\s|^\d+[.)]\s)/m.test(text);
}

// ── Markdown Renderer ──

function renderMarkdownText(
  doc: jsPDF,
  text: string,
  startY: number,
  projectName: string,
  fontName: string,
  maxWidth: number,
  startX: number = CONTENT_START_X
): number {
  const blocks = parseMarkdown(text);
  let y = startY;

  for (const block of blocks) {
    switch (block.type) {
      case 'heading': {
        const fontSize = block.level === 1 ? FONT.HEADING_1 : block.level === 2 ? FONT.HEADING_2 : FONT.HEADING_3;
        y = checkPageBreak(doc, y, 12, projectName, fontName);
        y += 3;
        doc.setFontSize(fontSize);
        doc.setFont(fontName, 'bold');
        doc.setTextColor(...NAVY);
        const hLines = doc.splitTextToSize(block.text, maxWidth);
        y = drawLines(doc, hLines, startX, y, LH.HEADING);
        // Subtle accent rule under h1/h2
        if (block.level && block.level <= 2) {
          doc.setDrawColor(...HEADING_RULE);
          doc.setLineWidth(0.4);
          doc.line(startX, y - 1, startX + Math.min(doc.getTextWidth(block.text), maxWidth), y - 1);
          y += 2;
        }
        y += 1;
        break;
      }
      case 'bold_paragraph': {
        y = checkPageBreak(doc, y, 10, projectName, fontName);
        doc.setFontSize(FONT.BODY_BOLD);
        doc.setFont(fontName, 'bold');
        doc.setTextColor(...DARK_TEXT);
        const bLines = doc.splitTextToSize(block.text, maxWidth);
        y = drawLines(doc, bLines, startX, y, LH.BODY);
        y += 1.5;
        break;
      }
      case 'bullet': {
        y = checkPageBreak(doc, y, 8, projectName, fontName);
        doc.setFontSize(FONT.BULLET);
        doc.setFont(fontName, 'bold');
        doc.setTextColor(...BULLET_COLOR);
        doc.text('\u2022', startX + 2, y);
        doc.setFont(fontName, 'normal');
        doc.setTextColor(...BODY_TEXT);
        const bulletLines = doc.splitTextToSize(block.text, maxWidth - 10);
        y = drawLines(doc, bulletLines, startX + 8, y, LH.BULLET);
        y += 1;
        break;
      }
      case 'numbered': {
        y = checkPageBreak(doc, y, 8, projectName, fontName);
        doc.setFontSize(FONT.BULLET);
        doc.setFont(fontName, 'bold');
        doc.setTextColor(...ACCENT);
        doc.text(block.number || '', startX + 1, y);
        doc.setFont(fontName, 'normal');
        doc.setTextColor(...BODY_TEXT);
        const numLines = doc.splitTextToSize(block.text, maxWidth - 12);
        y = drawLines(doc, numLines, startX + 10, y, LH.BULLET);
        y += 1;
        break;
      }
      default: {
        y = checkPageBreak(doc, y, 8, projectName, fontName);
        doc.setFontSize(FONT.BODY);
        doc.setFont(fontName, 'normal');
        doc.setTextColor(...BODY_TEXT);
        const pLines = doc.splitTextToSize(block.text, maxWidth);
        y = drawLines(doc, pLines, startX, y, LH.BODY);
        y += 1.5;
        break;
      }
    }
  }

  return y;
}

// ── Table Renderer ──

function renderTable(
  doc: jsPDF,
  rows: Record<string, string>[],
  columns: { key: string; header: string }[],
  startY: number,
  projectName: string,
  fontName: string
): number {
  const contentW = getContentWidth(doc);
  const colCount = columns.length;
  const colW = contentW / colCount;
  const cellPad = 3;
  let y = startY;

  // Header row
  y = checkPageBreak(doc, y, 12, projectName, fontName);
  doc.setFillColor(...TABLE_HEADER_BG);
  doc.roundedRect(MARGIN_L, y, contentW, 10, 1.5, 1.5, 'F');
  doc.setFontSize(FONT.TABLE_HEADER);
  doc.setFont(fontName, 'bold');
  doc.setTextColor(...WHITE);
  for (let i = 0; i < colCount; i++) {
    const headerText = truncate(columns[i].header, Math.floor(colW / 2));
    doc.text(headerText, MARGIN_L + i * colW + cellPad, y + 7);
  }
  y += 11;

  // Data rows
  doc.setFont(fontName, 'normal');
  doc.setFontSize(FONT.TABLE_BODY);
  for (let r = 0; r < rows.length; r++) {
    let maxLines = 1;
    const cellTexts: string[][] = [];
    for (let c = 0; c < colCount; c++) {
      const cellVal = sanitizeForPdf(stripMarkdownInline(rows[r][columns[c].key] || ''));
      const lines = doc.splitTextToSize(cellVal, colW - cellPad * 2 - 1);
      cellTexts.push(lines);
      maxLines = Math.max(maxLines, Math.min(lines.length, 8));
    }
    const rowH = Math.max(8, maxLines * LH.TABLE + 3);

    y = checkPageBreak(doc, y, rowH + 2, projectName, fontName);

    if (r % 2 === 0) {
      doc.setFillColor(...TABLE_STRIPE);
      doc.rect(MARGIN_L, y, contentW, rowH, 'F');
    }

    doc.setDrawColor(...TABLE_BORDER);
    doc.setLineWidth(0.15);
    doc.rect(MARGIN_L, y, contentW, rowH);
    for (let i = 1; i < colCount; i++) {
      doc.line(MARGIN_L + i * colW, y, MARGIN_L + i * colW, y + rowH);
    }

    doc.setTextColor(...BODY_TEXT);
    doc.setFont(fontName, 'normal');
    for (let c = 0; c < colCount; c++) {
      const lines = cellTexts[c];
      for (let l = 0; l < Math.min(lines.length, 8); l++) {
        doc.text(sanitizeForPdf(lines[l]), MARGIN_L + c * colW + cellPad, y + 4 + l * LH.TABLE);
      }
    }
    y += rowH;
  }

  return y + 5;
}

// ── Repeatable Renderer ──

function renderRepeatable(
  doc: jsPDF,
  entries: Record<string, string>[],
  subFields: { key: string; label: string }[],
  startY: number,
  projectName: string,
  fontName: string
): number {
  let y = startY;
  const contentW = getContentWidth(doc);

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    y = checkPageBreak(doc, y, 22, projectName, fontName);

    // Entry number badge
    doc.setFillColor(...ACCENT);
    doc.roundedRect(MARGIN_L + 4, y, 16, 6, 2, 2, 'F');
    doc.setFontSize(FONT.REPEATABLE_BADGE);
    doc.setFont(fontName, 'bold');
    doc.setTextColor(...WHITE);
    doc.text(`#${i + 1}`, MARGIN_L + 7, y + 4.5);
    y += 10;

    for (const sf of subFields) {
      const val = entry[sf.key] || '';
      if (!val) continue;

      y = checkPageBreak(doc, y, 12, projectName, fontName);

      // Sub-field label
      doc.setFontSize(FONT.REPEATABLE_LABEL);
      doc.setFont(fontName, 'bold');
      doc.setTextColor(...ACCENT);
      doc.text(sanitizeForPdf(sf.label) + ':', MARGIN_L + 8, y);
      y += 5;

      // Sub-field value with markdown support
      if (hasMarkdown(val)) {
        y = renderMarkdownText(doc, val, y, projectName, fontName, contentW - 14, MARGIN_L + 8);
      } else {
        doc.setFont(fontName, 'normal');
        doc.setTextColor(...BODY_TEXT);
        doc.setFontSize(FONT.REPEATABLE_VALUE);
        const valLines = doc.splitTextToSize(val, contentW - 14);
        y = drawLines(doc, valLines.slice(0, 10), MARGIN_L + 8, y, LH.BODY);
        y += 1;
      }
    }

    if (i < entries.length - 1) {
      y = checkPageBreak(doc, y, 6, projectName, fontName);
      doc.setDrawColor(...DIVIDER);
      doc.setLineWidth(0.2);
      doc.setLineDashPattern([2, 2], 0);
      const pageW = doc.internal.pageSize.getWidth();
      doc.line(MARGIN_L + 8, y, pageW - MARGIN_R, y);
      doc.setLineDashPattern([], 0);
      y += 5;
    }
  }

  return y + 4;
}

// ── Checkbox Renderers ──

function renderCheckboxWithRationale(
  doc: jsPDF,
  label: string,
  data: { checked: boolean; rationale: string },
  startY: number,
  projectName: string,
  fontName: string
): number {
  let y = checkPageBreak(doc, startY, 14, projectName, fontName);

  doc.setFontSize(FONT.CHECKBOX);
  doc.setFont(fontName, 'bold');
  if (data.checked) {
    doc.setTextColor(...SUCCESS);
    doc.text('\u2713', MARGIN_L, y);
  } else {
    doc.setTextColor(...LIGHT_TEXT);
    doc.text('\u2717', MARGIN_L, y);
  }

  doc.setFontSize(FONT.BODY);
  doc.setFont(fontName, 'normal');
  doc.setTextColor(...DARK_TEXT);
  doc.text(sanitizeForPdf(label), MARGIN_L + 8, y);
  y += 6;

  if (data.rationale?.trim()) {
    y = checkPageBreak(doc, y, 10, projectName, fontName);
    doc.setFontSize(FONT.CHECKBOX_RATIONALE);
    doc.setTextColor(...MED_TEXT);
    doc.setFont(fontName, 'italic');
    const rLines = doc.splitTextToSize(`Rationale: ${data.rationale}`, getContentWidth(doc) - 10);
    y = drawLines(doc, rLines.slice(0, 5), MARGIN_L + 8, y, LH.BODY);
    doc.setFont(fontName, 'normal');
    y += 2;
  }

  return y + 2;
}

// ── Key-Value Field Renderer ──

function renderKeyValueField(
  doc: jsPDF,
  label: string,
  rawValue: string,
  y: number,
  projectName: string,
  fontName: string
): number {
  const contentW = getContentWidth(doc);
  y = checkPageBreak(doc, y, 14, projectName, fontName);

  const cleanLabel = sanitizeForPdf(sanitizeText(label));

  // Label with subtle background pill
  doc.setFontSize(FONT.LABEL);
  doc.setFont(fontName, 'bold');
  const labelW = doc.getTextWidth(cleanLabel);
  doc.setFillColor(...LABEL_BG);
  doc.roundedRect(CONTENT_START_X, y - 3.5, labelW + 8, 6.5, 1.5, 1.5, 'F');
  doc.setTextColor(...ACCENT);
  doc.text(cleanLabel, CONTENT_START_X + 4, y);
  y += 6;

  // Value with markdown awareness
  if (hasMarkdown(rawValue)) {
    y = renderMarkdownText(doc, rawValue, y, projectName, fontName, contentW - 4, CONTENT_START_X + 2);
  } else {
    doc.setFont(fontName, 'normal');
    doc.setTextColor(...BODY_TEXT);
    doc.setFontSize(FONT.BODY);
    const displayVal = rawValue || '\u2014';
    const valLines = doc.splitTextToSize(displayVal, contentW - 4);
    y = drawLines(doc, valLines.slice(0, 25), CONTENT_START_X + 2, y, LH.BODY);
    y += 1;
  }

  return y + 2;
}


// ════════════════════════════════════════════════
// MAIN PDF GENERATOR
// ════════════════════════════════════════════════

export function generateProjectPdf(
  projectName: string,
  projectDescription: string,
  sections: ReportSection[],
  meta: { status: string; framework?: string; architecture?: string; createdAt: string }
): Buffer {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();

  // Register Urbanist font, fall back to helvetica if unavailable
  const hasUrbanist = registerUrbanistFonts(doc);
  const fontName = hasUrbanist ? 'Urbanist' : 'helvetica';

  // ────────────────────────────────────────────
  // COVER PAGE
  // ────────────────────────────────────────────

  // Full-width navy hero area
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, pageW, 110, 'F');

  // Top accent stripe
  doc.setFillColor(...ACCENT);
  doc.rect(0, 0, pageW, 3.5, 'F');

  // Branding eyebrow
  doc.setFontSize(FONT.TITLE_PAGE_BRAND);
  doc.setTextColor(...ACCENT_LIGHT);
  doc.setFont(fontName, 'bold');
  doc.text('AGENT DEPLOYMENT PLAYBOOK', 28, 28);
  doc.setDrawColor(...ACCENT);
  doc.setLineWidth(0.6);
  doc.line(28, 32, 100, 32);

  // Project name (large, white)
  doc.setFontSize(FONT.TITLE_PAGE_NAME);
  doc.setTextColor(...WHITE);
  doc.setFont(fontName, 'bold');
  const titleLines = doc.splitTextToSize(projectName, pageW - 56);
  drawLines(doc, titleLines, 28, 48, 13);

  // Description (lighter, below title)
  const descY = 48 + titleLines.length * 13 + 4;
  doc.setFontSize(FONT.TITLE_PAGE_DESC);
  doc.setTextColor(...LIGHT_TEXT);
  doc.setFont(fontName, 'normal');
  const descLines = doc.splitTextToSize(projectDescription || 'Project Summary Report', pageW - 56);
  drawLines(doc, descLines.slice(0, 3), 28, descY, 5.5);

  // Meta badges
  const metaY = 120;
  doc.setFontSize(FONT.TITLE_PAGE_META);
  const metaParts = [
    { label: 'STATUS', value: meta.status.toUpperCase() },
    meta.framework ? { label: 'FRAMEWORK', value: meta.framework } : null,
    meta.architecture ? { label: 'ARCHITECTURE', value: meta.architecture } : null,
    { label: 'GENERATED', value: meta.createdAt },
  ].filter(Boolean) as { label: string; value: string }[];

  let metaX = 28;
  for (const mp of metaParts) {
    doc.setFont(fontName, 'bold');
    const fullText = `${mp.label}: ${mp.value}`;
    const badgeW = doc.getTextWidth(fullText) + 10;
    doc.setFillColor(...TABLE_STRIPE);
    doc.roundedRect(metaX, metaY, badgeW, 9, 2.5, 2.5, 'F');
    doc.setDrawColor(...DIVIDER);
    doc.setLineWidth(0.15);
    doc.roundedRect(metaX, metaY, badgeW, 9, 2.5, 2.5, 'S');
    doc.setTextColor(...ACCENT);
    doc.text(mp.label + ':', metaX + 4, metaY + 6.2);
    doc.setTextColor(...DARK_TEXT);
    doc.setFont(fontName, 'normal');
    doc.text(mp.value, metaX + 4 + doc.getTextWidth(mp.label + ': '), metaY + 6.2);
    metaX += badgeW + 5;
  }

  // Attribution line
  doc.setFontSize(FONT.TITLE_PAGE_META);
  doc.setTextColor(...MED_TEXT);
  doc.setFont(fontName, 'normal');
  doc.text('Built by Padmasani Srimadhan', 28, 140);
  doc.setTextColor(...LIGHT_TEXT);
  doc.text(COPYRIGHT, 28, 147);

  // Accent divider
  doc.setFillColor(...ACCENT);
  doc.rect(0, 155, pageW, 1.5, 'F');

  // ── Table of Contents ──
  if (sections.length > 0) {
    doc.setFontSize(FONT.TOC_HEADING);
    doc.setTextColor(...NAVY);
    doc.setFont(fontName, 'bold');
    doc.text('CONTENTS', 28, 172);

    // Underline
    doc.setDrawColor(...ACCENT);
    doc.setLineWidth(0.5);
    doc.line(28, 175, 72, 175);

    doc.setFontSize(FONT.TOC_ITEM);
    let tocY = 184;
    for (let i = 0; i < sections.length; i++) {
      if (tocY > PAGE_BOTTOM) break;
      // Number
      doc.setFont(fontName, 'bold');
      doc.setTextColor(...ACCENT);
      doc.text(`${(i + 1).toString().padStart(2, '0')}`, 28, tocY);
      // Title
      doc.setFont(fontName, 'normal');
      doc.setTextColor(...DARK_TEXT);
      const tocTitle = sanitizeForPdf(truncate(sections[i].title, 65));
      doc.text(tocTitle, 40, tocY);
      // Dotted leader
      doc.setDrawColor(...DIVIDER);
      doc.setLineWidth(0.15);
      doc.setLineDashPattern([1, 2], 0);
      const titleW = doc.getTextWidth(tocTitle);
      if (40 + titleW + 6 < pageW - 30) {
        doc.line(40 + titleW + 3, tocY, pageW - 30, tocY);
      }
      doc.setLineDashPattern([], 0);
      tocY += 8;
    }
  }

  addPageFooter(doc, projectName, fontName);

  // ────────────────────────────────────────────
  // CONTENT PAGES
  // ────────────────────────────────────────────
  for (const section of sections) {
    doc.addPage();
    let y = addSectionHeader(doc, section.title, 14, fontName);
    y += 3;

    for (const item of section.items) {
      const rawValue = sanitizeText(item.value || '');
      const parsed = rawValue ? safeParseJSON(rawValue) : null;

      // ── TABLE DATA ──
      if (item.type === 'table' && item.columns && Array.isArray(parsed)) {
        y = checkPageBreak(doc, y, 18, projectName, fontName);
        doc.setFontSize(FONT.LABEL);
        doc.setFont(fontName, 'bold');
        doc.setTextColor(...ACCENT);
        doc.text(sanitizeForPdf(sanitizeText(item.label)), CONTENT_START_X, y);
        y += 6;
        y = renderTable(doc, capArray(parsed as Record<string, string>[]), item.columns, y, projectName, fontName);
        continue;
      }

      // ── TABLE DATA (auto-detected) ──
      if (!item.type && Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'object') {
        y = checkPageBreak(doc, y, 18, projectName, fontName);
        doc.setFontSize(FONT.LABEL);
        doc.setFont(fontName, 'bold');
        doc.setTextColor(...ACCENT);
        doc.text(sanitizeForPdf(sanitizeText(item.label)), CONTENT_START_X, y);
        y += 6;
        const autoColumns = Object.keys(parsed[0] as Record<string, unknown>).map(k => ({
          key: k,
          header: k.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        }));
        y = renderTable(doc, capArray(parsed as Record<string, string>[]), autoColumns, y, projectName, fontName);
        continue;
      }

      // ── REPEATABLE DATA ──
      if (item.type === 'repeatable' && item.subFields && Array.isArray(parsed)) {
        y = checkPageBreak(doc, y, 18, projectName, fontName);
        doc.setFontSize(FONT.LABEL);
        doc.setFont(fontName, 'bold');
        doc.setTextColor(...ACCENT);
        doc.text(sanitizeForPdf(sanitizeText(item.label)), CONTENT_START_X, y);
        y += 6;
        y = renderRepeatable(doc, capArray(parsed as Record<string, string>[]), item.subFields, y, projectName, fontName);
        continue;
      }

      // ── REPEATABLE DATA (auto-detected duplicate guard) ──
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
        y = renderCheckboxWithRationale(doc, sanitizeText(item.label), cbData, y, projectName, fontName);
        continue;
      }

      // ── SIMPLE CHECKBOX ──
      if (item.type === 'checkbox') {
        y = checkPageBreak(doc, y, 10, projectName, fontName);
        doc.setFontSize(FONT.CHECKBOX);
        if (rawValue === 'true') {
          doc.setTextColor(...SUCCESS);
          doc.setFont(fontName, 'bold');
          doc.text('\u2713', MARGIN_L, y);
        } else {
          doc.setTextColor(...LIGHT_TEXT);
          doc.setFont(fontName, 'normal');
          doc.text('\u2717', MARGIN_L, y);
        }
        doc.setTextColor(...DARK_TEXT);
        doc.setFont(fontName, 'normal');
        doc.setFontSize(FONT.BODY);
        doc.text(sanitizeForPdf(sanitizeText(item.label)), MARGIN_L + 8, y);
        y += 7;
        continue;
      }

      // ── SECTION DIVIDER ──
      if (item.label.startsWith('\u2500') && !item.value) {
        y = checkPageBreak(doc, y, 12, projectName, fontName);
        y += 4;
        const dividerLabel = item.label.replace(/\u2500/g, '').trim();
        doc.setDrawColor(...ACCENT_LIGHT);
        doc.setLineWidth(0.3);
        doc.line(CONTENT_START_X, y, 60, y);
        doc.setFontSize(FONT.DIVIDER_LABEL);
        doc.setFont(fontName, 'bold');
        doc.setTextColor(...ACCENT);
        doc.text(sanitizeForPdf(dividerLabel), 63, y + 0.5);
        const labelEndX = 63 + doc.getTextWidth(dividerLabel) + 4;
        doc.line(labelEndX, y, pageW - MARGIN_R, y);
        y += 8;
        continue;
      }

      // ── STANDARD KEY-VALUE FIELD ──
      y = renderKeyValueField(doc, item.label, rawValue, y, projectName, fontName);
    }

    addPageFooter(doc, projectName, fontName);
  }

  const arrayBuffer = doc.output('arraybuffer');
  return Buffer.from(arrayBuffer);
}
