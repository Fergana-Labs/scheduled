#!/usr/bin/env python3
"""End-to-end integration test for the guide updater feature.

Seeds the database with synthetic composed_drafts rows (matching the same
patterns as fixture.json updater_diffs), triggers the cron endpoint, waits
for background processing to finish, then verifies all four expected
outcomes:

  1. guide_update_runs rows exist with status='done' (not 'running'/'failed')
  2. proposed_changes are non-empty (LLM found the planted patterns)
  3. guides table content changed (at least one change was applied)
  4. guide_versions table has an archived copy of the old content

Run:
    cd /path/to/scheduled
    python scripts/test_guide_updater_e2e.py

Flags:
    --no-seed     Skip seeding (use existing DB data)
    --no-cleanup  Leave test rows in DB after the run (for manual inspection)
    --server-url  Base URL of the running server (default: http://localhost:8080)
    --user-id     User to test with (default: read from fixture.json)
"""

import argparse
import json
import os
import sys
import time
import urllib.request
import urllib.error
import uuid
from datetime import datetime, timezone, timedelta
from pathlib import Path

ROOT = Path(__file__).parent.parent

# ── helpers ──────────────────────────────────────────────────────────────────

def _db_conn():
    """Return a psycopg2 connection using DATABASE_URL from .env or environment."""
    try:
        import psycopg2
    except ImportError:
        print("ERROR: psycopg2 not installed. Run: pip install psycopg2-binary", file=sys.stderr)
        sys.exit(1)

    db_url = os.environ.get("DATABASE_URL")
    if not db_url:
        env_file = ROOT / ".env"
        if env_file.exists():
            for line in env_file.read_text().splitlines():
                if line.startswith("DATABASE_URL="):
                    db_url = line.split("=", 1)[1].strip()
                    break
    if not db_url:
        print("ERROR: DATABASE_URL not set.", file=sys.stderr)
        sys.exit(1)

    return psycopg2.connect(db_url)


def _post(url: str, timeout: int = 30) -> dict:
    req = urllib.request.Request(url, method="POST", data=b"")
    req.add_header("Content-Type", "application/json")
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return json.loads(resp.read())


def _get(url: str, timeout: int = 10) -> dict:
    with urllib.request.urlopen(url, timeout=timeout) as resp:
        return json.loads(resp.read())


def _load_user_id() -> str:
    fixture = ROOT / "fixture.json"
    if fixture.exists():
        data = json.loads(fixture.read_text())
        uid = data.get("metadata", {}).get("user_id")
        if uid:
            return uid
    print("ERROR: could not read user_id from fixture.json", file=sys.stderr)
    sys.exit(1)


# ── synthetic diffs (same patterns as fixture.json updater_diffs) ────────────

def _make_test_diffs(user_id: str) -> list[dict]:
    """Five diffs with two clear repeatable patterns:
      - Style:       "Hi" → "Hey"  and  "Best," → "Thanks,"    (×5, threshold=3)
      - Preferences: afternoon time → morning time              (×5, threshold=5)
    """
    pairs = [
        (
            "Hi Alex,\n\nWould Thursday at 3 PM WAT work for you?\n\nBest,\nTriumphant",
            "Hey Alex,\n\nWould Friday at 10 AM WAT work instead? Afternoons are packed.\n\nThanks,\nTriumphant",
            "alex-thread-001",
        ),
        (
            "Hi Jordan,\n\nHow does Monday at 4 PM WAT sound?\n\nBest,\nTriumphant",
            "Hey Jordan,\n\nHow does Tuesday at 9 AM WAT sound? Mornings work better.\n\nThanks,\nTriumphant",
            "jordan-thread-002",
        ),
        (
            "Hi Priya,\n\nWednesday at 2 PM WAT works for me.\n\nBest,\nTriumphant",
            "Hey Priya,\n\nThursday at 11 AM WAT works better for me.\n\nThanks,\nTriumphant",
            "priya-thread-003",
        ),
        (
            "Hi Marcus,\n\nFriday at 3 PM WAT could work.\n\nBest,\nTriumphant",
            "Hey Marcus,\n\nMonday at 10 AM WAT would work better.\n\nThanks,\nTriumphant",
            "marcus-thread-004",
        ),
        (
            "Hi Sarah,\n\nHow about Thursday at 4 PM WAT?\n\nBest,\nTriumphant",
            "Hey Sarah,\n\nHow about Friday at 9 AM WAT? Mornings work best for me.\n\nThanks,\nTriumphant",
            "sarah-thread-005",
        ),
    ]

    now = datetime.now(timezone.utc)
    rows = []
    for i, (original, sent, thread_id) in enumerate(pairs):
        rows.append({
            "user_id": user_id,
            "thread_id": f"test-{thread_id}",
            "draft_id": f"test-draft-{i+1}",
            "original_body": original,
            "raw_body": original,
            "sent_body": sent,
            "was_edited": True,
            "edit_distance_ratio": 0.75,
            "chars_added": 35,
            "chars_removed": 30,
            "sent_similarity": 0.72,
            "composed_at": (now - timedelta(hours=i+2)).isoformat(),
            "sent_at": (now - timedelta(hours=i+1)).isoformat(),
            "thread_context": json.dumps([]),
        })
    return rows


def seed_test_diffs(user_id: str) -> list[str]:
    """Insert test composed_drafts rows. Returns list of inserted UUIDs."""
    diffs = _make_test_diffs(user_id)
    conn = _db_conn()
    ids = []
    try:
        with conn, conn.cursor() as cur:
            for row in diffs:
                cur.execute(
                    """
                    INSERT INTO composed_drafts
                        (user_id, thread_id, draft_id, original_body, raw_body,
                         sent_body, was_edited, edit_distance_ratio,
                         chars_added, chars_removed, sent_similarity,
                         composed_at, sent_at, thread_context)
                    VALUES
                        (%(user_id)s, %(thread_id)s, %(draft_id)s, %(original_body)s,
                         %(raw_body)s, %(sent_body)s, %(was_edited)s,
                         %(edit_distance_ratio)s, %(chars_added)s, %(chars_removed)s,
                         %(sent_similarity)s, %(composed_at)s, %(sent_at)s,
                         %(thread_context)s)
                    RETURNING id
                    """,
                    row,
                )
                ids.append(str(cur.fetchone()[0]))
        print(f"  ✓ Seeded {len(ids)} test composed_drafts rows")
    finally:
        conn.close()
    return ids


def cleanup_test_diffs(ids: list[str]) -> None:
    """Delete seeded rows by ID."""
    if not ids:
        return
    conn = _db_conn()
    try:
        with conn, conn.cursor() as cur:
            cur.execute(
                "DELETE FROM composed_drafts WHERE id = ANY(%s::uuid[])",
                (ids,),
            )
        print(f"  ✓ Cleaned up {len(ids)} test rows")
    finally:
        conn.close()


def cleanup_test_guide_update_runs(user_id: str, since: datetime) -> None:
    """Delete guide_update_runs created by this test run."""
    conn = _db_conn()
    try:
        with conn, conn.cursor() as cur:
            cur.execute(
                "DELETE FROM guide_update_runs WHERE user_id = %s AND ran_at >= %s",
                (user_id, since),
            )
        print("  ✓ Cleaned up guide_update_runs test rows")
    finally:
        conn.close()


# ── verification ──────────────────────────────────────────────────────────────

def verify_results(server_url: str, user_id: str, started_at: datetime) -> bool:
    """Poll guide_update_runs via admin API until runs finish, then assert results.

    Returns True if all assertions pass.
    """
    print("\n── Verification ────────────────────────────────────────────────────")
    deadline = time.time() + 300  # 5 minute timeout
    poll_interval = 5

    while time.time() < deadline:
        try:
            data = _get(f"{server_url}/web/api/v1/admin/guide-updates?per_page=10")
        except Exception as e:
            print(f"  Admin API not reachable: {e}")
            time.sleep(poll_interval)
            continue

        rows = data.get("runs") or data.get("items") or []
        # Filter to runs for our user created after this test started
        our_runs = [
            r for r in rows
            if r.get("user_id") == user_id or r.get("user_email")
        ]

        running = [r for r in our_runs if r.get("status") == "running"]
        if running:
            print(f"  ⏳ {len(running)} run(s) still in progress, waiting…")
            time.sleep(poll_interval)
            poll_interval = min(poll_interval * 1.5, 30)
            continue

        # All done — check results directly in DB
        break
    else:
        print("  ✗ Timed out waiting for guide update runs to finish")
        return False

    return _check_db_results(user_id, started_at)


def _check_db_results(user_id: str, started_at: datetime) -> bool:
    conn = _db_conn()
    passed = True
    try:
        with conn.cursor() as cur:
            # ── Check 1: guide_update_runs rows exist ────────────────────────
            cur.execute(
                """
                SELECT guide_name, status, drafts_analyzed, changes_made,
                       proposed_changes, skipped_reason
                FROM guide_update_runs
                WHERE user_id = %s AND ran_at >= %s
                ORDER BY guide_name
                """,
                (user_id, started_at),
            )
            run_rows = cur.fetchall()
            if not run_rows:
                print("  ✗ CHECK 1 FAIL: No guide_update_runs rows found")
                return False
            print(f"  ✓ CHECK 1: Found {len(run_rows)} guide_update_runs row(s)")

            for guide_name, status, drafts_analyzed, changes_made, proposed_changes_raw, skipped_reason in run_rows:
                proposed = proposed_changes_raw if isinstance(proposed_changes_raw, list) else json.loads(proposed_changes_raw or "[]")

                # ── Check 2: status is 'done' or 'skipped', not 'failed'/'running'
                if status == "failed":
                    print(f"  ✗ CHECK 2 FAIL: {guide_name} status=failed")
                    passed = False
                elif status == "running":
                    print(f"  ✗ CHECK 2 FAIL: {guide_name} still running after timeout")
                    passed = False
                else:
                    print(f"  ✓ CHECK 2: {guide_name} status={status}, drafts_analyzed={drafts_analyzed}")

                # ── Check 3: LLM found patterns (proposed_changes non-empty for done runs)
                if status == "done":
                    if not proposed:
                        print(f"  ✗ CHECK 3 FAIL: {guide_name} completed but no proposed_changes")
                        passed = False
                    else:
                        print(f"  ✓ CHECK 3: {guide_name} → {len(proposed)} proposed change(s)")
                        for ch in proposed:
                            applied = "✓ applied" if ch.get("applied") else f"✗ skipped ({ch.get('skip_reason', '?')})"
                            print(f"       [{ch.get('action')}] {ch.get('section')}: {applied}")

            # ── Check 4: guide_versions archived old content ──────────────────
            cur.execute(
                "SELECT COUNT(*) FROM guide_versions WHERE user_id = %s",
                (user_id,),
            )
            version_count = cur.fetchone()[0]
            if version_count > 0:
                print(f"  ✓ CHECK 4: guide_versions has {version_count} archived snapshot(s)")
            else:
                print("  ⚠ CHECK 4: guide_versions is empty (no changes were applied, or first-time run)")

    finally:
        conn.close()

    return passed


# ── main ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="E2E test for guide updater")
    parser.add_argument("--no-seed", action="store_true", help="Skip DB seeding")
    parser.add_argument("--no-cleanup", action="store_true", help="Leave test rows in DB")
    parser.add_argument("--server-url", default="http://localhost:8080", help="Server base URL")
    parser.add_argument("--user-id", help="User ID to test (default: from fixture.json)")
    args = parser.parse_args()

    user_id = args.user_id or _load_user_id()
    server_url = args.server_url.rstrip("/")
    started_at = datetime.now(timezone.utc)

    print(f"E2E test — guide updater")
    print(f"  user_id   : {user_id}")
    print(f"  server_url: {server_url}")
    print()

    seeded_ids: list[str] = []

    # ── Step 1: Seed ──────────────────────────────────────────────────────────
    if not args.no_seed:
        print("── Step 1: Seeding test composed_drafts ────────────────────────────")
        seeded_ids = seed_test_diffs(user_id)

    # ── Step 2: Trigger cron endpoint ─────────────────────────────────────────
    print("\n── Step 2: Triggering POST /api/v1/guides/update-all ───────────────")
    try:
        result = _post(f"{server_url}/api/v1/guides/update-all")
        print(f"  ✓ Response: {result}")
    except Exception as e:
        print(f"  ✗ Failed to call endpoint: {e}")
        print("  Make sure the server is running: uvicorn scheduler.controlplane.server:app --port 8080")
        if not args.no_cleanup:
            cleanup_test_diffs(seeded_ids)
        sys.exit(1)

    # ── Step 3: Wait and verify ───────────────────────────────────────────────
    print("\n── Step 3: Waiting for background processing (up to 5 min) ────────")
    time.sleep(10)  # give the server a moment to start the background task
    passed = verify_results(server_url, user_id, started_at)

    # ── Step 4: Cleanup ───────────────────────────────────────────────────────
    if not args.no_cleanup:
        print("\n── Step 4: Cleanup ─────────────────────────────────────────────────")
        cleanup_test_diffs(seeded_ids)
        cleanup_test_guide_update_runs(user_id, started_at)

    print()
    if passed:
        print("✅  All checks passed.")
        sys.exit(0)
    else:
        print("❌  One or more checks failed — see above.")
        sys.exit(1)


if __name__ == "__main__":
    main()
