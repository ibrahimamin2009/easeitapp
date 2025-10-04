from flask import Flask, jsonify
import os

# Create a minimal Flask app
app = Flask(__name__)

@app.route('/')
def hello():
    return jsonify({
        'message': 'Hello from Vercel!',
        'env_check': {
            'SECRET_KEY': 'configured' if os.environ.get('SECRET_KEY') else 'missing',
            'DATABASE_URL': 'configured' if os.environ.get('DATABASE_URL') else 'missing',
            'FLASK_ENV': os.environ.get('FLASK_ENV', 'missing')
        }
    })

@app.route('/health')
def health():
    return jsonify({'status': 'healthy'})

# Vercel handler
def handler(request):
    return app(request.environ, lambda *args: None)
