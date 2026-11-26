# Supabase setup for VowInvite Studio

1. Create a Supabase project at https://database.new.
2. Choose a strong database password and a region close to your audience (Singapore is a good default for Indonesia, if available).
3. Open SQL Editor and run `migrations/202611270001_initial_schema.sql` from this repository.
4. In Project Settings / API Keys (or the Connect panel), copy the Project URL and the **publishable** key.
5. Add these to Vercel Project Settings → Environment Variables for Production, Preview, and Development:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
6. Redeploy the Vercel project.

Never put a Supabase **secret** key or legacy `service_role` key in Vite variables, GitHub, or browser code. The publishable key is designed for client-side use only when Row Level Security policies are enabled.

The migration creates:
- `invitations`: user-owned invitation records and share slugs
- `invitation_rsvps`: guest responses, visible only to the invitation owner
- `invitation-media` Storage bucket: public reads for published assets; uploads/updates/deletes restricted to each authenticated user's folder

Authentication UI and application data migration are the next integration step after the project URL and publishable key are available.
