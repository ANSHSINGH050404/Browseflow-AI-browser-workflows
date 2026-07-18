# Browseflow

**Describe the browser. Ship the workflow.**

Browseflow is a visual builder for AI browser automation. Compose Open URL, Act, Extract, Observe, Agent, HTTP, Wait, Condition, and email steps on a canvas — then run them with live status and session replay.

## Live demo

**Production:** [https://browseflow-wine.vercel.app](https://browseflow-wine.vercel.app)

## Features

- **Visual workflows** with React Flow + multiplayer editing (Liveblocks)
- **AI browser nodes** powered by Stagehand + Browserbase
- **Templates** to get a first successful run in minutes
- **Schedule triggers** (hourly / daily)
- **Session replay** after browser runs
- **Org billing** (Free: 3 workflows; Pro: unlimited + Agent node)

## Stack

- Next.js, Clerk (auth + billing), Neon/Drizzle, Trigger.dev, Liveblocks, Resend, Sentry

## Getting started

```bash
npm install
npm run dev
```

**Required for automation:** runs are processed by a Trigger.dev worker. Without it, jobs sit in `QUEUED` and then **EXPIRED** (this looks like “queued then stopped”).

In a **second** terminal:

```bash
npm run trigger:dev
```

Leave both processes running. Then click **Run** in the app.

If a run already expired, start the worker and click **Run** again.

### Environment

Copy your existing `.env` keys. Notable variables:

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Neon Postgres |
| Clerk keys | Auth + org billing |
| `BROWSERBASE_API_KEY` | Browser sessions + model gateway |
| Trigger.dev keys | Workflow runs |
| Liveblocks secret | Collab rooms |
| `RESEND_API_KEY` | Send Email node |
| `RESEND_FROM_EMAIL` | Verified sender, e.g. `Browseflow <alerts@yourdomain.com>` |

## Free vs Pro

| | Free | Pro |
|--|------|-----|
| Workflows | 3 | Unlimited |
| Runs / month | 50 | Unlimited* |
| Core nodes | Yes | Yes |
| Agent node | Locked | Yes |

\*Pro run volume is not capped in-app; Browserbase/LLM usage still bills through your providers.

### Demo video on the landing page

Set `NEXT_PUBLIC_DEMO_VIDEO_URL` to a YouTube or Vimeo URL to embed a real demo.
Without it, the landing page shows an animated product mock.

## Docs

In-app guide: `/help` after the app is running, or open [Help](/help) once deployed.

## Deploy (free path)

| Layer | Host |
|-------|------|
| Web app | **Vercel** (connect this GitHub repo; set env vars in Vercel) |
| Workers | **Trigger.dev** (`npm run trigger:deploy` or CI on `main`) |
| Database | **Neon** (`npm run db:push` once against prod) |

Without Trigger deploy, production **Run** stays `QUEUED` then `EXPIRED`.

### CI/CD

| Workflow | When | What |
|----------|------|------|
| `.github/workflows/ci.yml` | Every PR / push | `typecheck`, `lint`, `build` |
| `.github/workflows/deploy-trigger.yml` | Push to `main` (or manual) | `trigger.dev deploy --env prod` |

**GitHub secret (required for worker deploys):**

1. Trigger.dev → Account → **Access Tokens** → create a token  
2. GitHub repo → Settings → Secrets and variables → Actions  
3. Add `TRIGGER_ACCESS_TOKEN`

**Still configure outside CI:**

- **Vercel** project env vars (Clerk, DB, Trigger prod key `tr_prod_…`, Liveblocks, Browserbase, …)  
- **Trigger.dev** Production environment variables (`DATABASE_URL`, `BROWSERBASE_API_KEY`, Resend, …)  
- **Clerk** allowed origins for your `*.vercel.app` (or custom) domain  

After merge to `main`: Vercel ships the site; Actions ships workers. Smoke-test **Run**.

## License

Private — all rights reserved.
