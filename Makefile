# Makefile for starting a Flask application in production mode

# Define the Flask app file and the Gunicorn command
FLASK_APP = app:app
GUNICORN_CMD = gunicorn


# Define the production configuration file (you can customize this)
CONFIG_FILE = gunicorn_config.py

.PHONY: run-prod stop-prod

run-prod:
	$(GUNICORN_CMD) --config $(CONFIG_FILE) $(FLASK_APP)

stop-prod:
	pkill -f "gunicorn.*$(FLASK_APP)"
