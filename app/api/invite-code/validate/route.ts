import { NextResponse } from 'next/server';
import { validateInviteCode } from '@/lib/db/queries';

export async function POST(request: Request) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json(
        { valid: false, message: 'Invite code is required' },
        { status: 400 }
      );
    }

    const isValid = await validateInviteCode(code);

    return NextResponse.json({ valid: isValid });
  } catch (error) {
    console.error('Error validating invite code:', error);
    return NextResponse.json(
      { valid: false, message: 'Error validating invite code' },
      { status: 500 }
    );
  }
}
