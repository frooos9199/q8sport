import { NextRequest, NextResponse } from 'next/server';
import { sendWelcomeEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const { email, name } = await req.json();
    
    if (!email || !name) {
      return NextResponse.json({ error: 'Email and name required' }, { status: 400 });
    }

    await sendWelcomeEmail(email, name);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Email sent successfully!' 
    });
  } catch (error) {
    console.error('Test email error:', error);
    return NextResponse.json({ 
      error: 'Failed to send email',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Email test endpoint',
    usage: 'POST with { email, name }'
  });
}
