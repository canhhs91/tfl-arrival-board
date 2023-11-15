#!/bin/bash

# Define the source and destination paths for the service file
SERVICE_FILE="start_browser.service"
SERVICE_SOURCE="./$SERVICE_FILE"
SERVICE_DESTINATION="/etc/systemd/system/$SERVICE_FILE"

# Copy the service file to the system directory
sudo cp "$SERVICE_SOURCE" "$SERVICE_DESTINATION"

# Reload systemd to recognize the new service
sudo systemctl daemon-reload

# Enable the service for automatic startup
sudo systemctl enable "$SERVICE_FILE"

# Start the service
sudo systemctl start "$SERVICE_FILE"

# Check the status to ensure it's running
sudo systemctl status "$SERVICE_FILE"
