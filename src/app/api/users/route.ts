import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { logError } from '@/lib/logger';

// GET /api/users — List all users (admin only)
export async function GET() {
  const [, err] = await requireAdmin();
  if (err) return err;

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      status: true,
      teamId: true,
      createdAt: true,
      team: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(users);
}

// POST /api/users — Create a new user (admin only)
export async function POST(req: NextRequest) {
  const [, err] = await requireAdmin();
  if (err) return err;

  try {
    const { email, name, password, role, teamId } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 },
      );
    }

    const validRoles = ['admin', 'user', 'viewer'];
    const userRole = validRoles.includes(role) ? role : 'viewer';

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: 'A user with this email already exists' },
        { status: 409 },
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        name: name || email.split('@')[0],
        passwordHash,
        role: userRole,
        teamId: teamId || null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        teamId: true,
        createdAt: true,
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    logError('POST /api/users', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 },
    );
  }
}
