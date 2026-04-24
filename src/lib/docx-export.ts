import {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  AlignmentType, BorderStyle, Table, TableRow, TableCell,
  WidthType, ShadingType, VerticalAlign,
} from 'docx';

// ── Color palette ──
const NAVY = '0A1628';
const ACCENT = '3B82F6';
const ACCENT_SOFT = 'DBEAFE';
const SUCCESS = '16A34A';
const MUTED = '94A3B8';
const DARK = '1E293B';
const MED = '475569';
const BORDER_COLOR = 'CBD5E1';
const STRIPE = 'F8FAFC';
const HEADER_BG = '1E293B';

// ── Interfaces ──
interface DocxField {
  label: string;
  value: string;
  type: string;
  columns?: { key: string; header: string }[];
  subFields?: { key: string; label: string }[];
}

interface DocxSection {
  sectionName: string;
  fields: DocxField[];
}

// ── Helpers ──
function tryParseJSON(str: string): unknown {
  try { return JSON.parse(str); } catch { return null; }
}

function cellBorders(color = BORDER_COLOR) {
  const border = { style: BorderStyle.SINGLE, size: 1, color };
  return { top: border, bottom: border, left: border, right: border };
}

function buildWordTable(
  rows: Record<string, string>[],
  columns: { key: string; header: string }[]
): Table {
  const colWidths = columns.map(() => Math.floor(9000 / columns.length));

  // Header row
  const headerRow = new TableRow({
    tableHeader: true,
    children: columns.map((col, i) =>
      new TableCell({
        width: { size: colWidths[i], type: WidthType.DXA },
        shading: { type: ShadingType.SOLID, color: HEADER_BG, fill: HEADER_BG },
        borders: cellBorders('334155'),
        verticalAlign: VerticalAlign.CENTER,
        children: [
          new Paragraph({
            spacing: { before: 40, after: 40 },
            children: [
              new TextRun({
                text: col.header,
                bold: true,
                size: 18,
                font: 'Calibri',
                color: 'FFFFFF',
              }),
            ],
          }),
        ],
      })
    ),
  });

  // Data rows
  const dataRows = rows.map((row, rIdx) =>
    new TableRow({
      children: columns.map((col, i) =>
        new TableCell({
          width: { size: colWidths[i], type: WidthType.DXA },
          shading: rIdx % 2 === 0
            ? { type: ShadingType.SOLID, color: STRIPE, fill: STRIPE }
            : undefined,
          borders: cellBorders(),
          verticalAlign: VerticalAlign.TOP,
          children: [
            new Paragraph({
              spacing: { before: 30, after: 30 },
              children: [
                new TextRun({
                  text: row[col.key] || '',
                  size: 18,
                  font: 'Calibri',
                  color: DARK,
                }),
              ],
            }),
          ],
        })
      ),
    })
  );

  return new Table({
    width: { size: 9000, type: WidthType.DXA },
    rows: [headerRow, ...dataRows],
  });
}

function buildRepeatableSection(
  entries: Record<string, string>[],
  subFields: { key: string; label: string }[]
): Paragraph[] {
  const paragraphs: Paragraph[] = [];

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    // Entry number header
    paragraphs.push(new Paragraph({
      children: [
        new TextRun({
          text: `Entry #${i + 1}`,
          bold: true,
          size: 20,
          font: 'Calibri',
          color: ACCENT,
        }),
      ],
      spacing: { before: 200, after: 80 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: ACCENT_SOFT } },
    }));

    for (const sf of subFields) {
      const val = entry[sf.key] || '';
      if (!val) continue;
      paragraphs.push(new Paragraph({
        children: [
          new TextRun({ text: `${sf.label}: `, bold: true, size: 18, font: 'Calibri', color: MED }),
          new TextRun({ text: val, size: 18, font: 'Calibri', color: DARK }),
        ],
        spacing: { before: 30, after: 30 },
        indent: { left: 360 },
      }));
    }

    // Separator
    if (i < entries.length - 1) {
      paragraphs.push(new Paragraph({ spacing: { before: 80, after: 80 } }));
    }
  }

  return paragraphs;
}

function buildCheckboxWithRationale(
  label: string,
  data: { checked: boolean; rationale: string }
): Paragraph[] {
  const paragraphs: Paragraph[] = [];

  paragraphs.push(new Paragraph({
    children: [
      new TextRun({
        text: data.checked ? '\u2611 ' : '\u2610 ',
        size: 22,
        font: 'Calibri',
        color: data.checked ? SUCCESS : MUTED,
      }),
      new TextRun({
        text: label,
        size: 20,
        font: 'Calibri',
        color: DARK,
        bold: data.checked,
      }),
    ],
    spacing: { after: 40 },
  }));

  if (data.rationale?.trim()) {
    paragraphs.push(new Paragraph({
      children: [
        new TextRun({
          text: 'Rationale: ',
          italics: true,
          bold: true,
          size: 18,
          font: 'Calibri',
          color: MED,
        }),
        new TextRun({
          text: data.rationale,
          italics: true,
          size: 18,
          font: 'Calibri',
          color: MED,
        }),
      ],
      spacing: { after: 60 },
      indent: { left: 480 },
    }));
  }

  return paragraphs;
}

// ── Main DOCX Generator ──
export async function generateDocx(
  templateName: string,
  title: string,
  sections: DocxSection[]
): Promise<Buffer> {
  const children: (Paragraph | Table)[] = [];

  // ── Title ──
  children.push(new Paragraph({
    children: [new TextRun({ text: title, bold: true, size: 36, font: 'Calibri', color: NAVY })],
    heading: HeadingLevel.TITLE,
    alignment: AlignmentType.CENTER,
    spacing: { after: 200 },
  }));

  // ── Subtitle ──
  children.push(new Paragraph({
    children: [new TextRun({ text: `Template: ${templateName}`, size: 20, color: MUTED, font: 'Calibri' })],
    alignment: AlignmentType.CENTER,
    spacing: { after: 100 },
  }));

  // ── Generation date ──
  children.push(new Paragraph({
    children: [new TextRun({
      text: `Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`,
      size: 18,
      color: MUTED,
      font: 'Calibri',
    })],
    alignment: AlignmentType.CENTER,
    spacing: { after: 200 },
  }));

  // ── Divider ──
  children.push(new Paragraph({
    border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: ACCENT } },
    spacing: { after: 400 },
  }));

  // ── Sections ──
  for (const section of sections) {
    // Section heading
    children.push(new Paragraph({
      children: [new TextRun({ text: section.sectionName, bold: true, size: 28, font: 'Calibri', color: NAVY })],
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 200 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: ACCENT_SOFT } },
    }));

    for (const field of section.fields) {
      const rawValue = field.value || '';
      const parsed = rawValue ? tryParseJSON(rawValue) : null;

      // ── TABLE ──
      if (field.type === 'table' && Array.isArray(parsed) && parsed.length > 0) {
        const cols = field.columns || Object.keys(parsed[0] as Record<string, unknown>).map(k => ({
          key: k,
          header: k.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        }));
        // Field label
        children.push(new Paragraph({
          children: [new TextRun({ text: field.label, bold: true, size: 22, font: 'Calibri', color: ACCENT })],
          spacing: { before: 200, after: 80 },
        }));
        children.push(buildWordTable(parsed as Record<string, string>[], cols));
        children.push(new Paragraph({ spacing: { after: 200 } }));
        continue;
      }

      // ── REPEATABLE ──
      if (field.type === 'repeatable' && Array.isArray(parsed) && parsed.length > 0) {
        const subs = field.subFields || Object.keys(parsed[0] as Record<string, unknown>).map(k => ({
          key: k,
          label: k.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        }));
        children.push(new Paragraph({
          children: [new TextRun({ text: field.label, bold: true, size: 22, font: 'Calibri', color: ACCENT })],
          spacing: { before: 200, after: 80 },
        }));
        children.push(...buildRepeatableSection(parsed as Record<string, string>[], subs));
        children.push(new Paragraph({ spacing: { after: 200 } }));
        continue;
      }

      // ── CHECKBOX WITH RATIONALE ──
      if (field.type === 'checkbox_with_rationale') {
        let cbData: { checked: boolean; rationale: string };
        if (parsed && typeof parsed === 'object' && 'checked' in (parsed as Record<string, unknown>)) {
          cbData = parsed as { checked: boolean; rationale: string };
        } else {
          cbData = { checked: rawValue === 'true', rationale: '' };
        }
        children.push(...buildCheckboxWithRationale(field.label, cbData));
        continue;
      }

      // ── SIMPLE CHECKBOX ──
      if (field.type === 'checkbox') {
        children.push(new Paragraph({
          children: [
            new TextRun({
              text: rawValue === 'true' ? '\u2611 ' : '\u2610 ',
              size: 22,
              font: 'Calibri',
              color: rawValue === 'true' ? SUCCESS : MUTED,
            }),
            new TextRun({ text: field.label, size: 20, font: 'Calibri', color: DARK }),
          ],
          spacing: { after: 80 },
        }));
        continue;
      }

      // ── AUTO-DETECT JSON ARRAY (table without explicit type) ──
      if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'object') {
        const autoColumns = Object.keys(parsed[0] as Record<string, unknown>).map(k => ({
          key: k,
          header: k.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        }));
        children.push(new Paragraph({
          children: [new TextRun({ text: field.label, bold: true, size: 22, font: 'Calibri', color: ACCENT })],
          spacing: { before: 200, after: 80 },
        }));
        children.push(buildWordTable(parsed as Record<string, string>[], autoColumns));
        children.push(new Paragraph({ spacing: { after: 200 } }));
        continue;
      }

      // ── STANDARD FIELD ──
      children.push(new Paragraph({
        children: [new TextRun({ text: field.label, bold: true, size: 22, font: 'Calibri', color: MED })],
        spacing: { before: 200, after: 60 },
      }));

      const valueLines = (rawValue || '(not provided)').split('\n');
      for (const line of valueLines) {
        children.push(new Paragraph({
          children: [new TextRun({
            text: line,
            size: 20,
            font: 'Calibri',
            color: rawValue ? DARK : MUTED,
          })],
          spacing: { after: 40 },
        }));
      }
    }
  }

  // ── Footer ──
  children.push(new Paragraph({
    border: { top: { style: BorderStyle.SINGLE, size: 8, color: ACCENT } },
    spacing: { before: 600 },
  }));
  children.push(new Paragraph({
    children: [new TextRun({
      text: `Generated by Agent Deployment Playbook \u00b7 ${new Date().toLocaleDateString()} \u00b7 \u00a9 2026 Padmasani Srimadhan`,
      size: 16,
      color: MUTED,
      font: 'Calibri',
      italics: true,
    })],
    alignment: AlignmentType.CENTER,
  }));

  const doc = new Document({ sections: [{ children }] });
  const buffer = await Packer.toBuffer(doc);
  return buffer as Buffer;
}
