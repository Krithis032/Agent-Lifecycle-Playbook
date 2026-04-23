import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  const limited = rateLimit(req, { maxRequests: 5, windowMs: 60_000, keyPrefix: 'reset-pw' });
  if (limited) return limited;

  try {
    const { token, password } = await req.json();

    if (!token || typeof token !== 'string') {
      return NextResponse.json(
        { error: 'Reset token is required' },
        { status: 400 },
      );
    }

    if (!password || typeof password !== 'string' || password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 },
      );
    }

    // Hash the incoming token to compare against stored hash
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await prisma.user.findFirst({
      where: {
        resetToken: hashedToken,
        resetTokenExpiry: { gt: new Date() },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired reset link. Please request a new one.' },
        { status: 400 },
      );
    }

    // Hash new password and clear reset token
    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return NextResponse.json({
      message: 'Password reset successfully. You can now sign in.',
    });
  } catch (error) {
    const { logError } = await import('@/lib/logger');
    logError('POST /api/auth/reset-password', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 },
    );
  }
}
