import { NextRequest, NextResponse } from 'next/server';
import { getMessages, saveMessage } from '@/lib/db';
import { CreateMessageRequest } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const listingId = searchParams.get('listingId');
    
    const messages = getMessages(listingId || undefined);
    return NextResponse.json(messages);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateMessageRequest = await request.json();
    
    // Validate required fields
    if (!body.listingId || !body.from || !body.body) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Validate message body is not empty
    if (body.body.trim().length === 0) {
      return NextResponse.json({ error: 'Message body cannot be empty' }, { status: 400 });
    }
    
    const newMessage = saveMessage(body);
    return NextResponse.json(newMessage, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create message' }, { status: 500 });
  }
}
