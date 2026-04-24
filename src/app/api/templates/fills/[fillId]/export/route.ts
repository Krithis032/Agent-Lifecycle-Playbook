import { NextRequest, NextResponse } from 'next/server';

/**
 * Legacy export endpoint — redirects to the format-based route.
 * Kept for backward compatibility with existing links.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ fillId: string }> }
) {
  const { fillId } = await params;
  // Redirect to the new format-based route (default: docx)
  return NextResponse.redirect(
    new URL(`/api/templates/fills/${fillId}/export/docx`, _req.url)
  );
}
