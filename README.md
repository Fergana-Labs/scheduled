# Scheduled

**Open source Calendly, but AI.**

![Scheduled hero](assets/hero.png)

Scheduled is an AI scheduling agent that lives in your Gmail. When someone emails you to set up a meeting, Scheduled reads the thread, checks your calendar for availability, and drafts a reply with proposed times, all without you lifting a finger. You review the draft and hit send. That's it.

No new app to learn. No link to paste into emails. No configuration to maintain. Just one fewer thing on your plate.

Read our blog post about why we built this [here](https://x.com/samzliu/status/2034412249201443116?s=20).

## Why Scheduled?

**Scheduling is the laundry of knowledge work.** Each email is trivial on its own, but in aggregate they create dozens of open threads that weigh on your mind and generate friction wildly disproportionate to the time they'd take to complete.

Existing tools like Calendly assume you work a certain way: impersonal mass meeting scheduling, structured availability blocks, consistent meeting types. If that's not you, they fall flat. Scheduled doesn't impose a workflow. It reads your actual calendar and email history, understands your preferences, and drafts replies the way you would.

## Features

- **Draft-only by design** — Scheduled never sends emails on your behalf. It writes drafts for you to review, so you stay in control.
- **Works inside Gmail** — No new interface to learn. Scheduled meets you where you already work.
- **Bootstraps from your history** — On setup, it reads your past emails and calendar to learn your scheduling patterns and preferences. No manual configuration needed.
- **Handles the nuance** — Group meetings vs. 1:1s, timezone awareness, follow-ups, and prioritization are all handled automatically.
- **Learns your writing style** — Analyzes your past emails so drafts sound like you, not a robot.
- **Remembers your preferences** — Knows you prefer mornings, avoid Fridays, or always buffer 30 minutes between calls — without you having to set rules.
- **Autopilot mode** — For the brave: let Scheduled send replies automatically so scheduling happens entirely in the background.
- **Privacy minded** — Besides your email preferences, we store no data (no emails, no calendar events) on our servers. Everything stays on Google in its existing ecosystem.
- **Open source and self-hostable** — Run it on your own infrastructure with your own API keys. Your data stays yours.

## Self-Hosted Setup

See [docs/self-hosting.md](docs/self-hosting.md) for detailed instructions including GCP webhook setup and optional E2B sandboxing. If you are considering self hosting, feel free to reach out to henry@ferganalabs.com or sam@ferganalabs.com and we can help you get set up.

### Quick start

```bash
# Install
pip install -e ".[dev]"

# Configure
cp .env.example .env
# Fill in: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, ANTHROPIC_API_KEY, DATABASE_URL
# SCHEDULER_DEPLOYMENT_MODE defaults to self_hosted (no Auth0 needed)

# Authenticate with Google
python -m scheduler.auth.google_auth

# Run onboarding (backfill scheduled calendar from last 2 months of Gmail)
python -m scheduler.onboarding

# Start the email watcher (monitors for scheduling emails, creates drafts)
python -m scheduler.watcher
```

## Run the app

```bash
# Control plane (API)
uvicorn scheduler.controlplane.server:app --host 0.0.0.0 --port 8080

# Frontend (separate terminal)
cd web && NEXT_PUBLIC_CONTROL_PLANE_URL=http://localhost:8080 npm run dev
```

## Running locally versus our production setup

The app can run with plain Google OAuth without any user authentication (this is how we originally ran it locally). We use Auth0 for auth in production since it supports multi-tenant.

We also run our agents in e2b sandboxes rather than locally. You can also run your agents on e2b if you want:

```bash
# Build a preprovisioned sandbox template
e2b template build -n scheduler-agents

# Configure
export AGENT_RUNTIME=e2b
export CONTROL_PLANE_PUBLIC_URL=https://your-control-plane-url
export E2B_TEMPLATE_ID=scheduler-agents
```

If `E2B_TEMPLATE_ID` is unset, the code falls back to runtime provisioning inside a fresh sandbox.

## Cron Jobs

Two recurring jobs keep the system healthy:

| Job | Endpoint | Schedule |
|---|---|---|
| Renew Gmail watches | `POST /api/v1/gmail/watch/renew` | Daily, 2 AM |
| Run guide updater | `POST /api/v1/guides/update-all` | Weekly, Monday 6 AM |

Both endpoints return immediately — all processing runs in background tasks on the server.

### Production auth

Set `CRON_SECRET` to a long random string in your environment. The server rejects any request to these endpoints that doesn't include the matching `X-Cron-Secret` header. The check is skipped when `CRON_SECRET` is unset (safe for local dev).

```bash
# Generate a secret
python -c "import secrets; print(secrets.token_hex(32))"
```

### Deploying on Render (recommended)

Create two **Cron Job** services in the Render dashboard (New → Cron Job). No Python environment needed — the commands are plain `curl`:

**Daily — Gmail watch renewal**
```
Schedule: 0 2 * * *
Command:  curl -sf -X POST -H "X-Cron-Secret: $CRON_SECRET" $CONTROL_PLANE_URL/api/v1/gmail/watch/renew
```

**Weekly — Guide updater**
```
Schedule: 0 6 * * 1
Command:  curl -sf -X POST -H "X-Cron-Secret: $CRON_SECRET" $CONTROL_PLANE_URL/api/v1/guides/update-all
```

Set `CRON_SECRET` and `CONTROL_PLANE_URL` as environment variables on each cron service (or via a Render environment group shared with the web service). The `-sf` flags cause `curl` to exit non-zero on HTTP errors so Render marks failed runs correctly.

> **Note:** if your web service is on Render's free tier it spins down between requests. Add a pre-warm step to avoid timeouts: prepend `curl -sf $CONTROL_PLANE_URL/health && ` before the actual cron command.

### Local dev / self-hosted

Use the helper script, which wraps the same HTTP calls:

```bash
python scripts/cron_jobs.py --job daily
python scripts/cron_jobs.py --job weekly
```

Or add to your system crontab (`crontab -e`):

```cron
0 2 * * *   cd /path/to/scheduled && /path/to/venv/bin/python scripts/cron_jobs.py --job daily  >> /var/log/scheduled-cron.log 2>&1
0 6 * * 1   cd /path/to/scheduled && /path/to/venv/bin/python scripts/cron_jobs.py --job weekly >> /var/log/scheduled-cron.log 2>&1
```

### What the guide updater does

Once a week the updater agent reads the last 7 days of edited drafts — emails the assistant composed that the user changed before sending — and proposes surgical updates to the `email_style` and `scheduling_preferences` guides. Changes only apply when a pattern has been observed at least 3× (style) or 5× (preferences), preventing one-off edits from polluting the guides.

Every run is logged in `guide_update_runs` and visible in the **Guide Updates** tab at `/admin`.

## Evals

Eval fixtures and golden data live in a separate private repo because they contain real confidential data from Henry's personal email:

```bash
cd ~/projects
git clone https://github.com/Fergana-Labs/scheduler-evals.git
```

The main repo has symlinks in `evals/` and `eval/fixtures/` pointing to `../scheduler-evals`. Once both repos are cloned side by side, everything just works.

```bash
# Record a fresh fixture
python -m scheduler.eval record --out ../scheduler-evals/fixtures/baseline.json

# Run classifier evals
python -m scheduler.eval classify --fixture eval/fixtures/baseline.json

# Run draft evals
python -m scheduler.eval draft --fixture eval/fixtures/baseline.json

# Run guide-writer evals
python -m scheduler.eval guides --fixture eval/fixtures/baseline.json

# Run guide updater evals (uses updater_diffs key in fixture.json)
python -m scheduler.eval updater
```

## License

MIT

## Screenshots

| Drafting a reply | Settings |
|:---:|:---:|
| ![Draft](assets/draft.png) | ![Settings](assets/settings.png) |
