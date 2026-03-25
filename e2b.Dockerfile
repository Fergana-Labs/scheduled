FROM ubuntu:24.04

ENV DEBIAN_FRONTEND=noninteractive
ENV PYTHONUNBUFFERED=1

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       python3 python3-pip python3-venv ca-certificates \
       # Chromium deps for Playwright
       libnss3 libatk1.0-0t64 libatk-bridge2.0-0t64 libcups2t64 libdrm2 \
       libxkbcommon0 libxcomposite1 libxdamage1 libxrandr2 libgbm1 \
       libpango-1.0-0 libasound2t64 libxshmfence1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /home/user/scheduler

COPY e2b.pyproject.toml /home/user/scheduler/pyproject.toml
COPY src/scheduler/__init__.py /home/user/scheduler/src/scheduler/__init__.py
COPY src/scheduler/config.py /home/user/scheduler/src/scheduler/config.py
COPY src/scheduler/claude_runtime.py /home/user/scheduler/src/scheduler/claude_runtime.py
COPY src/scheduler/sandbox /home/user/scheduler/src/scheduler/sandbox
COPY src/scheduler/onboarding /home/user/scheduler/src/scheduler/onboarding
COPY src/scheduler/guides /home/user/scheduler/src/scheduler/guides
COPY src/scheduler/drafts /home/user/scheduler/src/scheduler/drafts
COPY src/scheduler/booking /home/user/scheduler/src/scheduler/booking

RUN python3 -m pip install --break-system-packages -e . \
    && python3 -m playwright install chromium
