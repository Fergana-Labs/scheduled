"""Draft composer agent — generates email reply drafts with proposed meeting times.

This is an AGENT (not a simple LLM completion). It uses the Claude Agent SDK
with tools to:
- Read the email thread for full context
- Check the stash calendar and primary calendar for availability
- Compose a natural-sounding draft reply with proposed times
- Create the draft in Gmail

An agent is used here (rather than a single completion) because the drafting
process benefits from the agent reading through evidence, checking multiple
date ranges, and iterating on the reply quality.
"""

import anthropic

from scheduler.availability.checker import AvailabilityChecker, TimeSlot
from scheduler.calendar.client import CalendarClient
from scheduler.classifier.intent import ClassificationResult
from scheduler.config import config
from scheduler.gmail.client import Email, GmailClient


# Tools the draft composer agent has access to
DRAFT_AGENT_TOOLS = [
    {
        "name": "check_availability",
        "description": "Check the user's availability for a given date range. Returns open time slots and conflicts.",
        "input_schema": {
            "type": "object",
            "properties": {
                "start_date": {"type": "string", "description": "Start date (ISO format)"},
                "end_date": {"type": "string", "description": "End date (ISO format)"},
                "duration_minutes": {"type": "integer", "description": "Meeting duration in minutes"},
            },
            "required": ["start_date", "end_date"],
        },
    },
    {
        "name": "read_thread",
        "description": "Read the full email thread for context on what's being scheduled.",
        "input_schema": {
            "type": "object",
            "properties": {
                "thread_id": {"type": "string", "description": "Gmail thread ID"},
            },
            "required": ["thread_id"],
        },
    },
    {
        "name": "create_draft",
        "description": "Create a draft reply in Gmail with the composed response.",
        "input_schema": {
            "type": "object",
            "properties": {
                "thread_id": {"type": "string", "description": "Thread to reply to"},
                "to": {"type": "string", "description": "Recipient email"},
                "subject": {"type": "string", "description": "Email subject"},
                "body": {"type": "string", "description": "Email body text"},
            },
            "required": ["thread_id", "to", "subject", "body"],
        },
    },
]


class DraftComposer:
    """Agent that composes and creates draft replies for scheduling emails.

    Uses an agentic loop so it can read threads, check availability across
    multiple date ranges, and iterate on the draft before creating it.
    """

    def __init__(
        self,
        gmail_client: GmailClient,
        availability_checker: AvailabilityChecker,
    ):
        self._gmail = gmail_client
        self._availability = availability_checker

    def compose_and_create_draft(self, email: Email, classification: ClassificationResult) -> str:
        """Run the draft composer agent.

        The agent will:
        1. Read the full email thread for context
        2. Check availability (potentially across multiple date ranges)
        3. Compose a reply that matches the tone of the conversation
        4. Create the draft in Gmail

        Args:
            email: The incoming scheduling email.
            classification: The classification result with extracted details.

        Returns:
            The ID of the created Gmail draft.
        """
        # TODO: Implement agentic loop
        # 1. Build the system prompt with user preferences and context
        # 2. Start the agent with the email + classification as the initial message
        # 3. Run the agentic loop:
        #    - Agent calls check_availability → we call AvailabilityChecker
        #    - Agent calls read_thread → we call GmailClient.get_thread()
        #    - Agent calls create_draft → we call GmailClient.create_draft()
        # 4. Return the draft ID from the create_draft tool call
        raise NotImplementedError

    def _handle_tool_call(self, tool_name: str, tool_input: dict):
        """Route agent tool calls to the appropriate service."""
        # TODO: Implement tool call routing
        # - "check_availability" → self._availability.find_available_slots(...)
        # - "read_thread" → self._gmail.get_thread(...)
        # - "create_draft" → self._gmail.create_draft(...)
        raise NotImplementedError
