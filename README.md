# Browseflow

**Describe the browser. Ship the workflow.**

Browseflow is a visual builder for AI browser automation. Compose Open URL, Act, Extract, Observe, Agent, HTTP, Wait, Condition, and email steps on a canvas — then run them with live status and session replay.

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

Also run the Trigger.dev worker for background runs and schedules:

```bash
npx trigger.dev@latest dev
```

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

## License

Private — all rights reserved.
