"""Eval backends — record once, replay forever.

One recording file captures every Gmail search, thread read, calendar lookup,
guide load, and timezone fetch. Both guide and draft eval commands replay
from the same file.

Recording format:
{
  "metadata": {"recorded_at": "...", ...},
  "calls": [
    {"method": "search_emails", "args": {...}, "result": {...}},
    {"method": "read_thread", "args": {"thread_id": "..."}, "result": [...]},
    ...
  ]
}

The raw result is always stored in a normalized form (lists of dicts).
Each replay backend wraps it in whatever shape its protocol expects.
"""

from __future__ import annotations

import json
from datetime import datetime


# ---------------------------------------------------------------------------
# Recording store — shared across all backends in one eval run
# ---------------------------------------------------------------------------

class RecordingStore:
    """Accumulates recorded API calls from any backend."""

    def __init__(self):
        self.calls: list[dict] = []

    def record(self, method: str, args: dict, result) -> None:
        self.calls.append({"method": method, "args": args, "result": result})

    def save(self, path: str, metadata: dict | None = None) -> None:
        data = {
            "metadata": {
                "recorded_at": datetime.now().isoformat(),
                **(metadata or {}),
            },
            "calls": self.calls,
        }
        with open(path, "w") as f:
            json.dump(data, f, indent=2)


def load_recording(path: str) -> tuple[list[dict], dict]:
    """Load a recording file. Returns (calls, metadata)."""
    with open(path) as f:
        data = json.load(f)
    calls = data.get("calls", [])
    metadata = data.get("metadata", {})
    return calls, metadata


class ReplayLookup:
    """Lookup table for replaying recorded calls."""

    def __init__(self, calls: list[dict]):
        self._lookup: dict[str, any] = {}
        for entry in calls:
            key = self._key(entry["method"], entry["args"])
            self._lookup[key] = entry["result"]

    def _key(self, method: str, args: dict) -> str:
        return json.dumps({"method": method, "args": args}, sort_keys=True)

    def get(self, method: str, args: dict):
        key = self._key(method, args)
        if key in self._lookup:
            return self._lookup[key]

        fallbacks = {
            "search_emails": {"emails": []},
            "read_thread": [],
            "get_calendar_events": [],
            "get_user_timezone": "UTC",
            "load_guide": None,
        }
        return fallbacks.get(method, {})


# ---------------------------------------------------------------------------
# Live API helpers (shared by recording backends)
# ---------------------------------------------------------------------------

def _get_live_clients():
    from scheduler.auth.google_auth import get_credentials
    from scheduler.calendar.client import CalendarClient
    from scheduler.config import config
    from scheduler.gmail.client import GmailClient

    creds = get_credentials()
    gmail = GmailClient(creds)
    calendar = CalendarClient(creds, config.stash_calendar_name)
    return gmail, calendar


def _serialize_email(email) -> dict:
    return {
        "id": email.id,
        "thread_id": email.thread_id,
        "sender": email.sender,
        "recipient": email.recipient,
        "cc": email.cc,
        "subject": email.subject,
        "body": email.body,
        "date": email.date.isoformat(),
        "snippet": email.snippet,
    }


def _serialize_event(event) -> dict:
    return {
        "id": event.id,
        "summary": event.summary,
        "start": event.start.isoformat(),
        "end": event.end.isoformat(),
        "description": event.description,
        "source": event.source,
    }


# ---------------------------------------------------------------------------
# Guide backends (GuideBackend protocol)
#
# read_thread returns {"messages": [...]}
# get_calendar_events returns {"events": [...]}
# ---------------------------------------------------------------------------

class RecordingGuideBackend:
    """Hits real Gmail/Calendar, records everything, captures guide writes."""

    def __init__(self, store: RecordingStore):
        self._store = store
        self._gmail, self._calendar = _get_live_clients()
        self.captured_guides: dict[str, str] = {}

    def search_emails(self, query: str, max_results: int = 50) -> dict:
        emails = self._gmail.search(query=query, max_results=max_results)
        result = {"emails": [_serialize_email(e) for e in emails]}
        self._store.record("search_emails", {"query": query, "max_results": max_results}, result)
        return result

    def read_thread(self, thread_id: str) -> dict:
        messages = self._gmail.get_thread(thread_id)
        raw = [_serialize_email(m) for m in messages]
        self._store.record("read_thread", {"thread_id": thread_id}, raw)
        return {"messages": raw}

    def get_calendar_events(self, start_date: str, end_date: str) -> dict:
        events = self._calendar.get_all_events(
            time_min=datetime.fromisoformat(start_date),
            time_max=datetime.fromisoformat(end_date),
        )
        raw = [_serialize_event(e) for e in events]
        self._store.record("get_calendar_events", {"start_date": start_date, "end_date": end_date}, raw)
        return {"events": raw}

    def write_guide(self, name: str, content: str) -> dict:
        self.captured_guides[name] = content
        return {"status": "captured", "name": name}


class ReplayGuideBackend:
    """Replays from a recording. No Gmail/Calendar access."""

    def __init__(self, lookup: ReplayLookup):
        self._lookup = lookup
        self.captured_guides: dict[str, str] = {}

    def search_emails(self, query: str, max_results: int = 50) -> dict:
        return self._lookup.get("search_emails", {"query": query, "max_results": max_results})

    def read_thread(self, thread_id: str) -> dict:
        raw = self._lookup.get("read_thread", {"thread_id": thread_id})
        return {"messages": raw}

    def get_calendar_events(self, start_date: str, end_date: str) -> dict:
        raw = self._lookup.get("get_calendar_events", {"start_date": start_date, "end_date": end_date})
        return {"events": raw}

    def write_guide(self, name: str, content: str) -> dict:
        self.captured_guides[name] = content
        return {"status": "captured", "name": name}


# ---------------------------------------------------------------------------
# Draft backends (DraftBackend protocol)
#
# read_thread returns list[dict] (bare list)
# get_calendar_events returns list[dict] (bare list)
# also has load_guide, get_user_timezone, create_draft, send_email, add_calendar_event
# ---------------------------------------------------------------------------

class RecordingDraftBackend:
    """Hits real Gmail/Calendar, records everything, captures writes."""

    def __init__(self, store: RecordingStore, user_id: str | None = None):
        self._store = store
        self._gmail, self._calendar = _get_live_clients()
        self._user_id = user_id

        self.captured_draft: dict | None = None
        self.captured_sent: dict | None = None
        self.captured_events: list[dict] = []

    def load_guide(self, name: str) -> str | None:
        from scheduler.guides import load_guide
        result = load_guide(name, user_id=self._user_id)
        self._store.record("load_guide", {"name": name}, result)
        return result

    def get_user_timezone(self) -> str:
        result = self._calendar.get_user_timezone()
        self._store.record("get_user_timezone", {}, result)
        return result

    def get_calendar_events(self, start_date: str, end_date: str) -> list[dict]:
        events = self._calendar.get_all_events(
            time_min=datetime.fromisoformat(start_date),
            time_max=datetime.fromisoformat(end_date),
            include_primary=True,
        )
        raw = [_serialize_event(e) for e in events]
        self._store.record("get_calendar_events", {"start_date": start_date, "end_date": end_date}, raw)
        return raw

    def read_thread(self, thread_id: str) -> list[dict]:
        messages = self._gmail.get_thread(thread_id)
        raw = [_serialize_email(m) for m in messages]
        self._store.record("read_thread", {"thread_id": thread_id}, raw)
        return raw

    def create_draft(self, args: dict) -> dict:
        self.captured_draft = args
        return {"draft_id": "dry-run-draft"}

    def send_email(self, args: dict) -> dict:
        self.captured_sent = args
        return {"message_id": "dry-run-sent", "status": "captured"}

    def add_calendar_event(self, args: dict) -> dict:
        self.captured_events.append(args)
        return {"event_id": "dry-run-event"}


class ReplayDraftBackend:
    """Replays from a recording. No Gmail/Calendar access."""

    def __init__(self, lookup: ReplayLookup):
        self._lookup = lookup
        self.captured_draft: dict | None = None
        self.captured_sent: dict | None = None
        self.captured_events: list[dict] = []

    def load_guide(self, name: str) -> str | None:
        return self._lookup.get("load_guide", {"name": name})

    def get_user_timezone(self) -> str:
        return self._lookup.get("get_user_timezone", {})

    def get_calendar_events(self, start_date: str, end_date: str) -> list[dict]:
        return self._lookup.get("get_calendar_events", {"start_date": start_date, "end_date": end_date})

    def read_thread(self, thread_id: str) -> list[dict]:
        return self._lookup.get("read_thread", {"thread_id": thread_id})

    def create_draft(self, args: dict) -> dict:
        self.captured_draft = args
        return {"draft_id": "dry-run-draft"}

    def send_email(self, args: dict) -> dict:
        self.captured_sent = args
        return {"message_id": "dry-run-sent", "status": "captured"}

    def add_calendar_event(self, args: dict) -> dict:
        self.captured_events.append(args)
        return {"event_id": "dry-run-event"}
