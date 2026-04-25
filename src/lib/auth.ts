import { getServerSession } from 'next-auth';
import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import { headers, cookies } from 'next/headers';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';

export interface AuthSession {
  user: { id: string; email: string; name?: string | null; role?: string };
}

/**
 * Returns the session or a 401 response.
 * Uses getServerSession first, then falls back to JWT token extraction.
 * The fallback ensures auth works even when NEXTAUTH_URL is not configured
 * (e.g., on Railway where the middleware already validates the JWT).
 */
export async function requireAuth(): Promise<
  [AuthSession, null] | [null, NextResponse]
> {
  // Try getServerSession first (works when NEXTAUTH_URL is set correctly)
  const session = await getServerSession(authOptions);
  if (session?.user) {
    return [session as unknown as AuthSession, null];
  }

  // Fallback: extract JWT token directly from cookies
  // This works even without NEXTAUTH_URL because it only needs NEXTAUTH_SECRET
  try {
    const cookieStore = await cookies();
    const headerStore = await headers();
    const token = await getToken({
      req: {
        headers: Object.fromEntries(headerStore.entries()),
        cookies: Object.fromEntries(
          cookieStore.getAll().map((c) => [c.name, c.value])
        ),
      } as Parameters<typeof getToken>[0]['req'],
      secret: process.env.NEXTAUTH_SECRET,
    });
    if (token?.id) {
      return [{
        user: {
          id: String(token.id),
          email: (token.email as string) || '',
          name: (token.name as string) || null,
          role: (token.role as string) || 'viewer',
        },
      }, null];
    }
  } catch {
    // Token extraction failed — fall through to 401
  }

  return [null, NextResponse.json({ error: 'Unauthorized' }, { status: 401 })];
}

/**
 * Returns the session if user is admin, or a 403 response.
 * Usage in API routes:
 *   const [session, errorResponse] = await requireAdmin();
 *   if (errorResponse) return errorResponse;
 */
export async function requireAdmin(): Promise<
  [AuthSession, null] | [null, NextResponse]
> {
  const [session, authError] = await requireAuth();
  if (authError) return [null, authError];

  if (session!.user.role !== 'admin') {
    return [null, NextResponse.json({ error: 'Forbidden: admin access required' }, { status: 403 })];
  }
  return [session!, null];
}
