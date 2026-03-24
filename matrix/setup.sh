#!/usr/bin/env bash
#
# Bootstrap script for Matrix + mautrix bridges
#
# Usage:
#   1. Copy .env.example to .env and fill in your values
#   2. Run: bash setup.sh
#
set -euo pipefail

# ── Load config ───────────────────────────────────────────────
if [ ! -f .env ]; then
    echo "ERROR: .env file not found. Copy .env.example to .env and fill in your values."
    exit 1
fi
source .env

echo "=== Matrix Bridge Setup ==="
echo "Domain: $MATRIX_DOMAIN"
echo ""

# ── 1. Create directory structure ─────────────────────────────
echo "[1/9] Creating directory structure..."
mkdir -p synapse bridges/{whatsapp,meta,linkedin}

# ── 2. Generate Synapse config ────────────────────────────────
if [ ! -f synapse/homeserver.yaml ]; then
    echo "[2/9] Generating Synapse config..."
    docker run -it --rm \
        -v "$(pwd)/synapse:/data" \
        -e SYNAPSE_SERVER_NAME="$MATRIX_DOMAIN" \
        -e SYNAPSE_REPORT_STATS=no \
        matrixdotorg/synapse:latest generate
else
    echo "[2/9] Synapse config already exists, skipping generation."
fi

# ── 3. Patch homeserver.yaml ──────────────────────────────────
echo "[3/9] Patching homeserver.yaml..."

# Replace SQLite database config with PostgreSQL
python3 - <<'PYEOF'
import re, os

path = "synapse/homeserver.yaml"
with open(path) as f:
    content = f.read()

domain = os.environ["MATRIX_DOMAIN"]
pg_pass = os.environ["POSTGRES_PASSWORD"]
reg_secret = os.environ["REGISTRATION_SHARED_SECRET"]

# Replace database section
db_block = f"""database:
  name: psycopg2
  args:
    user: synapse
    password: {pg_pass}
    database: synapse
    host: postgres
    port: 5432
    cp_min: 5
    cp_max: 10"""

content = re.sub(
    r"database:\s*\n\s+name: sqlite3\s*\n.*?(?=\n\S)",
    db_block + "\n",
    content,
    flags=re.DOTALL,
)

# Ensure x_forwarded is true for reverse proxy
content = content.replace("x_forwarded: false", "x_forwarded: true")
if "x_forwarded: true" not in content:
    content = content.replace("type: http", "type: http\n    x_forwarded: true")

# Add registration shared secret if not present
if "registration_shared_secret" not in content:
    content += f'\nregistration_shared_secret: "{reg_secret}"\n'

# Disable open registration
content = content.replace("enable_registration: true", "enable_registration: false")

# Add appservice config files if not present
if "app_service_config_files" not in content:
    content += """
app_service_config_files:
  - /data/whatsapp-registration.yaml
  - /data/meta-registration.yaml
  - /data/linkedin-registration.yaml
"""

# Increase upload limit for bridge media
if "max_upload_size" not in content:
    content += "\nmax_upload_size: 50M\n"

with open(path, "w") as f:
    f.write(content)

print("  homeserver.yaml patched.")
PYEOF

# ── 4. Start PostgreSQL ───────────────────────────────────────
echo "[4/9] Starting PostgreSQL..."
docker compose up -d postgres
echo "  Waiting for PostgreSQL to be healthy..."
until docker compose exec postgres pg_isready -U synapse > /dev/null 2>&1; do
    sleep 2
done
echo "  PostgreSQL is ready."

# ── 5. Start Synapse (without bridges initially) ──────────────
echo "[5/9] Starting Synapse..."
docker compose up -d synapse
echo "  Waiting for Synapse to be healthy..."
until curl -sf http://localhost:8008/health > /dev/null 2>&1; do
    sleep 3
done
echo "  Synapse is healthy."

# ── 6. Generate bridge configs ────────────────────────────────
echo "[6/9] Generating bridge configs..."

for bridge in whatsapp meta linkedin; do
    if [ ! -f "bridges/$bridge/config.yaml" ]; then
        echo "  Generating $bridge config..."
        docker run --rm -v "$(pwd)/bridges/$bridge:/data:z" "dock.mau.dev/mautrix/$bridge:latest" || true
    else
        echo "  $bridge config already exists."
    fi
done

# ── 7. Patch bridge configs ──────────────────────────────────
echo "[7/9] Patching bridge configs..."

python3 - <<'PYEOF'
import yaml, os

domain = os.environ["MATRIX_DOMAIN"]
pg_pass = os.environ["POSTGRES_PASSWORD"]

bridges = {
    "whatsapp": {"port": 29318, "bot": "whatsappbot", "display": "WhatsApp bridge bot", "db": "mautrix_whatsapp"},
    "meta":     {"port": 29319, "bot": "instagrambot", "display": "Instagram bridge bot", "db": "mautrix_meta"},
    "linkedin": {"port": 29320, "bot": "linkedinbot", "display": "LinkedIn bridge bot", "db": "mautrix_linkedin"},
}

for name, info in bridges.items():
    path = f"bridges/{name}/config.yaml"
    if not os.path.exists(path):
        print(f"  WARNING: {path} not found, skipping.")
        continue

    with open(path) as f:
        config = yaml.safe_load(f)

    # Homeserver
    config.setdefault("homeserver", {})
    config["homeserver"]["address"] = "http://synapse:8008"
    config["homeserver"]["domain"] = domain

    # Appservice
    config.setdefault("appservice", {})
    config["appservice"]["address"] = f"http://mautrix-{name}:{info['port']}"
    config["appservice"]["hostname"] = "0.0.0.0"
    config["appservice"]["port"] = info["port"]
    config["appservice"]["id"] = name
    config["appservice"].setdefault("bot", {})
    config["appservice"]["bot"]["username"] = info["bot"]
    config["appservice"]["bot"]["displayname"] = info["display"]

    # Database
    config.setdefault("appservice", {})
    config["appservice"]["database"] = {
        "type": "postgres",
        "uri": f"postgres://synapse:{pg_pass}@postgres:5432/{info['db']}?sslmode=disable",
    }

    # If top-level database key exists (some bridges use this instead)
    if "database" in config:
        config["database"] = {
            "type": "postgres",
            "uri": f"postgres://synapse:{pg_pass}@postgres:5432/{info['db']}?sslmode=disable",
        }

    # Permissions
    config.setdefault("bridge", {})
    config["bridge"]["permissions"] = {
        domain: "user",
        f"@scheduler-bot:{domain}": "admin",
    }

    # Instagram-specific: set network mode
    if name == "meta":
        config.setdefault("network", {})
        config["network"]["mode"] = "instagram"

    # Logging
    config["logging"] = {
        "min_level": "debug",
        "writers": [{"type": "stdout", "format": "pretty-colored"}],
    }

    with open(path, "w") as f:
        yaml.dump(config, f, default_flow_style=False, sort_keys=False)
    print(f"  Patched {name} config.")
PYEOF

# ── 8. Start bridges & copy registration files ───────────────
echo "[8/9] Starting bridges to generate registration files..."
docker compose up -d mautrix-whatsapp mautrix-meta mautrix-linkedin

echo "  Waiting 15s for bridges to generate registration files..."
sleep 15

# Copy registration files to Synapse data dir
for bridge_reg in \
    "bridges/whatsapp/registration.yaml:synapse/whatsapp-registration.yaml" \
    "bridges/meta/registration.yaml:synapse/meta-registration.yaml" \
    "bridges/linkedin/registration.yaml:synapse/linkedin-registration.yaml"; do
    src="${bridge_reg%%:*}"
    dst="${bridge_reg##*:}"
    if [ -f "$src" ]; then
        cp "$src" "$dst"
        echo "  Copied $src → $dst"
    else
        echo "  WARNING: $src not found. Bridge may need more time or had an error."
        echo "  Check: docker compose logs mautrix-$(basename $(dirname $src))"
    fi
done

# Restart Synapse to load registration files, then restart bridges
echo "  Restarting Synapse to load appservice registrations..."
docker compose restart synapse
sleep 5
docker compose restart mautrix-whatsapp mautrix-meta mautrix-linkedin

# ── 9. Start Caddy & create bot user ─────────────────────────
echo "[9/9] Starting Caddy and creating bot user..."
docker compose up -d caddy

# Wait for Synapse to be healthy again after restart
until curl -sf http://localhost:8008/health > /dev/null 2>&1; do
    sleep 3
done

# Create the scheduler-bot admin user
echo "  Creating scheduler-bot user..."
docker exec synapse register_new_matrix_user \
    http://localhost:8008 \
    -c /data/homeserver.yaml \
    -u scheduler-bot \
    -p "$BOT_PASSWORD" \
    -a 2>/dev/null || echo "  (User may already exist, continuing.)"

# Get access token
echo ""
echo "  Getting access token..."
TOKEN=$(curl -sf -X POST "http://localhost:8008/_matrix/client/v3/login" \
    -H "Content-Type: application/json" \
    -d "{
        \"type\": \"m.login.password\",
        \"identifier\": {\"type\": \"m.id.user\", \"user\": \"scheduler-bot\"},
        \"password\": \"$BOT_PASSWORD\"
    }" | python3 -c "import sys,json; print(json.load(sys.stdin)['access_token'])")

echo ""
echo "============================================"
echo "  Setup complete!"
echo "============================================"
echo ""
echo "Matrix homeserver: https://$MATRIX_DOMAIN"
echo "Bot user:          @scheduler-bot:$MATRIX_DOMAIN"
echo "Access token:      $TOKEN"
echo ""
echo "Add these to your Scheduled .env:"
echo "  MATRIX_HOMESERVER_URL=https://$MATRIX_DOMAIN"
echo "  MATRIX_ACCESS_TOKEN=$TOKEN"
echo "  MATRIX_USER_ID=@scheduler-bot:$MATRIX_DOMAIN"
echo "  MATRIX_SYNC_ENABLED=true"
echo ""
echo "Next steps:"
echo "  1. Link WhatsApp: message @whatsappbot:$MATRIX_DOMAIN with 'login qr'"
echo "  2. Link Instagram: message @instagrambot:$MATRIX_DOMAIN with 'login'"
echo "  3. Link LinkedIn:  message @linkedinbot:$MATRIX_DOMAIN with 'login'"
echo ""
echo "To message bridge bots, use Element (app.element.io) or curl:"
echo "  See docs/matrix-bridges-setup.md for details."
echo ""
