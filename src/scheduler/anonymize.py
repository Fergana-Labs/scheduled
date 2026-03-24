"""PII anonymization via Claude Haiku for analytics storage."""

import json
import logging

import anthropic

logger = logging.getLogger(__name__)

_MODEL = "claude-haiku-4-5-20251001"

_SINGLE_TEXT_PROMPT = """\
Anonymize the following text by replacing all personally identifiable information (PII) with consistent placeholders:
- Names -> [Person A], [Person B], etc.
- Email addresses -> [person-a@email.com], [person-b@email.com], etc.
- Phone numbers -> [Phone 1], [Phone 2], etc.
- Physical addresses -> [Address 1], [Address 2], etc.
- Dates -> [Date 1], [Date 2], etc.
- Company/organization names -> [Company 1], [Company 2], etc.

Rules:
- The same entity must always get the same placeholder within this text.
- Preserve the text structure and meaning.
- Return ONLY the anonymized text with no explanations or extra commentary.

Text to anonymize:
{text}"""

_BATCH_PROMPT = """\
Anonymize the following data by replacing all personally identifiable information (PII) with consistent placeholders:
- Names -> [Person A], [Person B], etc.
- Email addresses -> [person-a@email.com], [person-b@email.com], etc.
- Phone numbers -> [Phone 1], [Phone 2], etc.
- Physical addresses -> [Address 1], [Address 2], etc.
- Dates -> [Date 1], [Date 2], etc.
- Company/organization names -> [Company 1], [Company 2], etc.

Rules:
- The same entity must always get the same placeholder across ALL sections below.
- Preserve the text structure and meaning.
- Return ONLY the result in the exact XML format shown below, with no extra commentary.

Input:
<thread_messages>
{thread_json}
</thread_messages>
<draft_subject>
{subject}
</draft_subject>
<draft_body>
{body}
</draft_body>

Return your result in this exact format:
<thread_messages>
[the anonymized thread messages as a JSON array]
</thread_messages>
<draft_subject>
[the anonymized subject]
</draft_subject>
<draft_body>
[the anonymized body]
</draft_body>"""


def anonymize_text(text: str) -> str:
    """Anonymize a single text string via Claude Haiku. Fails open (returns original on error)."""
    if not text or not text.strip():
        return text
    try:
        client = anthropic.Anthropic()
        response = client.messages.create(
            model=_MODEL,
            max_tokens=4096,
            messages=[{"role": "user", "content": _SINGLE_TEXT_PROMPT.format(text=text)}],
        )
        return response.content[0].text
    except Exception:
        logger.debug("anonymize_text: failed to anonymize, returning original", exc_info=True)
        return text


def _extract_tag(text: str, tag: str) -> str:
    """Extract content between XML tags."""
    start_tag = f"<{tag}>"
    end_tag = f"</{tag}>"
    start_idx = text.find(start_tag)
    end_idx = text.find(end_tag)
    if start_idx == -1 or end_idx == -1:
        return ""
    return text[start_idx + len(start_tag):end_idx].strip()


def anonymize_draft_context(
    thread_messages: list[dict],
    draft_body: str,
    draft_subject: str,
) -> tuple[list[dict], str, str]:
    """Batch-anonymize thread messages, draft body, and subject in one Haiku call.

    Returns (anonymized_thread, anonymized_body, anonymized_subject).
    Fails open: returns originals on error.
    """
    if not thread_messages and not draft_body and not draft_subject:
        return thread_messages, draft_body, draft_subject

    try:
        thread_json = json.dumps(thread_messages, default=str)
        prompt = _BATCH_PROMPT.format(
            thread_json=thread_json,
            subject=draft_subject,
            body=draft_body,
        )

        client = anthropic.Anthropic()
        response = client.messages.create(
            model=_MODEL,
            max_tokens=8192,
            messages=[{"role": "user", "content": prompt}],
        )
        result_text = response.content[0].text

        # Parse the XML-tagged sections
        anon_thread_str = _extract_tag(result_text, "thread_messages")
        anon_subject = _extract_tag(result_text, "draft_subject")
        anon_body = _extract_tag(result_text, "draft_body")

        # Parse thread JSON
        try:
            anon_thread = json.loads(anon_thread_str) if anon_thread_str else thread_messages
        except json.JSONDecodeError:
            anon_thread = thread_messages

        return (
            anon_thread,
            anon_body or draft_body,
            anon_subject or draft_subject,
        )
    except Exception:
        logger.debug("anonymize_draft_context: failed to anonymize, returning originals", exc_info=True)
        return thread_messages, draft_body, draft_subject
