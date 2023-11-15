#!/bin/bash
sleep 15
export DISPLAY=:0
# Start Chromium in incognito mode with the specified URL
#chromium-browser --incognito http://localhost:5000 &

firefox-esr --private-window --kiosk http://localhost:5000
