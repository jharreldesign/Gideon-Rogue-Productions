import os

# Server socket
# Bind to the port provided by the environment, or default to 5000 if not set
bind = f"0.0.0.0:{os.getenv('PORT', 5000)}"  # Vercel/Render will set PORT dynamically

# Workers
workers = os.cpu_count() * 2 + 1  # Auto set number of workers based on CPU cores (Render recommendation)
worker_class = "sync"  # "sync" is the default; use "gevent" or "eventlet" if asynchronous handling is needed

# Logging
accesslog = "-"  # Log access to stdout
errorlog = "-"   # Log errors to stdout
loglevel = "info"  # Set to "debug" for more detailed logging if needed

# Timeout
timeout = 30  # Restart workers if they hang for more than 30 seconds

# Reload
reload = False  # Set to True for development to auto-reload workers when code changes




# # gunicorn.conf.py

# # Server socket
# bind = "0.0.0.0:5000"  # Binds to all available IPs on port 5000

# # Workers
# workers = 4  # Number of worker processes
# worker_class = "sync"  # Type of workers; sync is the default

# # Logging
# accesslog = "-"  # Log access to stdout
# errorlog = "-"   # Log errors to stdout
# loglevel = "info"  # Logging level (debug, info, warning, error, critical)

# # Timeout
# timeout = 30  # Restart workers if they hang for more than 30 seconds

# # Reload
# reload = True  # Automatically reload workers when code changes (useful for dev)
