import { config } from 'dotenv';
import postgres from 'postgres';
import * as fs from 'fs';
import * as path from 'path';

// Try .env.local first, then .env
config({ path: '.env.local' });
config();

async function runMigration() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  const sql = postgres(connectionString);

  try {
    console.log('Running broker role migration...');

    const migrationPath = path.join(__dirname, '..', 'drizzle', '0002_add_broker_role.sql');
    const migrationSql = fs.readFileSync(migrationPath, 'utf-8');

    // Split by statement-breakpoint and filter out empty statements
    const statements = migrationSql
      .split('--> statement-breakpoint')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const statement of statements) {
      console.log('Executing:', statement.substring(0, 100) + '...');
      await sql.unsafe(statement);
    }

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await sql.end();
  }
}

runMigration();
