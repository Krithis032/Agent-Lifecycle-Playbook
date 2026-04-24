import PptxGenJS from 'pptxgenjs';

const NAVY = '0A1628';
const WHITE = 'FFFFFF';
const ACCENT = '3B82F6';
const ACCENT_SOFT = 'DBEAFE';
const GRAY = '94A3B8';
const DARK = '1E293B';
const MED = '475569';
const SUCCESS = '16A34A';
const TABLE_STRIPE = 'F1F5F9';
const COPYRIGHT = '\u00a9 2026 Padmasani Srimadhan. All rights reserved.';

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

import { safeParseJSON, sanitizeText, capArray } from './safe-json';

function truncate(text: string, max: number): string {
  if (!text || text.length <= max) return text || '';
  return text.substring(0, max - 3) + '...';
}

function addFooter(slide: PptxGenJS.Slide, projectName?: string) {
  slide.addText(COPYRIGHT, {
    x: 0.8, y: 5.2, w: 4, h: 0.2,
    fontSize: 6, fontFace: 'Calibri', color: GRAY, italic: true,
  });
  if (projectName) {
    slide.addText(truncate(projectName, 40), {
      x: 5, y: 5.2, w: 4.5, h: 0.2,
      fontSize: 6, fontFace: 'Calibri', color: MED, italic: true, align: 'right',
    });
  }
}

function addHeader(slide: PptxGenJS.Slide, text: string) {
  // Navy bar
  slide.addShape('rect' as never, { x: 0, y: 0, w: 10, h: 0.7, fill: { color: NAVY } });
  // Accent top stripe
  slide.addShape('rect' as never, { x: 0, y: 0, w: 10, h: 0.04, fill: { color: ACCENT } });
  // Section title
  slide.addText(text, {
    x: 0.8, y: 0.1, w: 8.4, h: 0.5,
    fontSize: 13, fontFace: 'Calibri', color: WHITE, bold: true,
  });
}

// ── Table slide renderer ──
function addTableSlide(
  pptx: PptxGenJS,
  label: string,
  rows: Record<string, string>[],
  columns: { key: string; header: string }[],
  projectName: string
) {
  const s = pptx.addSlide();
  s.background = { color: WHITE };
  addHeader(s, label.toUpperCase());

  // Build pptxgenjs table data
  const headerRowData: PptxGenJS.TableCell[] = columns.map(col => ({
    text: truncate(col.header, 20),
    options: {
      bold: true,
      fontSize: 8,
      fontFace: 'Calibri',
      color: WHITE,
      fill: { color: DARK },
      border: [
        { type: 'solid' as const, pt: 0.5, color: '334155' },
        { type: 'solid' as const, pt: 0.5, color: '334155' },
        { type: 'solid' as const, pt: 0.5, color: '334155' },
        { type: 'solid' as const, pt: 0.5, color: '334155' },
      ] as [PptxGenJS.BorderProps, PptxGenJS.BorderProps, PptxGenJS.BorderProps, PptxGenJS.BorderProps],
      valign: 'middle' as const,
      align: 'left' as const,
    },
  }));

  const dataRowsData: PptxGenJS.TableCell[][] = rows.slice(0, 12).map((row, rIdx) =>
    columns.map(col => ({
      text: truncate(row[col.key] || '', 35),
      options: {
        fontSize: 7,
        fontFace: 'Calibri',
        color: DARK,
        fill: rIdx % 2 === 0 ? { color: TABLE_STRIPE } : undefined,
        border: [
          { type: 'solid' as const, pt: 0.3, color: 'CBD5E1' },
          { type: 'solid' as const, pt: 0.3, color: 'CBD5E1' },
          { type: 'solid' as const, pt: 0.3, color: 'CBD5E1' },
          { type: 'solid' as const, pt: 0.3, color: 'CBD5E1' },
        ] as [PptxGenJS.BorderProps, PptxGenJS.BorderProps, PptxGenJS.BorderProps, PptxGenJS.BorderProps],
        valign: 'top' as const,
        align: 'left' as const,
      },
    }))
  );

  s.addTable([headerRowData, ...dataRowsData], {
    x: 0.5,
    y: 0.9,
    w: 9.0,
    colW: columns.map(() => 9.0 / columns.length),
    border: { type: 'solid', pt: 0.3, color: 'CBD5E1' },
    autoPage: false,
  });

  if (rows.length > 12) {
    s.addText(`Showing 12 of ${rows.length} rows`, {
      x: 0.5, y: 4.9, w: 9, h: 0.2,
      fontSize: 7, fontFace: 'Calibri', color: GRAY, italic: true, align: 'right',
    });
  }

  addFooter(s, projectName);
}

// ── Repeatable entries slide ──
function addRepeatableSlide(
  pptx: PptxGenJS,
  label: string,
  entries: Record<string, string>[],
  subFields: { key: string; label: string }[],
  projectName: string
) {
  const s = pptx.addSlide();
  s.background = { color: WHITE };
  addHeader(s, label.toUpperCase());

  let y = 0.95;
  const shown = entries.slice(0, 5);
  for (let i = 0; i < shown.length; i++) {
    if (y > 4.6) break;
    const entry = shown[i];

    // Entry badge
    s.addShape('roundRect' as never, {
      x: 0.6, y, w: 0.5, h: 0.22,
      fill: { color: ACCENT },
      rectRadius: 0.05,
    });
    s.addText(`#${i + 1}`, {
      x: 0.6, y, w: 0.5, h: 0.22,
      fontSize: 7, fontFace: 'Calibri', color: WHITE, bold: true, align: 'center', valign: 'middle',
    });

    let fieldY = y;
    const fieldX = 1.2;

    for (const sf of subFields) {
      const val = entry[sf.key] || '';
      if (!val || fieldY > 4.8) continue;

      s.addText([
        { text: `${sf.label}: `, options: { fontSize: 8, fontFace: 'Calibri', color: ACCENT, bold: true } },
        { text: truncate(val, 80), options: { fontSize: 8, fontFace: 'Calibri', color: DARK } },
      ], {
        x: fieldX, y: fieldY, w: 8.2, h: 0.22,
        valign: 'top',
      });
      fieldY += 0.22;
    }

    y = fieldY + 0.15;

    // Separator line
    if (i < shown.length - 1 && y < 4.6) {
      s.addShape('line' as never, {
        x: 0.8, y, w: 8.4, h: 0,
        line: { color: ACCENT_SOFT, width: 0.5, dashType: 'dash' },
      });
      y += 0.1;
    }
  }

  if (entries.length > 5) {
    s.addText(`Showing 5 of ${entries.length} entries`, {
      x: 0.5, y: 4.9, w: 9, h: 0.2,
      fontSize: 7, fontFace: 'Calibri', color: GRAY, italic: true, align: 'right',
    });
  }

  addFooter(s, projectName);
}

// ── Checkbox slide ──
function addCheckboxSlide(
  pptx: PptxGenJS,
  sectionTitle: string,
  items: { label: string; checked: boolean; rationale: string }[],
  projectName: string
) {
  const s = pptx.addSlide();
  s.background = { color: WHITE };
  addHeader(s, sectionTitle);

  let y = 0.95;
  for (const item of items.slice(0, 10)) {
    if (y > 4.6) break;

    const symbol = item.checked ? '\u2611' : '\u2610';
    const symbolColor = item.checked ? SUCCESS : GRAY;

    s.addText([
      { text: `${symbol} `, options: { fontSize: 11, fontFace: 'Calibri', color: symbolColor, bold: true } },
      { text: item.label, options: { fontSize: 9, fontFace: 'Calibri', color: DARK, bold: item.checked } },
    ], {
      x: 0.6, y, w: 8.8, h: 0.25,
      valign: 'middle',
    });
    y += 0.28;

    if (item.rationale?.trim()) {
      s.addText(`Rationale: ${truncate(item.rationale, 100)}`, {
        x: 1.1, y, w: 8.3, h: 0.2,
        fontSize: 7, fontFace: 'Calibri', color: MED, italic: true, valign: 'top',
      });
      y += 0.22;
    }
  }

  addFooter(s, projectName);
}

// ── Main PPTX Generator ──
export async function generateProjectPptx(
  projectName: string,
  projectDescription: string,
  sections: ReportSection[],
  meta: { status: string; framework?: string; architecture?: string; createdAt: string }
): Promise<Buffer> {
  const pptx = new PptxGenJS();
  pptx.author = 'Padmasani Srimadhan';
  pptx.company = 'Agent Deployment Playbook';
  pptx.title = projectName;

  // ── Title Slide ──
  const t = pptx.addSlide();
  t.background = { color: NAVY };

  // Top accent stripe
  t.addShape('rect' as never, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: ACCENT } });

  // Branding
  t.addText('AGENT DEPLOYMENT PLAYBOOK', {
    x: 0.8, y: 0.6, w: 8.4, h: 0.3,
    fontSize: 10, fontFace: 'Calibri', color: ACCENT, bold: true,
  });

  // Accent underline
  t.addShape('line' as never, {
    x: 0.8, y: 0.95, w: 3, h: 0,
    line: { color: ACCENT, width: 1.5 },
  });

  // Project name
  t.addText(projectName, {
    x: 0.8, y: 1.3, w: 8.4, h: 1.4,
    fontSize: 32, fontFace: 'Calibri', color: WHITE, bold: true,
  });

  // Description
  t.addText(projectDescription || 'Project Summary Report', {
    x: 0.8, y: 2.9, w: 8.4, h: 0.6,
    fontSize: 13, fontFace: 'Calibri', color: GRAY,
  });

  // Meta badges
  const metaParts = [
    `Status: ${meta.status.toUpperCase()}`,
    meta.framework ? `Framework: ${meta.framework}` : '',
    meta.architecture ? `Pattern: ${meta.architecture}` : '',
    `Created: ${meta.createdAt}`,
  ].filter(Boolean).join('  \u00b7  ');
  t.addText(metaParts, { x: 0.8, y: 4.0, w: 8.4, h: 0.3, fontSize: 9, fontFace: 'Calibri', color: GRAY });

  // Built by
  t.addText('Built by Padmasani Srimadhan', {
    x: 0.8, y: 4.6, w: 8.4, h: 0.2,
    fontSize: 8, fontFace: 'Calibri', color: MED, italic: true,
  });

  addFooter(t, projectName);

  // ── Table of Contents Slide ──
  if (sections.length > 0) {
    const tocSlide = pptx.addSlide();
    tocSlide.background = { color: WHITE };
    addHeader(tocSlide, 'TABLE OF CONTENTS');

    let tocY = 1.0;
    for (let i = 0; i < Math.min(sections.length, 14); i++) {
      tocSlide.addText([
        { text: `${(i + 1).toString().padStart(2, '0')}  `, options: { fontSize: 10, fontFace: 'Calibri', color: ACCENT, bold: true } },
        { text: sections[i].title, options: { fontSize: 10, fontFace: 'Calibri', color: DARK } },
      ], {
        x: 1.0, y: tocY, w: 8.0, h: 0.28,
        valign: 'middle',
      });
      tocY += 0.3;
    }
    addFooter(tocSlide, projectName);
  }

  // ── Content Slides ──
  for (const section of sections) {
    // Gather complex items for dedicated slides
    const tableItems: ReportItem[] = [];
    const repeatableItems: ReportItem[] = [];
    const checkboxItems: { label: string; checked: boolean; rationale: string }[] = [];
    const simpleItems: ReportItem[] = [];

    for (const item of section.items) {
      const safeValue = sanitizeText(item.value || '');
      const parsed = safeValue ? safeParseJSON(safeValue) : null;

      if (item.type === 'table' && Array.isArray(parsed) && parsed.length > 0) {
        tableItems.push(item);
      } else if (!item.type && Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'object') {
        tableItems.push(item);
      } else if (item.type === 'repeatable' && Array.isArray(parsed) && parsed.length > 0) {
        repeatableItems.push(item);
      } else if (item.type === 'checkbox_with_rationale') {
        let cbData: { checked: boolean; rationale: string };
        if (parsed && typeof parsed === 'object' && 'checked' in (parsed as Record<string, unknown>)) {
          cbData = parsed as { checked: boolean; rationale: string };
          cbData.rationale = sanitizeText(cbData.rationale || '');
        } else {
          cbData = { checked: safeValue === 'true', rationale: '' };
        }
        checkboxItems.push({ label: sanitizeText(item.label), ...cbData });
      } else if (item.type === 'checkbox') {
        checkboxItems.push({ label: sanitizeText(item.label), checked: safeValue === 'true', rationale: '' });
      } else {
        simpleItems.push(item);
      }
    }

    // Simple items slide
    if (simpleItems.length > 0) {
      const s = pptx.addSlide();
      s.background = { color: WHITE };
      addHeader(s, section.title.toUpperCase());
      let y = 1.0;
      for (const item of simpleItems) {
        if (y > 4.6) break;

        // Section divider items
        if (item.label.startsWith('\u2500') && !item.value) {
          s.addShape('line' as never, {
            x: 0.8, y: y + 0.05, w: 1.5, h: 0,
            line: { color: ACCENT, width: 0.5 },
          });
          s.addText(item.label.replace(/\u2500/g, '').trim(), {
            x: 2.5, y, w: 5, h: 0.22,
            fontSize: 9, fontFace: 'Calibri', color: ACCENT, bold: true, valign: 'middle',
          });
          s.addShape('line' as never, {
            x: 7.5, y: y + 0.05, w: 2, h: 0,
            line: { color: ACCENT, width: 0.5 },
          });
          y += 0.3;
          continue;
        }

        // Label
        s.addText(item.label, {
          x: 0.8, y, w: 2.4, h: 0.25,
          fontSize: 9, fontFace: 'Calibri', color: ACCENT, bold: true, valign: 'top',
        });
        // Value
        const lines = Math.min(Math.ceil((item.value || '\u2014').length / 85), 4);
        s.addText(item.value || '\u2014', {
          x: 3.3, y, w: 6.2, h: 0.22 * lines,
          fontSize: 9, fontFace: 'Calibri', color: DARK, valign: 'top',
        });
        y += Math.max(0.3, 0.22 * lines + 0.08);
      }
      addFooter(s, projectName);
    }

    // Table slides
    for (const tableItem of tableItems) {
      const parsed = safeParseJSON(sanitizeText(tableItem.value || ''));
      if (!Array.isArray(parsed) || parsed.length === 0) continue;
      const rows = capArray(parsed as Record<string, string>[]);
      const cols = tableItem.columns || Object.keys(rows[0]).map(k => ({
        key: k,
        header: k.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      }));
      addTableSlide(pptx, `${section.title} \u2014 ${sanitizeText(tableItem.label)}`, rows, cols, projectName);
    }

    // Repeatable slides
    for (const repItem of repeatableItems) {
      const parsed = safeParseJSON(sanitizeText(repItem.value || ''));
      if (!Array.isArray(parsed) || parsed.length === 0) continue;
      const entries = capArray(parsed as Record<string, string>[]);
      const subs = repItem.subFields || Object.keys(entries[0]).map(k => ({
        key: k,
        label: k.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      }));
      addRepeatableSlide(pptx, `${section.title} \u2014 ${sanitizeText(repItem.label)}`, entries, subs, projectName);
    }

    // Checkbox slide
    if (checkboxItems.length > 0) {
      addCheckboxSlide(pptx, `${section.title} \u2014 Checklist`, checkboxItems, projectName);
    }
  }

  // ── Closing Slide ──
  const c = pptx.addSlide();
  c.background = { color: NAVY };
  c.addShape('rect' as never, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: ACCENT } });
  c.addText('End of Report', {
    x: 0.8, y: 1.8, w: 8.4, h: 0.8,
    fontSize: 28, fontFace: 'Calibri', color: WHITE, bold: true, align: 'center',
  });
  c.addText(projectName, {
    x: 0.8, y: 2.7, w: 8.4, h: 0.4,
    fontSize: 14, fontFace: 'Calibri', color: ACCENT, align: 'center',
  });
  c.addText(`Generated by Agent Deployment Playbook \u00b7 ${new Date().toLocaleDateString()}`, {
    x: 0.8, y: 3.3, w: 8.4, h: 0.4,
    fontSize: 11, fontFace: 'Calibri', color: GRAY, align: 'center',
  });
  addFooter(c, projectName);

  const ab = await pptx.write({ outputType: 'arraybuffer' }) as ArrayBuffer;
  return Buffer.from(ab);
}
