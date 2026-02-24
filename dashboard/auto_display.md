DGX 1U Dashboard Kiosk: Architecture & Setup Guide

This document outlines the architecture and deployment steps for running a zero-touch, fullscreen Chromium dashboard on a 1U display connected to an NVIDIA DGX system.

The setup is highly optimized to preserve GPU VRAM and CPU cycles for machine learning workloads by utilizing a minimal X11 window manager instead of a full desktop environment. It also employs a restricted, unprivileged user account to ensure system security.

🏗️ Architecture & Resource Optimization

Running a GUI on a deep learning node requires careful resource management. By default, DGX OS (based on Ubuntu) ships with the GNOME desktop environment, which reserves GPU VRAM for its compositor and consumes CPU cycles with background services.

To mitigate this, our deployment relies on a lightweight, sequential boot stack:

System Boot: The OS initializes and systemd starts background services (including your localhost:8080 dashboard).

Display Manager (LightDM): Bypasses the login screen and automatically authenticates a restricted local user.

Window Manager (Openbox): A 2D stacking window manager initializes. It uses effectively 0% CPU and requires no GPU hardware compositor, preserving maximum VRAM for CUDA workloads.

Autostart Routine: A custom Openbox script polls port 8080. Once the dashboard service is live, it launches Chromium in heavily restricted kiosk mode.

🛠️ Step-by-Step Implementation

1. Install Dependencies

Install the required display manager, lightweight window manager, and utilities to hide the cursor and poll the local port.

sudo apt update
sudo apt install lightdm openbox unclutter curl


(Note: If prompted to select a default display manager during installation, select lightdm).

2. Create the Restricted Kiosk User

For security, the display operates under a locked-down user account with zero sudo privileges. This ensures that even if a user breaks out of the browser sandbox, they cannot compromise the DGX system.

# Create the user and generate a home directory
sudo useradd -m -s /bin/bash kioskuser

# Grant necessary hardware permissions to output video
sudo usermod -aG video,render kioskuser

# Lock the password to prevent SSH or local terminal login
sudo passwd -l kioskuser


3. Configure LightDM for Auto-Login

Instruct the display manager to automatically log into the new kioskuser account using Openbox, bypassing the standard login screen.

Open the LightDM configuration file:

sudo nano /etc/lightdm/lightdm.conf


Add or modify the following lines:

[Seat:*]
autologin-user=kioskuser
autologin-user-timeout=0
user-session=openbox


4. Configure the Openbox Autostart Script

This script handles the waiting logic, hides the cursor, clears browser crash flags (to prevent the "Restore Session" popup on power loss), and launches Chromium.

Create the configuration directory for the kiosk user:

sudo mkdir -p /home/kioskuser/.config/openbox


Create the autostart file:

sudo nano /home/kioskuser/.config/openbox/autostart


Paste the deployment script:

# 1. Disable screen blanking, sleep, and screensavers
xset s off
xset s noblank
xset -dpms

# 2. Hide the mouse cursor to keep the 1U display clean
unclutter -idle 0.1 -root &

# 3. Wait until the local dashboard is actively responding
while ! curl -s http://localhost:8080 > /dev/null; do
    sleep 1
done

# 4. Clear Chromium crash states to prevent the "Restore Session" popup
sed -i 's/"exited_cleanly":false/"exited_cleanly":true/' /home/kioskuser/.config/chromium/Default/Preferences
sed -i 's/"exit_type":"Crashed"/"exit_type":"Normal"/' /home/kioskuser/.config/chromium/Default/Preferences

# 5. Launch Chromium in Kiosk Mode
chromium-browser --kiosk "http://localhost:8080" \
  --noerrdialogs \
  --disable-infobars \
  --no-first-run


Ensure the restricted user owns these configuration files so Openbox can execute them:

sudo chown -R kioskuser:kioskuser /home/kioskuser/.config


5. Finalize & Test

Reboot the DGX system. The 1U display will remain blank for a few seconds during boot, poll port 8080 silently in the background, and instantly snap to the dashboard the moment your service goes live.

sudo reboot
