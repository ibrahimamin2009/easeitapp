import sys
import os

# Add the parent directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from app import app
    
    # Vercel expects the handler to be named 'handler'
    def handler(request):
        try:
            return app(request.environ, lambda *args: None)
        except Exception as e:
            print(f"Handler error: {e}")
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json'},
                'body': f'{{"error": "Internal server error: {str(e)}"}}'
            }
    
    # WSGI application for compatibility
    application = app
    
except Exception as e:
    print(f"Import error: {e}")
    def handler(request):
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json'},
            'body': f'{{"error": "Import error: {str(e)}"}}'
        }
