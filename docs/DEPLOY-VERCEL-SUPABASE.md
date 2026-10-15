# Deploy PulseCover on Vercel + Supabase (the lecturer's recommended setup)

* **Supabase (free)** = the database (accounts, policies, claims, wearable data).
* **Vercel (free)** = hosts the website pages and the API (`api/` runs as Vercel functions).
* Result: one link, e.g. `https://pulsecover.vercel.app`, that works in any browser.

Everything is already coded. You only create two free accounts, copy one connection string and click Deploy.

## Part 1. Supabase (database)

1. Go to https://supabase.com, **Start your project**, sign in with GitHub.
2. **New project**: Name `pulsecover`, set a **Database password** (save it), Region **Asia-Pacific (any; the guide sets Vercel to Mumbai)**, Plan **Free**. Wait about 2 minutes.
3. Press the green **Connect** button at the top of the project page.
4. Under **Connection string**, open the **Transaction pooler** tab (port 6543). Copy the URI. It looks like
   `postgresql://postgres.abcdxyz:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres`
5. Replace `[YOUR-PASSWORD]` with the database password from step 2. This full text is your `DATABASE_URL`.
6. Tables are created automatically on the first request. (Optional: **SQL Editor > New query**, paste `supabase/schema.sql`, **Run**.)

## Part 2. Vercel (website + API)

1. Go to https://vercel.com, **Sign Up** with GitHub (Hobby / free plan).
2. **Add New > Project**, pick the repository `pulsecover-website`, branch `vercel-supabase` (or `main` once merged). Click **Import**.
3. Leave Framework as **Other**. Do not change build settings (`vercel.json` already sets them).
4. Open **Environment Variables** and add:
   * `DATABASE_URL` = the string from Supabase step 5
   * (optional) `SHEET_WEBHOOK_URL` and `SHEET_SECRET` for the confirmation emails and Google Sheet log
5. Click **Deploy**. After about a minute you get your link.

## Part 3. Check it works

1. Open `https://YOUR-PROJECT.vercel.app/api/health`. You should see `{"ok":true, ... "accounts":0 ...}`.
2. Open the home page. Register (18 or older), connect a wearable, apply, file a claim.
3. In Supabase **Table Editor > users** you see the account you just made. That proves Supabase is the backend.

## Common problems

| You see | Fix |
|---|---|
| `The database is not connected yet` | `DATABASE_URL` missing in Vercel. Add it, then **Deployments > Redeploy**. |
| `Server error` on every page | Wrong password inside `DATABASE_URL`, or you copied the Direct connection. Use the **Transaction pooler** string. |
| Password has `@` or `#` | Type it URL-encoded (`@` = `%40`, `#` = `%23`) or reset a simpler password in Supabase > Project Settings > Database. |
| Free Supabase project paused after 1 week unused | Open Supabase and click **Restore project**. Do this before the demo. |

## Running it on your laptop

```bash
cp .env.example .env     # then paste DATABASE_URL into .env
npm install
node server.js           # http://localhost:3000
```
