import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { logError } from '@/lib/logger';

// PATCH /api/users/:id — Update user (admin only)
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const [session, err] = await requireAdmin();
  if (err) return err;

  const userId = parseInt(params.id, 10);
  if (isNaN(userId)) {
    return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { name, role, status, teamId, password } = body;

    const validRoles = ['admin', 'user', 'viewer'];

    // Prevent admin from demoting themselves
    if (userId === Number(session!.user.id) && role && role !== 'admin') {
      return NextResponse.json(
        { error: 'You cannot change your own role' },
        { status: 400 },
      );
    }

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (role !== undefined && validRoles.includes(role)) updateData.role = role;
    if (status !== undefined && ['active', 'suspended'].includes(status)) updateData.status = status;
    if (teamId !== undefined) updateData.teamId = teamId || null;
    if (password && password.length >= 8) {
      updateData.passwordHash = await bcrypt.hash(password, 12);
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
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
    });

    return NextResponse.json(user);
  } catch (error) {
    logError('PATCH /api/users/[id]', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 },
    );
  }
}

// DELETE /api/users/:id — Delete user (admin only)
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const [session, err] = await requireAdmin();
  if (err) return err;

  const userId = parseInt(params.id, 10);
  if (isNaN(userId)) {
    return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
  }

  // Prevent admin from deleting themselves
  if (userId === Number(session!.user.id)) {
    return NextResponse.json(
      { error: 'You cannot delete your own account' },
      { status: 400 },
    );
  }

  try {
    await prisma.user.delete({ where: { id: userId } });
    return NextResponse.json({ message: 'User deleted' });
  } catch (error) {
    logError('DELETE /api/users/[id]', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 },
    );
  }
}
