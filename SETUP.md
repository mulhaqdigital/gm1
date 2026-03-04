# GM1 — Setup Guide

## 1. Environment Variables

Copy the example env file and fill in your Supabase credentials:

```bash
cp .env.local.example .env.local
```

Get values from your [Supabase project settings → API](https://supabase.com/dashboard/project/_/settings/api).

For `DATABASE_URL`, use the **Transaction** pooler URL from Settings → Database → Connection string.

## 2. Database Setup

Run migrations against your Supabase database:

```bash
# Generate migration files from schema
npm run db:generate

# Push schema directly (fastest for MVP — skip migrations)
npm run db:push

# Open Drizzle Studio (DB GUI)
npm run db:studio
```

## 3. Supabase Auth Setup

In your Supabase dashboard:

1. Go to **Authentication → URL Configuration**
2. Set **Site URL** to `http://localhost:3000` (dev) / your prod URL
3. Add redirect URL: `http://localhost:3000/auth/callback`

## 4. SQL to run in Supabase SQL editor

The Drizzle schema creates all tables. Additionally, set up a trigger to auto-create a profile row when a user signs up:

```sql
-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

## 5. Run Dev Server

```bash
npm run dev
```

## 6. Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set env vars in Vercel dashboard or via CLI:
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add DATABASE_URL
```

## Project Structure

```
src/
├── app/
│   ├── (auth)/login        # Login page
│   ├── (auth)/signup       # Signup page
│   ├── (app)/dashboard     # Dashboard (groups + page grid)
│   ├── (app)/groups        # Browse/create groups
│   ├── (app)/groups/[id]   # Group detail + members
│   ├── (app)/pages         # All pages list
│   ├── (app)/pages/[id]    # Page detail with hierarchy + avatars
│   ├── admin/pages         # Hierarchy manager (site admin)
│   ├── api/                # All REST API routes
│   └── auth/callback       # Supabase auth redirect handler
├── components/
│   ├── groups/             # GroupCard, MemberAvatars
│   ├── pages/              # PageCard, PageTree
│   └── layout/             # Navbar
├── db/
│   ├── index.ts            # Drizzle client
│   └── schema/index.ts     # All table definitions
└── lib/
    ├── api.ts              # ok/err response helpers
    ├── permissions.ts      # Auth + role helpers
    └── supabase/           # Client + server Supabase helpers
```
