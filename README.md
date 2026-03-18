# Scheduler

Inbound scheduling agent — automatically drafts email responses with proposed meeting times by checking all the places you store your commitments.

## How it works

1. **Email monitoring**: Watches your Gmail for emails asking to schedule something
2. **Scheduling intent classification**: LLM classifies whether an email is asking to schedule a meeting
3. **Scheduled calendar**: A real Google Calendar that serves as the single source of truth for all commitments (even ones without formal calendar invites)
4. **Draft generation**: Proposes available times in a draft reply

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Gmail Watcher   │────▶│ Intent Classifier │────▶│ Availability    │
│ (new emails)     │     │ (is this about    │     │ Checker         │
│                  │     │  scheduling?)     │     │                 │
└─────────────────┘     └──────────────────┘     └────────┬────────┘
                                                          │
                                                          ▼
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Onboarding      │────▶│  Scheduled Calendar   │────▶│ Draft Composer  │
│  Agent           │     │  (Google Cal)     │     │ (propose times) │
│ (backfill 2mo)   │     │                  │     │                 │
└─────────────────┘     └──────────────────┘     └─────────────────┘
        │
        ▼
┌─────────────────┐
│  Message Hook    │
│ (ongoing: new    │
│  msgs → stash)   │
└─────────────────┘
```

## Self-Hosted Setup

See [docs/self-hosting.md](docs/self-hosting.md) for detailed instructions including GCP webhook setup and optional E2B sandboxing.

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

## Usage

```bash
# Run onboarding (backfill scheduled calendar from last 2 months of Gmail)
python -m scheduler.onboarding

# Start the email watcher (monitors for scheduling emails, creates drafts)
python -m scheduler.watcher

# Run the message hook manually on a specific message
python -m scheduler.hook --message-id <id>
```

## Deployment modes

| Mode | `SCHEDULER_DEPLOYMENT_MODE` | Auth provider | When to use |
|------|---------------------------|---------------|-------------|
| **Self-hosted** (default) | `self_hosted` | Google OAuth only | Running your own instance |
| **Auth0** | `auth0` | Auth0 + Google OAuth | Multi-tenant hosted deployment |

## E2B Sandbox (optional)

For running agents in isolated cloud sandboxes instead of locally:

```bash
# Build a preprovisioned sandbox template
e2b template build -n scheduler-agents

# Configure
export AGENT_RUNTIME=e2b
export CONTROL_PLANE_PUBLIC_URL=https://your-control-plane-url
export E2B_TEMPLATE_ID=scheduler-agents
```

If `E2B_TEMPLATE_ID` is unset, the code falls back to runtime provisioning inside a fresh sandbox.

## Phases

- **v0**: Checks Google Calendar only
- **v1**: Also checks text messages
- **v2**: Beeper integration for all messaging services + Slack

## License

MIT
