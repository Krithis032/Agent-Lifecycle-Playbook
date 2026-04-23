import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { writeFile, unlink, mkdir } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { logError } from '@/lib/logger';

export const dynamic = 'force-dynamic';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const MAX_TITLE_LENGTH = 255;
const ALLOWED_CATEGORIES = ['Charter', 'Architecture', 'Evaluation', 'Security', 'Compliance', 'Report', 'Design', 'Other'];
const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-excel',
  'application/vnd.ms-powerpoint',
  'text/plain',
  'text/csv',
  'text/markdown',
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
  'image/svg+xml',
];

export async function GET() {
  const [, authError] = await requireAuth();
  if (authError) return authError;

  try {
    const documents = await prisma.document.findMany({
      take: 200,
      include: {
        uploadedBy: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(documents);
  } catch (err) {
    logError('GET /api/documents', err);
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const [session, authError] = await requireAuth();
  if (authError) return authError;

  let writtenFilePath: string | null = null;

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const title = formData.get('title') as string | null;
    const category = formData.get('category') as string | null;
    const projectId = formData.get('projectId') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!title?.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    if (title.trim().length > MAX_TITLE_LENGTH) {
      return NextResponse.json({ error: `Title must be ${MAX_TITLE_LENGTH} characters or less` }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File exceeds 20MB limit' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: `File type not allowed: ${file.type}` }, { status: 400 });
    }

    // Validate category if provided
    if (category && !ALLOWED_CATEGORIES.includes(category)) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
    }

    // Validate projectId ownership if provided
    if (projectId) {
      const project = await prisma.project.findUnique({ where: { id: Number(projectId) }, select: { id: true } });
      if (!project) {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 });
      }
    }

    // Ensure upload directory exists
    await mkdir(UPLOAD_DIR, { recursive: true });

    // Generate unique filename (strip path traversal characters from extension)
    const ext = path.extname(file.name).replace(/[^a-zA-Z0-9.]/g, '');
    const uniqueName = `${crypto.randomUUID()}${ext}`;
    const filePath = path.join(UPLOAD_DIR, uniqueName);

    // Write file to disk
    const bytes = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(bytes));
    writtenFilePath = filePath;

    // Save to database
    const document = await prisma.document.create({
      data: {
        title: title.trim(),
        filename: file.name.slice(0, 255),
        filePath: `/uploads/${uniqueName}`,
        fileSize: file.size,
        mimeType: file.type,
        category: category || null,
        uploadedById: session!.user.id ? Number(session!.user.id) : null,
        projectId: projectId ? Number(projectId) : null,
      },
      include: {
        uploadedBy: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(document, { status: 201 });
  } catch (err) {
    // Clean up orphaned file if DB write failed
    if (writtenFilePath) {
      try { await unlink(writtenFilePath); } catch { /* file may not exist */ }
    }
    logError('POST /api/documents', err);
    return NextResponse.json({ error: 'Failed to upload document' }, { status: 500 });
  }
}
