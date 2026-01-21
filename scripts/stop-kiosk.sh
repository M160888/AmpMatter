#!/bin/bash
#
# Stop AmpMatter Kiosk Mode
#

echo "Stopping AmpMatter kiosk..."

# Kill Chromium kiosk
pkill -f "chromium.*kiosk.*localhost:5173" 2>/dev/null

# Kill Vite server
pkill -f "vite" 2>/dev/null

# Kill node processes related to ampmatter
pkill -f "node.*ampmatter" 2>/dev/null

# Restore cursor
pkill -f "unclutter" 2>/dev/null

echo "AmpMatter stopped."
