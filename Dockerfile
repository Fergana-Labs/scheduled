FROM python:3.12-slim

WORKDIR /app

# Copy everything needed for install
COPY pyproject.toml .
COPY src/ src/

# Install the package (includes dependencies)
RUN pip install --no-cache-dir .

ENV PYTHONPATH=/app/src

EXPOSE 8080

CMD ["uvicorn", "scheduler.controlplane.server:app", "--host", "0.0.0.0", "--port", "8080"]
