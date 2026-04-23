import { withAuth } from 'next-auth/middleware';

export default withAuth({
  callbacks: {
    authorized: ({ token }) => !!token,
  },
  pages: { signIn: '/login' },
});

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
