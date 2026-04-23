import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import type { NextAuthOptions } from 'next-auth';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        if (!user) return null;

        if (user.status === 'suspended') return null;

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!isValid) return null;

        return { id: String(user.id), email: user.email, name: user.name, role: user.role };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  pages: { signIn: '/login' },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role || 'viewer';
      }
      // Refresh role from DB on every session update
      if (trigger === 'update' || !token.role) {
        const dbUser = await prisma.user.findUnique({
          where: { id: Number(token.id) },
          select: { role: true },
        });
        if (dbUser) token.role = dbUser.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        const u = session.user as { id?: string; role?: string };
        u.id = token.id as string;
        u.role = (token.role as string) || 'viewer';
      }
      return session;
    },
  },
};
