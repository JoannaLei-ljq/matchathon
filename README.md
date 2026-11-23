# Matchathon

Find hackathon teammates who share your interests and bring the skills your team is missing.

Rebuilt from a team project at AthenaHacks 2025 ([original repo](https://github.com/chinmayeesawant/MyAthenaHacksProject)), with a new backend, matching algorithm, and retro-desktop UI.

## How matching works

Join a hackathon and swipe through people going to it. Each candidate is scored 0–100:

- **Shared interests (45%):** Jaccard similarity of your interests
- **Complementary skills (45%):** skills neither you nor your teammates have yet
- **Already liked you (10%):** used for ranking only, never shown

Every pick comes with a reason, like *"You both care about Edtech, and Maya brings Swift and Figma, skills your team doesn't have yet."* Mutual likes form a team, up to 4 people. The algorithm is in [`server/src/services/scoring.js`](server/src/services/scoring.js).

## Highlights

- Swipes live in their own indexed collection, so checking for a mutual like is one lookup
- Joining a team is a single atomic update, so teams can't overfill
- JWT auth on every route, bcrypt passwords, rate-limited login, zod validation
- 19 tests covering the algorithm and the full API flow, run against an in-memory MongoDB

## Stack

Next.js 16 · React 19 · Tailwind CSS 4 · Express 5 · MongoDB + Mongoose · Node test runner

## Run locally

Requires Node.js 20+. No database setup needed:

```bash
cd server && npm install && npm run dev:memory   # API on :5001, sample data
```

```bash
cd client && npm install && npm run dev          # site on :3000
```

Log in as `demo.user@example.com` / `matcha-latte-123`. Restart the server to reset the data.

To use a real database, copy `server/.env.example` to `server/.env`, fill it in, then run `npm run seed` and `npm run dev`.

Tests: `cd server && npm test`
