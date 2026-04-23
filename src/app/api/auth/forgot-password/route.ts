import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma';
import { sendPasswordResetEmail } from '@/lib/email';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  const limited = rateLimit(req, { maxRequests: 5, windowMs: 60_000, keyPrefix: 'forgot-pw' });
  if (limited) return limited;

  try {
    const { email } = await req.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 },
      );
    }

    // Always return success to prevent email enumeration
    const successResponse = NextResponse.json({
      message: 'If an account with that email exists, a password reset link has been sent.',
    });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return successResponse;
    }

    // Generate a secure random token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store hashed token in database (store hash, compare hash — same principle as passwords)
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: hashedToken,
        resetTokenExpiry,
      },
    });

    // Send email with the unhashed token (user receives the raw token in the link)
    await sendPasswordResetEmail(user.email, resetToken);

    return successResponse;
  } catch (error) {
    const { logError } = await import('@/lib/logger');
    logError('POST /api/auth/forgot-password', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 },
    );
  }
}
