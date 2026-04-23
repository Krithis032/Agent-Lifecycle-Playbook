import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { unlink } from 'fs/promises';
import path from 'path';
import { logError } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const [, authError] = await requireAuth();
  if (authError) return authError;

  const { id } = await params;
  const docId = parseInt(id, 10);
  if (isNaN(docId)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

  try {
    const document = await prisma.document.findUnique({
      where: { id: docId },
      include: {
        uploadedBy: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true } },
      },
    });
    if (!document) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(document);
  } catch (err) {
    logError('GET /api/documents/[id]', err);
    return NextResponse.json({ error: 'Failed to fetch document' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const [session, authError] = await requireAuth();
  if (authError) return authError;

  const { id } = await params;
  const docId = parseInt(id, 10);
  if (isNaN(docId)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

  try {
    const document = await prisma.document.findUnique({ where: { id: docId } });
    if (!document) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Ownership check: only the uploader or an admin can delete
    const isOwner = document.uploadedById === Number(session!.user.id);
    const isAdmin = session!.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden: you can only delete your own documents' }, { status: 403 });
    }

    // Delete file from disk
    try {
      const fullPath = path.join(process.cwd(), 'public', document.filePath);
      await unlink(fullPath);
    } catch {
      // File may already be gone, continue with DB cleanup
    }

    await prisma.document.delete({ where: { id: docId } });
    return NextResponse.json({ success: true });
  } catch (err) {
    logError('DELETE /api/documents/[id]', err);
    return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 });
  }
}
