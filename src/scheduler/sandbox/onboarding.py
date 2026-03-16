"""Sandbox onboarding — runs all three onboarding agents inside e2b.

Launches the backfill agent, preferences agent, and style agent in
parallel. All three call the control plane over HTTP — no auth tokens
ever enter the sandbox.
"""

import os

import anyio

from scheduler.onboarding.agent import _run_onboarding_async as _run_backfill
from scheduler.guides.preferences import run_preferences_agent
from scheduler.guides.style import run_style_agent
from scheduler.sandbox.api_client import ControlPlaneClient


async def _run_all():
    control_plane_url = os.environ["CONTROL_PLANE_URL"]
    session_token = os.environ["SESSION_TOKEN"]
    lookback_days = int(os.environ.get("ONBOARDING_LOOKBACK_DAYS", "60"))

    backend = ControlPlaneClient(control_plane_url, session_token)

    async with anyio.create_task_group() as tg:
        tg.start_soon(_run_backfill, backend, lookback_days)
        tg.start_soon(run_preferences_agent, backend)
        tg.start_soon(run_style_agent, backend)


def run_onboarding():
    """Entry point for running all onboarding agents inside the sandbox."""
    anyio.run(_run_all)


if __name__ == "__main__":
    run_onboarding()
