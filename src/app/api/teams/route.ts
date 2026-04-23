import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { logError } from '@/lib/logger';

// GET /api/teams — List all teams (admin only)
export async function GET() {
  const [, err] = await requireAdmin();
  if (err) return err;

  const teams = await prisma.team.findMany({
    include: {
      members: {
        select: { id: true, email: true, name: true, role: true, status: true },
      },
      _count: { select: { members: true } },
    },
    orderBy: { name: 'asc' },
  });

  return NextResponse.json(teams);
}

// POST /api/teams — Create a new team (admin only)
export async function POST(req: NextRequest) {
  const [, err] = await requireAdmin();
  if (err) return err;

  try {
    const { name, description } = await req.json();

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Team name is required' },
        { status: 400 },
      );
    }

    const existing = await prisma.team.findUnique({ where: { name: name.trim() } });
    if (existing) {
      return NextResponse.json(
        { error: 'A team with this name already exists' },
        { status: 409 },
      );
    }

    const team = await prisma.team.create({
      data: {
        name: name.trim(),
        description: description || null,
      },
      include: {
        members: {
          select: { id: true, email: true, name: true, role: true },
        },
        _count: { select: { members: true } },
      },
    });

    return NextResponse.json(team, { status: 201 });
  } catch (error) {
    logError('POST /api/teams', error);
    return NextResponse.json(
      { error: 'Failed to create team' },
      { status: 500 },
    );
  }
}
