#!/bin/bash
#
# AmpMatter Kiosk Mode Startup Script
# Usage: ./scripts/start-kiosk.sh [--dev]
#
# Options:
#   --dev    Run in development mode (hot reload)
#   (none)   Run production build (faster, recommended)
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
PORT=5173
MODE="production"

# Ensure we have a display
export DISPLAY="${DISPLAY:-:0}"

# Parse arguments
if [[ "$1" == "--dev" ]]; then
    MODE="development"
fi

cd "$PROJECT_DIR"

# Function to cleanup on exit
cleanup() {
    echo "Shutting down AmpMatter..."
    # Kill background processes
    jobs -p | xargs -r kill 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

# Function to wait for server
wait_for_server() {
    echo "Waiting for server to start..."
    local max_attempts=30
    local attempt=0
    while ! curl -s "http://localhost:$PORT" > /dev/null 2>&1; do
        attempt=$((attempt + 1))
        if [[ $attempt -ge $max_attempts ]]; then
            echo "Error: Server failed to start after ${max_attempts} seconds"
            exit 1
        fi
        sleep 1
    done
    echo "Server is ready!"
}

# Start the appropriate server
if [[ "$MODE" == "development" ]]; then
    echo "Starting AmpMatter in DEVELOPMENT mode..."
    npm run dev &
else
    echo "Starting AmpMatter in PRODUCTION mode..."

    # Build if dist doesn't exist or is older than src
    if [[ ! -d "packages/client/dist" ]] || [[ -n "$(find packages/client/src -newer packages/client/dist -type f 2>/dev/null | head -1)" ]]; then
        echo "Building production bundle..."
        npm run build
    fi

    # Use Vite preview for production
    npm run preview --workspace=@ampmatter/client -- --port $PORT &
fi

# Wait for server to be ready
wait_for_server

# Hide cursor for kiosk mode
if command -v unclutter &> /dev/null; then
    unclutter -idle 0.5 -root &
fi

# Disable screen blanking
xset s off 2>/dev/null || true
xset -dpms 2>/dev/null || true
xset s noblank 2>/dev/null || true

echo "Launching Chromium in kiosk mode..."

# Launch Chromium in kiosk mode
chromium \
    --kiosk \
    --noerrdialogs \
    --disable-infobars \
    --disable-session-crashed-bubble \
    --disable-restore-session-state \
    --disable-features=TranslateUI \
    --disable-pinch \
    --overscroll-history-navigation=0 \
    --check-for-update-interval=31536000 \
    --disable-component-update \
    --autoplay-policy=no-user-gesture-required \
    "http://localhost:$PORT"

# If Chromium exits, cleanup
cleanup
