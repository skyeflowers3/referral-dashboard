# GT Referral Program Dashboard

Demo dashboard for tracking family referrals and program analytics. Built with React, TypeScript, Tailwind CSS, and Recharts. Data is mocked to mirror a future Supabase schema.

## Views

- **Tracker** — Sortable/filterable table of individual referrals
- **Dashboard** — Participation, conversion, cost, retention, and tier distribution

## Mock data shape

| Table | Count | Purpose |
|-------|------:|---------|
| `families` | ~150 | All enrolled GT families |
| `referrers` | ~23 | Families with ≥1 referral (~15% participation) |
| `referrals` | ~36 | Individual referral pipeline records |

Data access goes through `src/services/mockDataService.ts` (`getFamilies`, `getReferrers`, `getReferrals`, `getReferralRows`, `getMetrics`). Swap those function bodies for Supabase queries later without changing the UI.

## Scripts

```bash
npm install
npm run dev
npm run build
```
