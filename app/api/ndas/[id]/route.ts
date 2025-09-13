import { NextRequest, NextResponse } from 'next/server';
import { updateNDAStatus } from '@/lib/db';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { action } = body; // 'approve' or 'deny'
    
    if (!action || (action !== 'approve' && action !== 'deny')) {
      return NextResponse.json({ error: 'Invalid action. Must be "approve" or "deny"' }, { status: 400 });
    }
    
    const status = action === 'approve' ? 'APPROVED' : 'REJECTED';
    const updatedNDA = updateNDAStatus(id, status);
    
    if (!updatedNDA) {
      return NextResponse.json({ error: 'NDA not found' }, { status: 404 });
    }
    
    return NextResponse.json(updatedNDA);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update NDA status' }, { status: 500 });
  }
}
