# NaukaPass

Boat boarding passes for **Dev Deepawali on the Ganges**, hosted by [TLS Hotels](https://tlshotels.com/) (The Lavish Stay).

Staff create a group booking (leader name, contact number, passengers), download or print a pass image with QR plus group details, then scan it at boarding. A second scan shows that the pass was already scanned.

## Stack

- Next.js (App Router) + Tailwind CSS
- JSON file store (`.data/bookings.json`) — fine for ~50 groups
- Shared admin login from `.env.local`
- Phone or tablet camera scan (`html5-qrcode`)

## Setup

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in with the username/password in `.env.local`.

## Where data lives

All bookings are stored in:

```text
.data/bookings.json
```

That folder is gitignored. Back it up if you care about the list after the event.

## Deploy note

Run this on **one machine** that can write to disk (laptop at the ghat, or a small VPS with `npm run build && npm start`).

Avoid multi-instance serverless hosts (e.g. default Vercel) for this JSON setup — the file would not persist reliably across instances. Phone camera scanning still needs **HTTPS** (or localhost).

## Staff flow

1. **Dashboard** — create group booking.
2. **View QR** — download or print the pass.
3. **Scan** — confirm details, **Mark as boarded**.
4. Scanning again shows **This pass was already scanned.**
