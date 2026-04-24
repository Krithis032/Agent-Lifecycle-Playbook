import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { logError } from '@/lib/logger';

// GET /api/setup — Check if setup is needed (no users exist)
export async function GET() {
  try {
    const userCount = await prisma.user.count();
    return NextResponse.json({ setupRequired: userCount === 0 });
  } catch (error) {
    logError('GET /api/setup', error);
    return NextResponse.json(
      { error: 'Failed to check setup status' },
      { status: 500 },
    );
  }
}

// POST /api/setup — Create the first admin user (only when 0 users exist)
export async function POST(req: NextRequest) {
  try {
    // Self-sealing check: only works when no users exist
    const userCount = await prisma.user.count();
    if (userCount > 0) {
      return NextResponse.json(
        { error: 'Setup has already been completed' },
        { status: 403 },
      );
    }

    const { email, name, password } = await req.json();

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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 },
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        name: name || email.split('@')[0],
        passwordHash,
        role: 'admin',
        status: 'active',
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    return NextResponse.json(
      { message: 'Admin account created successfully', user },
      { status: 201 },
    );
  } catch (error) {
    logError('POST /api/setup', error);
    return NextResponse.json(
      { error: 'Failed to create admin account' },
      { status: 500 },
    );
  }
}
