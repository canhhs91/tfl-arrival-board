# gunicorn_config.py

# Use the name of your Flask app file (without the '.py' extension)
# For example, if your app is in 'app.py', use 'app' as the value.
app_name = "app"

# Number of worker processes
workers = 4

# Host and port settings
bind = "0.0.0.0:8000"  # Replace with your desired host and port

# Worker class for handling requests (e.g., 'gevent' for asynchronous support)
worker_class = "gevent"

# Maximum number of requests a worker will process before restarting
max_requests = 1000

# Maximum number of requests a worker can handle during a graceful shutdown
graceful_timeout = 30

# Logging configuration (customize as needed)
accesslog = "-"  # Log to stdout
errorlog = "-"   # Log to stdout

# Set the path to your application's WSGI entry point
# Typically in the format: "module_name:app_instance"
# Replace 'your_app_name' with the name of your Flask app file (without the '.py' extension)
# For example, if your app is in 'app.py', use 'app:app'
# If you have a different app setup, adjust this accordingly.
# For a simple Flask app, this should work:
# wsgi_app = f"{app_name}:app"
wsgi_app = "app:app"  # Replace 'your_app_name' with your app's name

# Enable daemon mode (uncomment if needed)
# daemon = True
