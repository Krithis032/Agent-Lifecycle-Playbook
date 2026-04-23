import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';

export interface AuthSession {
  user: { id: string; email: string; name?: string | null; role?: string };
}

/**
 * Returns the session or a 401 response.
 * Usage in API routes:
 *   const [session, errorResponse] = await requireAuth();
 *   if (errorResponse) return errorResponse;
 */
export async function requireAuth(): Promise<
  [AuthSession, null] | [null, NextResponse]
> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return [null, NextResponse.json({ error: 'Unauthorized' }, { status: 401 })];
  }
  return [session as unknown as AuthSession, null];
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
