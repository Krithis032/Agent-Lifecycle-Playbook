/**
 * Safe JSON parsing utilities for export generators and form data.
 * Guards against oversized payloads, deeply nested objects, and prototype pollution.
 */

const MAX_JSON_LENGTH = 500_000; // 500 KB per field value
const MAX_ARRAY_LENGTH = 500;    // Max rows in a table / repeatable
const MAX_OBJECT_DEPTH = 5;      // Max nesting depth

/** Parse JSON safely with size, depth, and structure checks. */
export function safeParseJSON(str: string): unknown {
  if (!str || str.length > MAX_JSON_LENGTH) return null;
  try {
    const parsed = JSON.parse(str);
    if (isUnsafe(parsed, MAX_OBJECT_DEPTH)) return null;
    return stripPrototypeKeys(parsed);
  } catch {
    return null;
  }
}

/** Validate that a fieldValues object isn't dangerously large. */
export function validateFieldValuesSize(
  fieldValues: Record<string, string>
): { valid: boolean; error?: string } {
  const totalSize = JSON.stringify(fieldValues).length;
  if (totalSize > 1_000_000) {
    return { valid: false, error: `Field data too large (${Math.round(totalSize / 1024)}KB). Maximum is 1MB.` };
  }

  for (const [key, value] of Object.entries(fieldValues)) {
    if (value && value.length > MAX_JSON_LENGTH) {
      return { valid: false, error: `Field "${key}" exceeds maximum size of 500KB.` };
    }
    // Check array lengths in JSON values
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed) && parsed.length > MAX_ARRAY_LENGTH) {
        return {
          valid: false,
          error: `Field "${key}" has ${parsed.length} rows. Maximum is ${MAX_ARRAY_LENGTH}.`,
        };
      }
    } catch {
      // Not JSON, that's fine
    }
  }
  return { valid: true };
}

/** Cap array length when preparing export data. */
export function capArray<T>(arr: T[], max: number = MAX_ARRAY_LENGTH): T[] {
  return arr.slice(0, max);
}

/** Sanitize text for document rendering (remove BiDi overrides and control chars). */
export function sanitizeText(text: string): string {
  if (!text) return '';
  return text
    .replace(/[\u200E\u200F\u202A-\u202E\u2066-\u2069]/g, '') // BiDi overrides
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');       // Control chars (keep \t, \n, \r)
}

// ── Internal helpers ──

function isUnsafe(obj: unknown, maxDepth: number): boolean {
  if (maxDepth <= 0 && typeof obj === 'object' && obj !== null) return true;
  if (Array.isArray(obj)) {
    if (obj.length > MAX_ARRAY_LENGTH) return true;
    return obj.some(item => isUnsafe(item, maxDepth - 1));
  }
  if (typeof obj === 'object' && obj !== null) {
    const keys = Object.keys(obj);
    if (keys.length > 200) return true; // Too many keys
    return keys.some(k => isUnsafe((obj as Record<string, unknown>)[k], maxDepth - 1));
  }
  return false;
}

function stripPrototypeKeys(obj: unknown): unknown {
  if (Array.isArray(obj)) {
    return obj.map(stripPrototypeKeys);
  }
  if (typeof obj === 'object' && obj !== null) {
    const cleaned: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') continue;
      cleaned[key] = stripPrototypeKeys(value);
    }
    return cleaned;
  }
  return obj;
}
