import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const revalidate = 30;

export async function GET(req: NextRequest) {
  const [, authError] = await requireAuth();
  if (authError) return authError;

  const domainId = req.nextUrl.searchParams.get('domainId');

  if (domainId) {
    const domain = await prisma.kbDomain.findUnique({
      where: { id: parseInt(domainId, 10) },
      include: { concepts: { orderBy: { conceptName: 'asc' } } },
    });
    return NextResponse.json(domain || { concepts: [] });
  }

  const domains = await prisma.kbDomain.findMany({
    orderBy: { domainName: 'asc' },
  });
  return NextResponse.json(domains);
}
