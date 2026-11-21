# NaukaPass

Boat boarding passes for **Dev Deepawali on the Ganges**, hosted by [TLS Hotels](https://tlshotels.com/) (The Lavish Stay).

Staff create a group booking (leader name, contact number, passengers), download or print a pass with QR plus group details, then scan at boarding. A second scan shows that the pass was already scanned. Admins can also edit status manually.

## Stack

- Next.js (App Router) + Tailwind CSS
- Username / password login from env vars
- **Supabase Postgres** for bookings on Vercel (persistent)
- **JSON file** (`.data/bookings.json`) as local fallback when Supabase env is not set
- Phone or tablet camera scan (`html5-qrcode`)

## Local setup (JSON, no Supabase)

```bash
cp .env.example .env.local
# Fill username / password / secret / SITE_URL
# Leave Supabase vars empty
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Vercel + Supabase (recommended for the event)

1. Create a free [Supabase](https://supabase.com) project.
2. In **SQL Editor**, run [`supabase/migrations/001_bookings.sql`](supabase/migrations/001_bookings.sql).
3. In **Project Settings → API**, copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (keep secret)
4. In Vercel → Project → Settings → Environment Variables, set:

| Name | Example |
|------|---------|
| `LOCAL_ADMIN_USERNAME` | `admin` |
| `LOCAL_ADMIN_PASSWORD` | your staff password |
| `LOCAL_AUTH_SECRET` | long random string |
| `NEXT_PUBLIC_SITE_URL` | `https://your-app.vercel.app` |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxx.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role key |

5. Redeploy. Login stays username/password; bookings are stored in Supabase so every phone shares the same list.

## Staff flow

1. **Dashboard** — create group booking.
2. **View QR** — download or print the pass.
3. **Scan** — confirm details, **Mark as boarded**.
4. Scanning again shows **This pass was already scanned.**
5. **Edit** — change details or set status Pending / Scanned.
