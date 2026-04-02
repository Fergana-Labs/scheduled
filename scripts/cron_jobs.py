#!/usr/bin/env python3
"""Scheduled cron jobs for the Scheduled app.

Run via system crontab or any scheduler. Each job hits an internal API
endpoint on the running server. The script exits 0 on success, non-zero
on any failure (so cron can alert on failure).

Usage:
    python scripts/cron_jobs.py --job daily
    python scripts/cron_jobs.py --job weekly

Crontab entries (add with `crontab -e`):
    # Daily: renew Gmail watches at 2am
    0 2 * * * /path/to/venv/bin/python /path/to/scheduled/scripts/cron_jobs.py --job daily >> /var/log/scheduled-cron.log 2>&1

    # Weekly: update guides every Monday at 6am
    0 6 * * 1 /path/to/venv/bin/python /path/to/scheduled/scripts/cron_jobs.py --job weekly >> /var/log/scheduled-cron.log 2>&1
"""

import argparse
import json
import os
import sys
import urllib.request
import urllib.error
from datetime import datetime


def _server_url() -> str:
    """Resolve the server base URL.

    Checks CONTROL_PLANE_URL env var first, then falls back to localhost:8080.
    """
    return os.environ.get("CONTROL_PLANE_URL", "http://localhost:8080").rstrip("/")


def _post(path: str) -> dict:
    """POST to the server and return the parsed JSON response."""
    url = _server_url() + path
    req = urllib.request.Request(url, method="POST", data=b"")
    req.add_header("Content-Type", "application/json")
    try:
        with urllib.request.urlopen(req, timeout=300) as resp:
            body = resp.read().decode()
            return json.loads(body)
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        raise RuntimeError(f"HTTP {e.code} from {url}: {body}") from e
    except urllib.error.URLError as e:
        raise RuntimeError(f"Could not reach server at {url}: {e.reason}") from e


def job_daily() -> None:
    """Daily job: renew Gmail push notification watches for all users."""
    print(f"[{now()}] Running daily job: gmail/watch/renew")
    result = _post("/api/v1/gmail/watch/renew")
    print(f"[{now()}] gmail/watch/renew: {json.dumps(result)}")


def job_weekly() -> None:
    """Weekly job: run guide updater for all active users."""
    print(f"[{now()}] Running weekly job: guides/update-all")
    result = _post("/api/v1/guides/update-all")
    print(f"[{now()}] guides/update-all: queued={result.get('queued', '?')} skipped={result.get('skipped', '?')}")


def now() -> str:
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")


JOBS = {
    "daily": job_daily,
    "weekly": job_weekly,
}


def main() -> None:
    parser = argparse.ArgumentParser(description="Run a scheduled cron job")
    parser.add_argument(
        "--job",
        required=True,
        choices=list(JOBS.keys()),
        help="Which job to run",
    )
    args = parser.parse_args()

    try:
        JOBS[args.job]()
        print(f"[{now()}] {args.job} job completed successfully")
    except Exception as e:
        print(f"[{now()}] ERROR: {args.job} job failed: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
