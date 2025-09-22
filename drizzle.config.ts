import { config } from 'dotenv';

config();

export default {
  schema: './db/schema.ts',
  out: './drizzle',
  verbose: true,
  strict: true,
};