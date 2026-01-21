#!/bin/bash
# WiFi Manager Script for AmpMatter
# Provides WiFi scanning and connection management via nmcli

set -e

COMMAND="${1:-help}"
shift || true

case "$COMMAND" in
  scan)
    # Scan for available WiFi networks
    # Output: JSON array of networks
    nmcli -t -f SSID,BSSID,SIGNAL,FREQ,SECURITY,ACTIVE dev wifi list | \
    awk -F: '
    BEGIN { print "[" }
    {
      if (NR > 1) print ","
      security = ($5 == "--") ? "open" : "wpa2"
      connected = ($6 == "yes") ? "true" : "false"
      printf "{\"ssid\":\"%s\",\"bssid\":\"%s\",\"signal\":%d,\"frequency\":%d,\"security\":\"%s\",\"connected\":%s}",
        $1, $2, $3, $4, security, connected
    }
    END { print "\n]" }
    '
    ;;

  connect)
    # Connect to a WiFi network
    # Args: SSID PASSWORD
    SSID="$1"
    PASSWORD="${2:-}"

    if [ -z "$SSID" ]; then
      echo "{\"success\":false,\"error\":\"SSID is required\"}"
      exit 1
    fi

    if [ -z "$PASSWORD" ]; then
      # Open network
      nmcli dev wifi connect "$SSID" 2>&1
    else
      # Secured network
      nmcli dev wifi connect "$SSID" password "$PASSWORD" 2>&1
    fi

    if [ $? -eq 0 ]; then
      echo "{\"success\":true,\"ssid\":\"$SSID\"}"
    else
      echo "{\"success\":false,\"error\":\"Failed to connect to $SSID\"}"
      exit 1
    fi
    ;;

  disconnect)
    # Disconnect from current network
    DEVICE=$(nmcli -t -f DEVICE,TYPE dev | grep wifi | cut -d: -f1 | head -1)
    if [ -z "$DEVICE" ]; then
      echo "{\"success\":false,\"error\":\"No WiFi device found\"}"
      exit 1
    fi

    nmcli dev disconnect "$DEVICE" 2>&1
    if [ $? -eq 0 ]; then
      echo "{\"success\":true}"
    else
      echo "{\"success\":false,\"error\":\"Failed to disconnect\"}"
      exit 1
    fi
    ;;

  current)
    # Get current WiFi connection info
    nmcli -t -f ACTIVE,SSID,BSSID,SIGNAL,FREQ,SECURITY dev wifi list | \
    grep "^yes:" | \
    awk -F: '
    {
      security = ($6 == "--") ? "open" : "wpa2"
      printf "{\"ssid\":\"%s\",\"bssid\":\"%s\",\"signal\":%d,\"frequency\":%d,\"security\":\"%s\",\"connected\":true}",
        $2, $3, $4, $5, security
    }
    '
    ;;

  saved)
    # List saved network connections
    nmcli -t -f NAME,TYPE con show | grep wifi | cut -d: -f1 | \
    awk '
    BEGIN { print "[" }
    {
      if (NR > 1) print ","
      printf "{\"ssid\":\"%s\",\"autoConnect\":true,\"priority\":0}", $0
    }
    END { print "\n]" }
    '
    ;;

  forget)
    # Forget a saved network
    # Args: SSID
    SSID="$1"
    if [ -z "$SSID" ]; then
      echo "{\"success\":false,\"error\":\"SSID is required\"}"
      exit 1
    fi

    nmcli con delete "$SSID" 2>&1
    if [ $? -eq 0 ]; then
      echo "{\"success\":true,\"ssid\":\"$SSID\"}"
    else
      echo "{\"success\":false,\"error\":\"Failed to forget $SSID\"}"
      exit 1
    fi
    ;;

  status)
    # Get WiFi adapter status
    DEVICE=$(nmcli -t -f DEVICE,TYPE dev | grep wifi | cut -d: -f1 | head -1)
    if [ -z "$DEVICE" ]; then
      echo "{\"enabled\":false,\"error\":\"No WiFi device found\"}"
      exit 0
    fi

    STATE=$(nmcli -t -f DEVICE,STATE dev | grep "$DEVICE" | cut -d: -f2)
    CONNECTED=$([ "$STATE" = "connected" ] && echo "true" || echo "false")

    echo "{\"enabled\":true,\"device\":\"$DEVICE\",\"state\":\"$STATE\",\"connected\":$CONNECTED}"
    ;;

  help|*)
    cat <<EOF
WiFi Manager Script for AmpMatter

Usage: wifi-manager.sh COMMAND [ARGS]

Commands:
  scan                    Scan for available WiFi networks (JSON output)
  connect SSID [PASSWORD] Connect to a WiFi network
  disconnect              Disconnect from current network
  current                 Get current connection info (JSON output)
  saved                   List saved network connections (JSON output)
  forget SSID             Forget a saved network
  status                  Get WiFi adapter status (JSON output)
  help                    Show this help message

Examples:
  wifi-manager.sh scan
  wifi-manager.sh connect "MyNetwork" "password123"
  wifi-manager.sh current
  wifi-manager.sh forget "OldNetwork"

Note: This script requires nmcli (NetworkManager) and appropriate permissions.
EOF
    ;;
esac
