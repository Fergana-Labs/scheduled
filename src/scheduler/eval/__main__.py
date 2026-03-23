"""Eval CLI — record your inbox once, then replay for deterministic evals.

Usage:
    # Step 1: Record everything into one fixture (hits real Gmail/Calendar)
    python -m scheduler.eval record --out fixture.json --thread-ids t1 t2 t3

    # Step 2: Run evals against the frozen fixture (no API access)
    python -m scheduler.eval guides --fixture fixture.json
    python -m scheduler.eval draft --fixture fixture.json --thread-id t1
    python -m scheduler.eval classify --fixture fixture.json --thread-id t1
"""

from __future__ import annotations

import argparse
import json
import sys


def cmd_record(args):
    """Record a fixture: run guide agents + read specific threads, save everything."""
    import anyio
    from scheduler.eval.backends import (
        RecordingDraftBackend,
        RecordingGuideBackend,
        RecordingStore,
    )
    from scheduler.guides.preferences import run_preferences_agent
    from scheduler.guides.style import run_style_agent

    store = RecordingStore()

    # 1. Run guide agents (they search Gmail + read threads + read calendar)
    print("Recording guide agents (searching inbox, reading threads)...", file=sys.stderr)
    guide_backend = RecordingGuideBackend(store)

    async def _run_guides():
        async with anyio.create_task_group() as tg:
            tg.start_soon(run_preferences_agent, guide_backend)
            tg.start_soon(run_style_agent, guide_backend)

    anyio.run(_run_guides)

    # 2. Read specific threads for draft eval (+ their calendar context)
    if args.thread_ids:
        print(f"Recording {len(args.thread_ids)} thread(s) for draft eval...", file=sys.stderr)
        draft_backend = RecordingDraftBackend(store)
        for tid in args.thread_ids:
            draft_backend.read_thread(tid)
            draft_backend.load_guide("scheduling_preferences")
            draft_backend.load_guide("email_style")
        draft_backend.get_user_timezone()
        # Record a wide calendar window for draft agent availability checks
        from datetime import datetime, timedelta
        now = datetime.now()
        draft_backend.get_calendar_events(
            now.isoformat(),
            (now + timedelta(days=30)).isoformat(),
        )

    # 3. Save
    metadata = {
        "thread_ids": args.thread_ids or [],
        "guide_names": list(guide_backend.captured_guides.keys()),
    }
    store.save(args.out, metadata=metadata)
    n_calls = len(store.calls)
    print(f"Saved {n_calls} recorded calls to {args.out}", file=sys.stderr)


def cmd_classify(args):
    """Run the classifier on a thread from the fixture."""
    from scheduler.classifier.intent import classify_email
    from scheduler.eval.backends import ReplayLookup, load_recording

    calls, metadata = load_recording(args.fixture)
    lookup = ReplayLookup(calls)

    thread_ids = args.thread_ids or metadata.get("thread_ids", [])
    if not thread_ids:
        print("No thread IDs specified and none found in fixture metadata", file=sys.stderr)
        sys.exit(1)

    results = []
    for tid in thread_ids:
        messages = lookup.get("read_thread", {"thread_id": tid})
        if not messages:
            print(f"Thread {tid} not found in fixture, skipping", file=sys.stderr)
            continue

        latest = messages[-1]
        c = classify_email(latest["subject"], latest["body"], latest["sender"])
        results.append({
            "thread_id": tid,
            "intent": c.intent.value,
            "confidence": c.confidence,
            "summary": c.summary,
            "proposed_times": c.proposed_times,
            "participants": c.participants,
            "duration_minutes": c.duration_minutes,
            "is_sales_email": c.is_sales_email,
        })

    print(json.dumps(results, indent=2))


def cmd_draft(args):
    """Run the draft composer against a thread from the fixture."""
    from scheduler.classifier.intent import classify_email
    from scheduler.drafts.composer import DraftComposer
    from scheduler.eval.backends import ReplayDraftBackend, ReplayLookup, load_recording

    calls, metadata = load_recording(args.fixture)
    lookup = ReplayLookup(calls)

    thread_ids = args.thread_ids or metadata.get("thread_ids", [])
    if not thread_ids:
        print("No thread IDs specified and none found in fixture metadata", file=sys.stderr)
        sys.exit(1)

    results = []
    for tid in thread_ids:
        messages = lookup.get("read_thread", {"thread_id": tid})
        if not messages:
            print(f"Thread {tid} not found in fixture, skipping", file=sys.stderr)
            continue

        latest = messages[-1]

        # Classify (this is a live LLM call — the thing we're evaluating)
        c = classify_email(latest["subject"], latest["body"], latest["sender"])
        classification = {
            "intent": c.intent.value,
            "confidence": c.confidence,
            "summary": c.summary,
            "proposed_times": c.proposed_times,
            "participants": c.participants,
            "duration_minutes": c.duration_minutes,
        }

        backend = ReplayDraftBackend(lookup)
        composer = DraftComposer(backend, user_id="eval", user_email="eval@test.com")
        composer.compose_and_create_draft(latest, classification)

        results.append({
            "thread_id": tid,
            "classification": classification,
            "draft": backend.captured_draft,
            "sent": backend.captured_sent,
            "calendar_events": backend.captured_events,
        })

    print(json.dumps(results, indent=2))


def cmd_guides(args):
    """Run guide-writer agents against the fixture."""
    import anyio
    from scheduler.eval.backends import ReplayGuideBackend, ReplayLookup, load_recording
    from scheduler.guides.preferences import run_preferences_agent
    from scheduler.guides.style import run_style_agent

    calls, _metadata = load_recording(args.fixture)
    lookup = ReplayLookup(calls)
    backend = ReplayGuideBackend(lookup)

    async def _run():
        async with anyio.create_task_group() as tg:
            tg.start_soon(run_preferences_agent, backend)
            tg.start_soon(run_style_agent, backend)

    anyio.run(_run)

    print(json.dumps(backend.captured_guides, indent=2))


def main():
    parser = argparse.ArgumentParser(description="Eval CLI for scheduler agents")
    sub = parser.add_subparsers(dest="command", required=True)

    rec = sub.add_parser("record", help="Record inbox/calendar/threads to a fixture (run once)")
    rec.add_argument("--out", required=True, help="Output fixture file path")
    rec.add_argument("--thread-ids", nargs="*", help="Gmail thread IDs to include for draft eval")
    rec.set_defaults(func=cmd_record)

    cls = sub.add_parser("classify", help="Run classifier on thread(s) from a fixture")
    cls.add_argument("--fixture", required=True, help="Recording fixture file")
    cls.add_argument("--thread-ids", nargs="*", help="Thread IDs to classify (default: all from fixture)")
    cls.set_defaults(func=cmd_classify)

    dft = sub.add_parser("draft", help="Run draft composer on thread(s) from a fixture")
    dft.add_argument("--fixture", required=True, help="Recording fixture file")
    dft.add_argument("--thread-ids", nargs="*", help="Thread IDs to draft (default: all from fixture)")
    dft.set_defaults(func=cmd_draft)

    gd = sub.add_parser("guides", help="Run guide-writer agents against a fixture")
    gd.add_argument("--fixture", required=True, help="Recording fixture file")
    gd.set_defaults(func=cmd_guides)

    parsed = parser.parse_args()
    parsed.func(parsed)


if __name__ == "__main__":
    main()
