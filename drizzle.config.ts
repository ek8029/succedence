import { config } from 'dotenv';

config();

export default {
  schema: './db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  verbose: true,
  strict: true,
};