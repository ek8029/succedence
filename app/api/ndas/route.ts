import { NextRequest, NextResponse } from 'next/server';
import { saveNDA, getNDAs } from '@/lib/db';
import { CreateNDARequest } from '@/lib/types';

export async function GET() {
  try {
    const ndas = getNDAs();
    return NextResponse.json(ndas);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch NDAs' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateNDARequest = await request.json();
    
    // Validate required fields
    if (!body.listingId || !body.buyerName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    const newNDA = saveNDA(body);
    return NextResponse.json(newNDA, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create NDA request' }, { status: 500 });
  }
}
