import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { createInviteCode } from '@/lib/db/queries';
import { nanoid } from 'nanoid';

export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { maxUses = '1', expiresAt } = await request.json();

    // Generate a random invite code
    const code = nanoid(16);

    const inviteCode = await createInviteCode({
      code,
      createdBy: session.user.sub,
      maxUses: maxUses.toString(),
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
    });

    return NextResponse.json({ inviteCode });
  } catch (error) {
    console.error('Error creating invite code:', error);
    return NextResponse.json(
      { error: 'Error creating invite code' },
      { status: 500 }
    );
  }
}
