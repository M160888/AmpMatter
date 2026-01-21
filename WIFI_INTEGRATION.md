# WiFi Integration Guide

This document explains how to set up and use the real WiFi integration in AmpMatter.

## Overview

AmpMatter can manage WiFi connections on Raspberry Pi using NetworkManager (nmcli). The integration consists of:

1. **Shell Script** (`scripts/wifi-manager.sh`) - Wrapper for nmcli commands
2. **React Hook** (`useWiFiManager.ts`) - Frontend interface with fallback
3. **WiFi Manager UI** - User-friendly interface in Settings view

## Prerequisites

### On Raspberry Pi

1. **NetworkManager must be installed and running:**
   ```bash
   sudo apt-get install network-manager
   sudo systemctl enable NetworkManager
   sudo systemctl start NetworkManager
   ```

2. **Permissions for script execution:**
   ```bash
   chmod +x /home/mario/AmpMatter/scripts/wifi-manager.sh
   ```

3. **Optional: Add user to netdev group for permission-less WiFi management:**
   ```bash
   sudo usermod -a -G netdev $USER
   # Log out and back in for changes to take effect
   ```

4. **Optional: Configure sudo to allow nmcli without password:**
   ```bash
   sudo visudo
   # Add this line (replace 'mario' with your username):
   mario ALL=(ALL) NOPASSWD: /usr/bin/nmcli
   ```

## Shell Script Usage

The `wifi-manager.sh` script can be used directly from command line:

```bash
# Scan for networks
./scripts/wifi-manager.sh scan

# Connect to a network
./scripts/wifi-manager.sh connect "NetworkName" "password123"

# Get current connection
./scripts/wifi-manager.sh current

# List saved networks
./scripts/wifi-manager.sh saved

# Forget a network
./scripts/wifi-manager.sh forget "OldNetwork"

# Check WiFi status
./scripts/wifi-manager.sh status

# Disconnect
./scripts/wifi-manager.sh disconnect
```

All commands output JSON for easy parsing by the frontend.

## Integration Methods

### Method 1: Backend API (Recommended for Web App)

Create a simple Express/Node backend:

```javascript
// server.js
const express = require('express');
const { exec } = require('child_process');
const app = express();

app.use(express.json());

app.post('/api/wifi', (req, res) => {
  const { command, args = [] } = req.body;
  const scriptPath = './scripts/wifi-manager.sh';
  const cmdArgs = [command, ...args].map(arg => `"${arg}"`).join(' ');

  exec(`${scriptPath} ${cmdArgs}`, (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({ error: stderr || error.message });
    }
    try {
      res.json(JSON.parse(stdout));
    } catch {
      res.json({ success: true, output: stdout });
    }
  });
});

app.listen(3001, () => console.log('WiFi API listening on port 3001'));
```

### Method 2: Electron IPC (Recommended for Desktop App)

In Electron main process:

```javascript
// main.js
const { ipcMain } = require('electron');
const { exec } = require('child_process');
const path = require('path');

ipcMain.handle('execute-wifi-script', async (event, command, args) => {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, 'scripts', 'wifi-manager.sh');
    const cmdArgs = [command, ...args].map(arg => `"${arg}"`).join(' ');

    exec(`${scriptPath} ${cmdArgs}`, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        try {
          resolve(JSON.parse(stdout));
        } catch {
          resolve({ success: true, output: stdout });
        }
      }
    });
  });
});
```

In preload script:

```javascript
// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  executeWiFiScript: (command, args) =>
    ipcRenderer.invoke('execute-wifi-script', command, args)
});
```

### Method 3: Direct Execution (Development Only)

⚠️ **Not recommended for production** - Security risk

The hook will automatically fall back to mock data if no backend/Electron is available.

## Fallback Behavior

The `useWiFiManager` hook implements graceful degradation:

1. **Try Electron IPC** - If `window.electron.executeWiFiScript` exists
2. **Try Backend API** - Fetch to `/api/wifi`
3. **Fall back to Mock** - Simulated WiFi data for development

This allows the app to work in all environments without errors.

## Security Considerations

### Production Deployment

1. **Never expose nmcli directly to the web** - Use a secured backend
2. **Validate all inputs** - SSID and password should be sanitized
3. **Rate limiting** - Prevent scan/connect spam
4. **User authentication** - Ensure only authorized users can change WiFi
5. **HTTPS only** - Never send WiFi passwords over HTTP

### Script Permissions

The `wifi-manager.sh` script requires:
- Read access to NetworkManager
- Write access to modify connections (may require sudo)

### Recommended Setup

For production Raspberry Pi deployment:

```bash
# 1. Create dedicated wifi-manager user
sudo useradd -r -s /bin/false wifi-manager

# 2. Add to netdev group
sudo usermod -a -G netdev wifi-manager

# 3. Set script ownership
sudo chown wifi-manager:wifi-manager /path/to/wifi-manager.sh
sudo chmod 750 /path/to/wifi-manager.sh

# 4. Configure sudo for specific commands only
# In /etc/sudoers.d/wifi-manager:
wifi-manager ALL=(ALL) NOPASSWD: /usr/bin/nmcli dev wifi list
wifi-manager ALL=(ALL) NOPASSWD: /usr/bin/nmcli dev wifi connect *
wifi-manager ALL=(ALL) NOPASSWD: /usr/bin/nmcli dev disconnect *
```

## Troubleshooting

### Script returns empty results

- Check NetworkManager is running: `systemctl status NetworkManager`
- Verify nmcli is installed: `which nmcli`
- Check permissions: `ls -la scripts/wifi-manager.sh`

### "Permission denied" errors

- Add user to netdev group (see Prerequisites)
- Or configure sudo access for nmcli
- Check script is executable: `chmod +x scripts/wifi-manager.sh`

### Frontend shows mock data only

- Check backend/Electron is configured (see Integration Methods)
- Open browser console to see connection errors
- Verify API endpoint: `curl -X POST http://localhost:3001/api/wifi -H "Content-Type: application/json" -d '{"command":"status"}'`

### Networks not appearing after scan

- WiFi adapter may be disabled: `nmcli radio wifi on`
- Check rfkill: `rfkill list` and `rfkill unblock wifi` if needed
- Some adapters need a rescan: `nmcli dev wifi rescan`

## Testing

Test the script directly:

```bash
# Should return JSON array
./scripts/wifi-manager.sh scan

# Should show current connection or empty
./scripts/wifi-manager.sh current

# Should show adapter info
./scripts/wifi-manager.sh status
```

Test with mock connection:

```bash
# This will fail but shows error handling works
./scripts/wifi-manager.sh connect "TestNetwork" "wrongpassword"
```

## Future Enhancements

- [ ] WPA Enterprise support (802.1X)
- [ ] Hidden SSID connection
- [ ] Static IP configuration
- [ ] Connection profiles (home, marina, etc.)
- [ ] Signal strength history/logging
- [ ] Auto-connect priority management
- [ ] VPN integration
- [ ] Hotspot mode (AP mode)
