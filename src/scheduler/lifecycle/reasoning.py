"""Send a mid-thread reasoning email via Postmark explaining why a draft was created."""

import logging
from datetime import datetime, timedelta

import httpx
from dateutil import parser as dateutil_parser

from scheduler.calendar.client import CalendarClient
from scheduler.classifier.intent import ClassificationResult
from scheduler.config import config
from scheduler.gmail.client import GmailClient
from scheduler.lifecycle.welcome import POSTMARK_SEND_URL

logger = logging.getLogger(__name__)


def _parse_dates(proposed_times: list[str]) -> list[datetime]:
    """Extract unique dates from proposed_times strings, falling back to today."""
    dates: list[datetime] = []
    for text in proposed_times:
        try:
            dt = dateutil_parser.parse(text, fuzzy=True)
            dates.append(dt)
        except (ValueError, OverflowError):
            continue
    if not dates:
        dates.append(datetime.now())
    return dates


def _format_time(dt: datetime) -> str:
    """Format a datetime as '9:00 AM'."""
    return dt.strftime("%-I:%M %p")


def send_reasoning_email(
    user_email: str,
    thread_id: str,
    subject: str,
    classification: ClassificationResult,
    gmail: GmailClient,
    calendar: CalendarClient,
) -> None:
    """Send a reasoning email into the thread explaining why a draft was created."""
    if not config.postmark_server_token:
        logger.info("reasoning: no POSTMARK_SERVER_TOKEN, skipping")
        return

    # Get Message-Id header of the last message in the thread
    thread = gmail.get_thread(thread_id)
    if not thread:
        logger.warning("reasoning: empty thread %s, skipping", thread_id)
        return
    message_id_header = thread[-1].headers.get("message-id", "")
    if not message_id_header:
        logger.warning("reasoning: no Message-Id header on last message in thread %s", thread_id)
        return

    # Determine relevant dates from proposed_times
    dates = _parse_dates(classification.proposed_times)
    day_start = min(dates).replace(hour=0, minute=0, second=0, microsecond=0)
    day_end = max(dates).replace(hour=23, minute=59, second=59, microsecond=0) + timedelta(seconds=1)

    # Fetch calendar events for those days
    events = calendar.get_all_events(day_start, day_end, include_primary=True)

    # Build the email body
    date_label = day_start.strftime("%B %-d, %Y")
    if day_start.date() != (day_end - timedelta(seconds=1)).date():
        date_label = f"{day_start.strftime('%B %-d')} – {(day_end - timedelta(seconds=1)).strftime('%B %-d, %Y')}"

    if events:
        events_lines = "\n".join(
            f"  - {_format_time(ev.start)} – {_format_time(ev.end)}: {ev.summary}"
            for ev in sorted(events, key=lambda e: e.start)
        )
    else:
        events_lines = "  No other meetings"

    body = (
        f"Scheduled drafted a reply in this thread.\n"
        f"\n"
        f"Why: {classification.summary}\n"
        f"\n"
        f"Your meetings on {date_label}:\n"
        f"{events_lines}\n"
        f"\n"
        f"— Scheduled"
    )

    # Send via Postmark with threading headers
    reply_subject = f"Re: {subject}" if not subject.startswith("Re:") else subject

    resp = httpx.post(
        POSTMARK_SEND_URL,
        headers={
            "Accept": "application/json",
            "Content-Type": "application/json",
            "X-Postmark-Server-Token": config.postmark_server_token,
        },
        json={
            "From": config.postmark_bot_email,
            "To": user_email,
            "Subject": reply_subject,
            "TextBody": body,
            "Headers": [
                {"Name": "In-Reply-To", "Value": message_id_header},
                {"Name": "References", "Value": message_id_header},
            ],
        },
        timeout=15,
    )
    resp.raise_for_status()
    logger.info("reasoning: sent reasoning email to %s in thread %s", user_email, thread_id)
