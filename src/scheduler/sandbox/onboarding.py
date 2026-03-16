"""Sandbox onboarding agent — runs inside e2b, calls the control plane over HTTP.

Uses the shared onboarding agent with ControlPlaneClient as the backend.
No auth tokens ever enter the sandbox.
"""

import os

from scheduler.onboarding.agent import run_onboarding_agent
from scheduler.sandbox.api_client import ControlPlaneClient


def run_onboarding():
    """Entry point for running the onboarding agent inside the sandbox."""
    control_plane_url = os.environ["CONTROL_PLANE_URL"]
    session_token = os.environ["SESSION_TOKEN"]
    lookback_days = int(os.environ.get("ONBOARDING_LOOKBACK_DAYS", "60"))

    backend = ControlPlaneClient(control_plane_url, session_token)
    run_onboarding_agent(backend, lookback_days)


if __name__ == "__main__":
    run_onboarding()
