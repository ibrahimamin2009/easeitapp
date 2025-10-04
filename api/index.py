import sys
import os

# Add the parent directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import app

# This is the entry point for Vercel serverless functions
# Vercel expects the handler to be named 'handler'
def handler(request):
    return app(request.environ, lambda *args: None)

# WSGI application for compatibility
application = app
