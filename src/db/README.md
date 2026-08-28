# Persistence foundation

Create a local `.env.local` with a PostgreSQL-compatible connection string:

```text
DATABASE_URL=postgresql://...
```

Then run:

```text
pnpm db:migrate
pnpm db:seed
```

`db:seed` inserts four synthetic account graphs. It is intentionally separate
from the current demo session and home-page data flow. No live EPFO data or
credentials are used.

To create a new migration after changing `src/db/schema.ts`:

```text
pnpm db:generate
```
