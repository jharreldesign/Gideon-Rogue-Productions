# gunicorn.conf.py

# Server socket
bind = "0.0.0.0:5000"  # Binds to all available IPs on port 5000

# Workers
workers = 4  # Number of worker processes
worker_class = "sync"  # Type of workers; sync is the default

# Logging
accesslog = "-"  # Log access to stdout
errorlog = "-"   # Log errors to stdout
loglevel = "info"  # Logging level (debug, info, warning, error, critical)

# Timeout
timeout = 30  # Restart workers if they hang for more than 30 seconds

# Reload
reload = True  # Automatically reload workers when code changes (useful for dev)
