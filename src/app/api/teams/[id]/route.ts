import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { logError } from '@/lib/logger';

// PATCH /api/teams/:id — Update team (admin only)
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const [, err] = await requireAdmin();
  if (err) return err;

  const teamId = parseInt(params.id, 10);
  if (isNaN(teamId)) {
    return NextResponse.json({ error: 'Invalid team ID' }, { status: 400 });
  }

  try {
    const { name, description, memberIds } = await req.json();

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description || null;

    // If memberIds provided, set the team's members
    if (Array.isArray(memberIds)) {
      // Remove all current members from this team
      await prisma.user.updateMany({
        where: { teamId },
        data: { teamId: null },
      });
      // Assign new members
      if (memberIds.length > 0) {
        await prisma.user.updateMany({
          where: { id: { in: memberIds } },
          data: { teamId },
        });
      }
    }

    const team = await prisma.team.update({
      where: { id: teamId },
      data: updateData,
      include: {
        members: {
          select: { id: true, email: true, name: true, role: true, status: true },
        },
        _count: { select: { members: true } },
      },
    });

    return NextResponse.json(team);
  } catch (error) {
    logError('PATCH /api/teams/[id]', error);
    return NextResponse.json(
      { error: 'Failed to update team' },
      { status: 500 },
    );
  }
}

// DELETE /api/teams/:id — Delete team (admin only)
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const [, err] = await requireAdmin();
  if (err) return err;

  const teamId = parseInt(params.id, 10);
  if (isNaN(teamId)) {
    return NextResponse.json({ error: 'Invalid team ID' }, { status: 400 });
  }

  try {
    // Unassign all members first
    await prisma.user.updateMany({
      where: { teamId },
      data: { teamId: null },
    });

    await prisma.team.delete({ where: { id: teamId } });
    return NextResponse.json({ message: 'Team deleted' });
  } catch (error) {
    logError('DELETE /api/teams/[id]', error);
    return NextResponse.json(
      { error: 'Failed to delete team' },
      { status: 500 },
    );
  }
}
