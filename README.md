# EstateHub

A full-stack MERN real-estate marketplace where customers browse and enquire about properties, and agents manage their own listings, leads, and site visits.

> **Project status: Stage 0 — repository scaffolding.**
> The application is not runnable yet. The `client/` and `server/` packages, database connection, and dependency installation arrive in later stages (see [Roadmap](#roadmap)).

## Tech stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19 + Vite (JavaScript), React Router, Tailwind CSS v4, Axios |
| Backend | Node.js + Express (ES modules) |
| Database | MongoDB Atlas (free tier) with Mongoose |
| Auth | JWT in an httpOnly cookie, bcrypt password hashing, role-based authorization |
| Validation | Zod on the server |
| Tests | Vitest + Supertest + mongodb-memory-server |
| Currency | INR (₹), Indian digit grouping via `Intl.NumberFormat('en-IN')` |

## Planned structure

```
RealEst/
├─ client/     React + Vite single-page application
├─ server/     Express REST API, Mongoose models, seed script, tests
├─ package.json   Root scripts that delegate to client/ and server/
└─ README.md
```

Each package keeps its own `package.json` and `node_modules`, so dependency trees stay isolated and easy to reason about. Root scripts use `npm --prefix` to delegate.

## Prerequisites

- Node.js **20.19+** (developed against Node 24)
- npm 10+
- Git
- A MongoDB Atlas account with a free **M0** cluster (setup notes below)

No paid services or external API keys are required. Property images are remote URLs; image uploads are out of scope for the initial build.

## Getting started

This section is completed as the implementation stages land. Once `client/` and `server/` exist:

```bash
npm install                # root tooling
npm install --prefix server
npm install --prefix client
cp server/.env.example server/.env   # then fill in real values
npm run seed
npm run dev
```

The API listens on `http://localhost:5000` and Vite proxies `/api` requests from `http://localhost:5173`.

## Environment variables

Secrets live only in untracked `.env` files. `.env.example` files list the required keys with empty or safe placeholder values.

| Variable | Package | Purpose |
| --- | --- | --- |
| `MONGODB_URI` | server | Atlas connection string (temporary or SRV) |
| `JWT_SECRET` | server | Long random string used to sign tokens |
| `JWT_EXPIRES_IN` | server | Token lifetime, e.g. `7d` |
| `PORT` | server | API port, default `5000` |
| `NODE_ENV` | server | `development` / `test` / `production` |
| `CLIENT_ORIGIN` | server | Allowed CORS origin and cookie scope |
| `VITE_API_URL` | client | Base URL for API calls (`/api` when proxied) |

## MongoDB Atlas setup

1. Create a free **M0** cluster at <https://cloud.mongodb.com> (no card required).
2. Create a database user with a generated password; store the password in a password manager.
3. Under **Network Access**, add your current IP address (avoid `0.0.0.0/0` outside throwaway development).
4. Choose **Connect → Drivers**, copy the connection string, and substitute the database user password and a database name such as `estatehub`.
5. Put the result in `server/.env` as `MONGODB_URI`. Never commit it or paste it into source files.

## Root scripts

| Command | Does |
| --- | --- |
| `npm run dev` | Runs API and Vite dev server together (after later stages) |
| `npm run dev:server` / `npm run dev:client` | Runs one side only |
| `npm run seed` | Loads development sample data (idempotent) |
| `npm test` | Runs the server test suite |
| `npm run build` | Builds the client for production |
| `npm start` | Starts the API in production mode |

## Roadmap

- [x] **Stage 0** — repository scaffolding, `.gitignore`, root scripts, README
- [ ] **Stage 1** — Express scaffold: config, Atlas connection, health route, error handling, CORS
- [ ] **Stage 2** — User model and JWT cookie authentication with customer/agent roles
- [ ] **Stage 3** — Property model, marketplace search/filter/sort/pagination, agent CRUD
- [ ] **Stage 4** — Idempotent seed script with realistic sample listings
- [ ] **Stage 5** — React/Vite/Tailwind scaffold, routing, auth context, layout
- [ ] **Stage 6** — Public marketplace UI with responsive filters and detail pages
- [ ] **Stage 7** — Login, registration, protected and role-gated routes
- [ ] **Stage 8** — Customer dashboard: profile, favourites, enquiries, visits
- [ ] **Stage 9** — Agent dashboard: listings, lead inbox, visit management
- [ ] **Stage 10** — Security and UX hardening pass
- [ ] **Stage 11** — Automated tests for auth, properties, and visit rules
- [ ] **Stage 12** — Final docs, production build, end-to-end walkthrough

## Notes

- Demo accounts from the seed script will be documented here after Stage 4. They are development fixtures only.
- The GitHub-style checklist above is the single source of truth for progress.
