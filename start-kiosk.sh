#!/bin/bash
# AmpMatter Kiosk Mode Startup Script

# Wait for X to be ready
sleep 3

# Disable screen blanking and power management
export DISPLAY=:0
xset s off
xset s noblank
xset -dpms

# Start a simple HTTP server for the built client
cd /home/mario/AmpMatter/packages/client/dist
python3 -m http.server 8080 &
sleep 2

# Wait for server to be ready
until curl -s http://localhost:8080 > /dev/null; do
    sleep 1
done

# Launch Chromium on HDMI-1 (position 0,0)
chromium --kiosk \
    --disable-infobars \
    --disable-session-crashed-bubble \
    --disable-restore-session-state \
    --noerrdialogs \
    --disable-translate \
    --no-first-run \
    --fast \
    --fast-start \
    --disable-features=TranslateUI \
    --disk-cache-dir=/dev/null \
    --password-store=basic \
    --window-position=0,0 \
    --window-size=800,480 \
    http://localhost:8080 &

sleep 2

# Launch Chromium on HDMI-2 (position 800,0)
chromium --kiosk \
    --disable-infobars \
    --disable-session-crashed-bubble \
    --disable-restore-session-state \
    --noerrdialogs \
    --disable-translate \
    --no-first-run \
    --fast \
    --fast-start \
    --disable-features=TranslateUI \
    --disk-cache-dir=/dev/null \
    --password-store=basic \
    --window-position=800,0 \
    --window-size=800,480 \
    --user-data-dir=/home/mario/.config/chromium-hdmi2 \
    http://localhost:8080 &

echo "Kiosk mode started on both displays"
