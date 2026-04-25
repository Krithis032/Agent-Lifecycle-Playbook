import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import { headers, cookies } from 'next/headers';

export interface AuthSession {
  user: { id: string; email: string; name?: string | null; role?: string };
}

/**
 * Returns the session or a 401 response.
 * Uses direct JWT token extraction from cookies (fast path).
 * This avoids the expensive getServerSession() call which doubles latency
 * when the token is invalid (e.g., after NEXTAUTH_SECRET rotation).
 */
export async function requireAuth(): Promise<
  [AuthSession, null] | [null, NextResponse]
> {
  // Fast path: check if session cookie even exists before trying to decode
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('next-auth.session-token')
    || cookieStore.get('__Secure-next-auth.session-token');

  if (!sessionCookie?.value) {
    return [null, NextResponse.json({ error: 'Unauthorized' }, { status: 401 })];
  }

  // Extract JWT token directly from cookies — fast, only needs NEXTAUTH_SECRET
  try {
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
