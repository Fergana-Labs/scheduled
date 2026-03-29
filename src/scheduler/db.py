"""Database client — dispatches to Postgres or SQLite backend based on config.

When DATABASE_URL is set, uses PostgreSQL (managed/Render deployment).
Otherwise, uses SQLite with optional GCS persistence (self-hosted deployment).
"""

from scheduler.config import config

if config.database_url:
    from scheduler.db_postgres import *  # noqa: F401,F403
else:
    from scheduler.db_sqlite import *  # noqa: F401,F403
