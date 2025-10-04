def handler(request):
    """Simple test function to verify Vercel is working"""
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json'},
        'body': '{"message": "Vercel function is working!", "environment_vars": {"SECRET_KEY": "' + str(os.environ.get("SECRET_KEY", "missing")) + '", "DATABASE_URL": "' + str(os.environ.get("DATABASE_URL", "missing")) + '"}}'
    }

import os
