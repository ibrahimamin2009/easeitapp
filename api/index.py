from app import app

# This is the entry point for Vercel serverless functions
# The app is imported from the main app.py file

# Vercel expects the handler to be named 'handler'
def handler(request):
    return app(request.environ, lambda *args: None)

# Also create a WSGI application for compatibility
application = app
