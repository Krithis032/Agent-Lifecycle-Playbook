/**
 * Centralized logger that sanitizes error details.
 * In production, this could forward to an external service (Sentry, DataDog, etc.).
 */

function sanitizeError(error: unknown): { message: string; code?: string } {
  if (error instanceof Error) {
    return { message: error.message };
  }
  if (typeof error === 'string') {
    return { message: error };
  }
  return { message: 'Unknown error' };
}

export function logError(context: string, error: unknown) {
  const sanitized = sanitizeError(error);
  if (process.env.NODE_ENV === 'development') {
    console.error(`[${context}]`, error);
  } else {
    // Production: log sanitized version only (no stack traces)
    console.error(`[${context}]`, JSON.stringify(sanitized));
  }
}

export function logWarn(context: string, message: string) {
  console.warn(`[${context}] ${message}`);
}

export function logInfo(context: string, message: string) {
  if (process.env.NODE_ENV === 'development') {
    console.info(`[${context}] ${message}`);
  }
}
