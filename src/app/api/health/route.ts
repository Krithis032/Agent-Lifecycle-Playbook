import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const checks: Record<string, { status: string; latency?: number; error?: string }> = {};

  // Database connectivity check
  const dbStart = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = { status: 'ok', latency: Date.now() - dbStart };
  } catch (error) {
    checks.database = {
      status: 'error',
      latency: Date.now() - dbStart,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }

  // Count key records to verify data integrity
  try {
    const [projects, users, templates, fills] = await Promise.all([
      prisma.project.count(),
      prisma.user.count(),
      prisma.template.count(),
      prisma.templateFill.count(),
    ]);
    checks.data = {
      status: 'ok',
      latency: Date.now() - dbStart,
    };
    const overall = Object.values(checks).every(c => c.status === 'ok');
    return NextResponse.json({
      status: overall ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      checks,
      counts: { projects, users, templates, templateFills: fills },
    });
  } catch (error) {
    checks.data = {
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      checks,
    }, { status: 503 });
  }
}
