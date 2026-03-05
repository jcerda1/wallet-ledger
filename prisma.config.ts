import 'dotenv/config';
import { defineConfig } from 'prisma/config';

let datasource: Record<string, unknown> | undefined;
if (process.env.DATABASE_URL) {
  const { env } = require('prisma/config');
  datasource = {
    url: env('DATABASE_URL'),
    ...(process.env.DATABASE_SHADOW_URL
      ? { shadowDatabaseUrl: env('DATABASE_SHADOW_URL') }
      : {}),
  };
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations' },
  ...(datasource && { datasource }),
});
