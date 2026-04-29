import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';

/**
 * Custom middleware that replaces next-auth's withAuth.
 *
 * withAuth relies on a client-side redirect that races against HTML streaming,
 * causing a flash of protected content before the login page appears.
 *
 * This middleware instead:
 *  1. Checks the JWT directly (same as withAuth internally).
 *  2. Returns a hard 307 redirect to /login for unauthenticated page requests.
 *  3. Returns 401 JSON for unauthenticated API requests.
 *  4. Forwards a x-pathname header so server components can read the route.
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    // API routes: return 401 JSON instead of redirecting
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Page routes: hard redirect — no HTML is sent to the browser
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Authenticated: continue, and pass pathname for server components
  const res = NextResponse.next();
  res.headers.set('x-pathname', pathname);
  return res;
}

export const config = {
  matcher: [
    '/',
    '/projects/:path*',
    '/advisor/:path*',
    '/governance/:path*',
    '/caio/:path*',
    '/evaluate/:path*',
    '/templates/:path*',
    '/documents/:path*',
    '/my-documents/:path*',
    '/settings/:path*',
    '/playbook/:path*',
    '/interview/:path*',
    '/user-guide/:path*',
    '/api/projects/:path*',
    '/api/kb/:path*',
    '/api/governance/:path*',
    '/api/caio/:path*',
    '/api/evaluate/:path*',
    '/api/templates/:path*',
    '/api/dashboard/:path*',
    '/api/search/:path*',
    '/api/user-guide/:path*',
    '/api/playbook/:path*',
    '/api/documents/:path*',
    '/api/users/:path*',
    '/api/teams/:path*',
  ],
};
