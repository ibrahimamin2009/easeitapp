#!/usr/bin/env python3
"""
Test script for the Yarn Purchasing System
This script tests the basic functionality of the application
"""

import requests
import json
import time

BASE_URL = "http://localhost:5001"

def test_application():
    print("🧪 Testing Yarn Purchasing System...")
    
    # Test 1: Check if the application is running
    try:
        response = requests.get(BASE_URL, timeout=5)
        if response.status_code == 200:
            print("✅ Application is running successfully")
        else:
            print(f"❌ Application returned status code: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Application is not accessible: {e}")
        return False
    
    # Test 2: Test login page
    try:
        response = requests.get(f"{BASE_URL}/login", timeout=5)
        if response.status_code == 200 and "Login" in response.text:
            print("✅ Login page is accessible")
        else:
            print("❌ Login page is not working properly")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Login page error: {e}")
        return False
    
    # Test 3: Test registration page
    try:
        response = requests.get(f"{BASE_URL}/register", timeout=5)
        if response.status_code == 200 and "Register" in response.text:
            print("✅ Registration page is accessible")
        else:
            print("❌ Registration page is not working properly")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Registration page error: {e}")
        return False
    
    print("\n🎉 All basic tests passed!")
    print("\n📋 Next steps:")
    print("1. Open your browser and go to http://localhost:5001")
    print("2. Register a new user account")
    print("3. Login with the default admin account:")
    print("   - Username: admin")
    print("   - Password: admin123")
    print("4. Test the card creation and management features")
    print("5. Test the chat functionality")
    
    return True

if __name__ == "__main__":
    test_application()
