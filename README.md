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

## Phases

- **v0**: Checks Google Calendar only
- **v1**: Also checks text messages
- **v2**: Beeper integration for all messaging services + Slack

## Setup

```bash
pip install -e ".[dev]"
cp .env.example .env
# Fill in your Google OAuth credentials and Anthropic API key
python -m scheduler.auth.google_auth  # Complete OAuth flow
```

## Usage

```bash
# Run onboarding (backfill stash calendar from last 2 months of Gmail)
python -m scheduler.onboarding

# Start the email watcher (monitors for scheduling emails, creates drafts)
python -m scheduler.watcher

# Run the message hook manually on a specific message
python -m scheduler.hook --message-id <id>
```

## E2B Template

For low-latency E2B runs, build a preprovisioned sandbox template instead of
installing Python and dependencies on every run.

```bash
e2b template build -n scheduler-agents
```

Then set:

```bash
export AGENT_RUNTIME=e2b
export CONTROL_PLANE_PUBLIC_URL=https://your-control-plane-url
export E2B_TEMPLATE_ID=scheduler-agents
```

If `E2B_TEMPLATE_ID` is unset, the code falls back to runtime provisioning
inside a fresh sandbox.
