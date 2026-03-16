"""Onboarding agent — backfills the stash calendar from Gmail history.

This is an AGENT (not a simple LLM completion). It uses the Claude Agent SDK
with tools to agentically search through Gmail, read email threads, check
for existing calendar events, and add missing commitments to the stash calendar.

An agent is used here (rather than a single completion) because onboarding
requires iterative exploration — the agent needs to search Gmail with different
queries, read through threads to understand context, decide which emails
represent real commitments, and cross-reference with the calendar. This is
too complex and variable for a single LLM call.

Designed to run in the cloud via e2b.
"""

from datetime import datetime, timedelta

from scheduler.auth.google_auth import get_credentials
from scheduler.calendar.client import CalendarClient
from scheduler.config import config
from scheduler.gmail.client import GmailClient


# Tools the onboarding agent has access to
ONBOARDING_AGENT_TOOLS = [
    {
        "name": "search_emails",
        "description": "Search Gmail using a query string. Use this to find scheduling-related emails.",
        "input_schema": {
            "type": "object",
            "properties": {
                "query": {"type": "string", "description": "Gmail search query (e.g. 'let\\'s meet', 'schedule a call')"},
                "max_results": {"type": "integer", "description": "Max results to return"},
            },
            "required": ["query"],
        },
    },
    {
        "name": "read_thread",
        "description": "Read a full email thread to understand the context of a scheduling conversation.",
        "input_schema": {
            "type": "object",
            "properties": {
                "thread_id": {"type": "string", "description": "Gmail thread ID"},
            },
            "required": ["thread_id"],
        },
    },
    {
        "name": "check_calendar",
        "description": "Check if a calendar event already exists in the given time range.",
        "input_schema": {
            "type": "object",
            "properties": {
                "summary": {"type": "string", "description": "Event name to search for"},
                "start_date": {"type": "string", "description": "Start of range (ISO format)"},
                "end_date": {"type": "string", "description": "End of range (ISO format)"},
            },
            "required": ["summary", "start_date", "end_date"],
        },
    },
    {
        "name": "add_to_stash_calendar",
        "description": "Add a commitment to the stash calendar.",
        "input_schema": {
            "type": "object",
            "properties": {
                "summary": {"type": "string", "description": "Event title"},
                "start": {"type": "string", "description": "Start time (ISO format)"},
                "end": {"type": "string", "description": "End time (ISO format)"},
                "description": {"type": "string", "description": "Event description / context"},
            },
            "required": ["summary", "start", "end"],
        },
    },
]


def run_onboarding():
    """Run the onboarding agent to backfill the stash calendar.

    Launches a Claude agent with Gmail and Calendar tools. The agent will:
    1. Search Gmail with various queries to find scheduling-related emails
    2. Read threads to understand the full context of each conversation
    3. Determine which emails represent real commitments the user agreed to
    4. Cross-reference with existing calendar events to avoid duplicates
    5. Add missing commitments to the stash calendar
    """
    # TODO: Implement agentic loop
    # 1. Authenticate with Google
    # 2. Get or create the stash calendar
    # 3. Build the system prompt telling the agent to search the last N days
    # 4. Run the agentic loop:
    #    - Agent calls search_emails → we call GmailClient.search()
    #    - Agent calls read_thread → we call GmailClient.get_thread()
    #    - Agent calls check_calendar → we call CalendarClient.find_event()
    #    - Agent calls add_to_stash_calendar → we call CalendarClient.add_event()
    # 5. Agent decides when it's done (has exhausted its search queries)
    raise NotImplementedError


def _handle_tool_call(tool_name: str, tool_input: dict, gmail: GmailClient, calendar: CalendarClient):
    """Route agent tool calls to the appropriate service."""
    # TODO: Implement tool call routing
    raise NotImplementedError


if __name__ == "__main__":
    run_onboarding()
