import { NextResponse } from 'next/server';
import { getInviteCodeByCode, useInviteCode, createUser, getUser } from '@/lib/db/queries';

export async function POST(request: Request) {
  try {
    const { email, password, inviteCode } = await request.json();

    // Validate inputs
    if (!email || !password || !inviteCode) {
      return NextResponse.json(
        { error: 'Email, password, and invite code are required' },
        { status: 400 }
      );
    }

    // Validate invite code
    const inviteCodeData = await getInviteCodeByCode(inviteCode);
    if (!inviteCodeData) {
      return NextResponse.json(
        { error: 'Invalid or expired invite code' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUsers = await getUser(email);
    if (existingUsers.length > 0) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    // Create user in database with role from invite code
    // Note: createUser() handles password hashing internally
    const [newUser] = await createUser(
      email,
      password,
      inviteCodeData.role as 'user' | 'admin' | 'owner'
    );

    // Mark invite code as used
    await useInviteCode({
      code: inviteCode,
      userId: newUser.id,
    });

    return NextResponse.json({
      success: true,
      message: 'Account created successfully',
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
