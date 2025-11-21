import { randomBytes } from 'node:crypto';
import { createInterface } from 'node:readline';
import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { inviteCode } from '../lib/db/schema';

// Load environment variables from .env.local
config({ path: '.env.local' });

// biome-ignore lint: Forbidden non-null assertion.
const client = postgres(process.env.POSTGRES_URL!);
const db = drizzle(client);

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

function askQuestion(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function createOwnerInvite() {
  console.log('🎫 Invite Code Generator\n');

  const roleInput = await askQuestion('Enter role to assign (user/admin/owner): ');
  const role = roleInput.toLowerCase() as 'user' | 'admin' | 'owner';

  if (!['user', 'admin', 'owner'].includes(role)) {
    console.error('❌ Invalid role! Must be: user, admin, or owner');
    rl.close();
    process.exit(1);
  }

  // Generate a random invite code
  const code = randomBytes(16).toString('hex');

  // Set expiration to 48 hours from now
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 48);

  try {
    await db.insert(inviteCode).values({
      code,
      role,
      maxUses: '1',
      currentUses: '0',
      isActive: true,
      expiresAt,
    }).returning();

    console.log('\n🎉 Invite code created successfully!\n');
    console.log('='.repeat(50));
    console.log(`Invite Code: ${code}`);
    console.log(`Role: ${role}`);
    console.log(`Max Uses: 1`);
    console.log(`Expires: ${expiresAt.toLocaleString()} (48 hours)`);
    console.log('='.repeat(50));
    console.log(`\n⚠️  Save this code securely - it will grant ${role} privileges!\n`);

    rl.close();
    process.exit(0);
  } catch (error) {
    console.error('Error creating invite code:', error);
    rl.close();
    process.exit(1);
  }
}

createOwnerInvite();
