import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { sql } from 'drizzle-orm';

// Load environment variables from .env.local
config({ path: '.env.local' });

// biome-ignore lint: Forbidden non-null assertion.
const client = postgres(process.env.POSTGRES_URL!);
const db = drizzle(client);

async function clearTestData() {
  console.log('🧹 Clearing test data...\n');

  try {
    // Delete in order to respect foreign key constraints

    // 1. Delete votes (references messages)
    const deletedVotes = await db.execute(sql`DELETE FROM "Vote_v2"`);
    console.log(`✅ Deleted ${deletedVotes.count} vote(s)`);

    // 2. Delete suggestions (references documents)
    const deletedSuggestions = await db.execute(sql`DELETE FROM "Suggestion"`);
    console.log(`✅ Deleted ${deletedSuggestions.count} suggestion(s)`);

    // 3. Delete documents (references users)
    const deletedDocuments = await db.execute(sql`DELETE FROM "Document"`);
    console.log(`✅ Deleted ${deletedDocuments.count} document(s)`);

    // 4. Delete messages (references chats)
    const deletedMessages = await db.execute(sql`DELETE FROM "Message_v2"`);
    console.log(`✅ Deleted ${deletedMessages.count} message(s)`);

    // 5. Delete streams (references chats)
    const deletedStreams = await db.execute(sql`DELETE FROM "Stream"`);
    console.log(`✅ Deleted ${deletedStreams.count} stream(s)`);

    // 6. Delete chats (references users)
    const deletedChats = await db.execute(sql`DELETE FROM "Chat"`);
    console.log(`✅ Deleted ${deletedChats.count} chat(s)`);

    // 7. Delete invite codes
    const deletedCodes = await db.execute(sql`DELETE FROM "InviteCode"`);
    console.log(`✅ Deleted ${deletedCodes.count} invite code(s)`);

    // 8. Finally delete users
    const deletedUsers = await db.execute(sql`DELETE FROM "User"`);
    console.log(`✅ Deleted ${deletedUsers.count} user(s)`);

    console.log('\n🎉 All test data cleared successfully!\n');

    await client.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error clearing test data:', error);
    await client.end();
    process.exit(1);
  }
}

clearTestData();
