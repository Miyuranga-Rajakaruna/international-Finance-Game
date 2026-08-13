# Operation 1982 · Courtroom Debt Crisis Trial

An interactive web application simulation of the 1982 Latin American Debt Crisis designed for classroom court trials and presentations.

## Features
- **4 Courtroom Exhibits**: Washington Testimony, Petrodollar Inflows, US Monetary Tightening, and Rescue Initiatives.
- **Secret Keyword Decryption**: Unlocks individual letters as courtroom exhibit evidence questions are answered correctly.
- **Self-Paced Gameplay**: Students progress independently without requiring manual host unlocks.
- **1st Place Speed Ranking**: Ranks verified winners by accuracy (4/4 score) and fastest completion time.
- **Admin Control (`/admin`)**: Realtime dashboard to monitor all student answers and reset game data with one click.

## Tech Stack
- **Frontend**: React, TanStack Router, Vite, Tailwind CSS, Motion (Framer Motion), Lucide Icons
- **Backend & Database**: Supabase (PostgreSQL with Realtime subscriptions)

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```
