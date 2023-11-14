#!/bin/sh
export DISPLAY=:0 
xset -dpms # Disable DPMS (Energy Star) features.
xset s off # Disable screen saver.
xset s noblank # Don't blank the video device.
unclutter -idle 0 &
matchbox-window-manager &
# Start Midori in fullscreen mode with the specified URL
midori -e Fullscreen  http://localhost:5000 &

# Wait for Midori to load the webpage
sleep 25

# Simulate pressing the Tab key
xdotool key Tab

sleep 100

xdotool key Tab
