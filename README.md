# Matchathon

Find hackathon teammates who care about what you care about, and bring the skills your team is missing.

Matchathon started as a weekend team project at AthenaHacks 2025 ([original repo](https://github.com/chinmayeesawant/MyAthenaHacksProject)), built with three teammates. This repository is my redesigned rebuild of it: a new backend with a rewritten matching algorithm, real authentication, and tests, plus a new café-themed frontend.

## How matching works

You join a hackathon, then swipe through other people going to the same one. Each candidate gets a score from 0 to 100:

| Signal | Weight | What it measures |
|---|---|---|
| Shared interests | 45% | Jaccard similarity of interests: shared ÷ combined |
| Complementary skills | 45% | Skills they have that neither you nor your current teammates have (3 or more new skills = full marks) |
| Already liked you | 10% | Makes a mutual match more likely. Used for ranking only, never shown |

Every suggestion comes with a plain-language reason, for example:

> You both care about Sustainability and Edtech, and Maya brings Swift, iOS and Figma — skills your team doesn't have yet.

When two people like each other, they're put on a team. If one of them already has a team with room, the other joins it. Teams fill up to the hackathon's size limit (4 by default), and then matching stops for that team.

The algorithm is in [`server/src/services/scoring.js`](server/src/services/scoring.js). It's pure functions with no database access, so it's easy to unit test.

## Tech stack

- **API:** Node.js, Express 5, MongoDB with Mongoose
- **Auth:** bcrypt password hashing, JWT bearer tokens, rate-limited login
- **Validation:** zod
- **Tests:** Node's built-in test runner, supertest, and mongodb-memory-server (an in-memory MongoDB, so no setup is needed)
- **Frontend:** Next.js 16 (App Router), React 19, Tailwind CSS 4, lucide icons

## Design

**MatchaOS**: the app is a retro desktop on grid paper. Every page is a window with a pixel-font title bar (`match_found.exe`, `team.dir`, `profile.cfg`), sitting on a sky-and-hills wallpaper with drifting pixel clouds, plus a taskbar and clock. Match reasons print in a terminal, a mutual match pops up a "System Alert", and the mascot is a pixel-art matcha latte. Sticky notes and tape add a hand-made scrapbook touch.

Colors are Garden Matcha `#668B4A`, Milk Foam `#F8F1DC`, and Mocha `#5A4636`, with lemon sticky notes. Fonts: Bricolage Grotesque for headings, Space Mono for everything else, and the pixel font Silkscreen only for window title bars and the logo.

The tokens live in [`client/app/globals.css`](client/app/globals.css).

## Data model

```
User       email, passwordHash, profile, skills[], interests[], hackathons[] → Hackathon
Hackathon  name, slug, dates, location, maxTeamSize
Swipe      from → User, to → User, hackathon → Hackathon, action: like | pass
Team       hackathon → Hackathon, members[] → User
```

Swipes live in their own collection instead of in arrays on the user, so "did they like me back?" is a single indexed lookup and user documents don't grow without bound. A unique index on `(from, hackathon, to)` means each person decides on each candidate at most once per hackathon. Adding someone to a team is a single atomic update that only succeeds while there's room, so two people can't overfill the same team at the same moment.

## Running it locally

You need Node.js 20 or newer.

### Quick start (no database setup)

This starts a throwaway in-memory MongoDB with sample data. Nothing is saved when you stop it.

```bash
cd server && npm install && npm run dev:memory     # API on http://localhost:5001
```

In a second terminal:

```bash
cd client && npm install && npm run dev            # site on http://localhost:3000
```

Log in as `demo.user@example.com` with the sample password `matcha-latte-123`.

### With a real database

Use a local MongoDB, or a free cluster on [MongoDB Atlas](https://www.mongodb.com/atlas).

```bash
cd server
cp .env.example .env      # then fill in MONGO_URI and JWT_SECRET
npm run seed              # sample hackathons and 12 sample people
npm run dev               # http://localhost:5001
```

The frontend reads the API address from `NEXT_PUBLIC_API_URL` (see `client/.env.example`). It defaults to `http://localhost:5001/api`.

Run the tests (no database needed):

```bash
cd server
npm test
```

## API

All routes except register, login, and health need an `Authorization: Bearer <token>` header. Routes always act on the logged-in user. Nobody can read or edit another person's account by putting their email in a URL.

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Create an account and get a token |
| `POST` | `/api/auth/login` | Log in and get a token |
| `GET` | `/api/auth/me` | Your profile, with your hackathons |
| `PATCH` | `/api/users/me` | Update your profile |
| `GET` | `/api/users/:id` | Someone's public profile (no email) |
| `GET` | `/api/hackathons` | All hackathons, with attendee counts |
| `POST` / `DELETE` | `/api/hackathons/:id/join` | Join or leave a hackathon |
| `GET` | `/api/matches/next?hackathon=:id` | The best next person to look at, with a score and reason |
| `POST` | `/api/matches/swipe` | `{ hackathon, userId, action: "like" \| "pass" }` |
| `GET` | `/api/matches?hackathon=:id` | People you've mutually matched with |
| `GET` | `/api/teams` | Your teams, with members |
| `PATCH` | `/api/teams/:id` | Rename your team |
| `POST` | `/api/teams/:id/leave` | Leave a team (a team of two dissolves) |
| `GET` | `/api/health` | Health check |

## What changed from the hackathon version

- **Matching:** the original sent every candidate's profile to an LLM and asked it to pick one. The rebuild ranks candidates with a transparent scoring algorithm and also counts the skills your teammates already have. It runs instantly, needs no API key, and always explains its pick.
- **Security:** the original issued JWTs but never checked them, so anyone could read or edit any profile by email. Every route now verifies the token. Secrets live only in a git-ignored `.env`.
- **Data model:** the original had unused Mongoose models and overlapping fields (`matches`, `matchedWith`, `team`). The rebuild uses four clear collections with indexes, and teams are scoped to a hackathon.
- **Tests:** 19 automated tests covering the algorithm and the full API flow.
