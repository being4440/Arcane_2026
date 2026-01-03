"""
Comprehensive API Test Suite for Upcycle Backend
Tests all CRUD operations and verifies database updates

Run with: python test_api.py
Run with: python test_api.py --keep-data  (to preserve data in database)
Make sure the server is running on http://localhost:8000
"""

import requests
import json
import sys
from typing import Optional

# Configuration
KEEP_DATA = "--keep-data" in sys.argv  # Skip deletion if flag provided

BASE_URL = "http://localhost:8000"
API_URL = f"{BASE_URL}/api"

# Test data storage
test_data = {
    "org_token": None,
    "buyer_token": None,
    "admin_token": None,
    "org_id": None,
    "buyer_id": None,
    "material_id": None,
    "request_id": None
}

def print_section(title):
    """Print formatted section header"""
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}\n")

def print_test(name, success, details=""):
    """Print test result"""
    status = "✅ PASS" if success else "❌ FAIL"
    print(f"{status} | {name}")
    if details:
        print(f"      └─ {details}")

# ==================== AUTH TESTS ====================

def test_signup_organization():
    """Test organization signup"""
    print_section("TEST 1: Organization Signup")
    
    payload = {
        "org_name": "EcoMaterials Inc",
        "org_type": "manufacturer",
        "industry_type": "recycling",
        "email": "eco@materials.com",
        "password": "securepass123"
    }
    
    response = requests.post(f"{API_URL}/auth/signup/organization", json=payload)
    
    if response.status_code == 200:
        data = response.json()
        test_data["org_id"] = data.get("org_id")
        print_test("Organization Created", True, f"ID: {test_data['org_id']}")
        print(f"      Email: {data.get('email')}")
        print(f"      Status: {data.get('verification_status')}")
        return True
    else:
        print_test("Organization Created", False, response.text)
        return False

def test_signup_buyer():
    """Test buyer signup"""
    print_section("TEST 2: Buyer Signup")
    
    payload = {
        "name": "John Buyer",
        "email": "john@buyer.com",
        "password": "buyerpass123",
        "city": "Mumbai",
        "phone": "9876543210"
    }
    
    response = requests.post(f"{API_URL}/auth/signup/buyer", json=payload)
    
    if response.status_code == 200:
        data = response.json()
        test_data["buyer_id"] = data.get("buyer_id")
        print_test("Buyer Created", True, f"ID: {test_data['buyer_id']}")
        print(f"      Name: {data.get('name')}")
        print(f"      City: {data.get('city')}")
        return True
    else:
        print_test("Buyer Created", False, response.text)
        return False

def test_signup_admin():
    """Test admin signup"""
    print_section("TEST 3: Admin Signup")
    
    payload = {
        "name": "Admin User",
        "email": "admin@upcycle.com",
        "password": "adminpass123",
        "role": "admin"
    }
    
    response = requests.post(f"{API_URL}/auth/signup/admin", json=payload)
    
    if response.status_code == 200:
        data = response.json()
        print_test("Admin Created", True, f"ID: {data.get('admin_id')}")
        print(f"      Name: {data.get('name')}")
        return True
    else:
        print_test("Admin Created", False, response.text)
        return False

def test_login_organization():
    """Test organization login"""
    print_section("TEST 4: Organization Login")
    
    payload = {
        "username": "eco@materials.com",
        "password": "securepass123"
    }
    
    response = requests.post(f"{API_URL}/auth/login", data=payload)
    
    if response.status_code == 200:
        data = response.json()
        test_data["org_token"] = data.get("access_token")
        print_test("Organization Login", True, f"Token: {test_data['org_token'][:20]}...")
        print(f"      Role: {data.get('role')}")
        print(f"      User ID: {data.get('user_id')}")
        return True
    else:
        print_test("Organization Login", False, response.text)
        return False

def test_login_buyer():
    """Test buyer login"""
    print_section("TEST 5: Buyer Login")
    
    payload = {
        "username": "john@buyer.com",
        "password": "buyerpass123"
    }
    
    response = requests.post(f"{API_URL}/auth/login", data=payload)
    
    if response.status_code == 200:
        data = response.json()
        test_data["buyer_token"] = data.get("access_token")
        print_test("Buyer Login", True, f"Token received")
        print(f"      Role: {data.get('role')}")
        return True
    else:
        print_test("Buyer Login", False, response.text)
        return False

def test_login_admin():
    """Test admin login"""
    print_section("TEST 6: Admin Login")
    
    payload = {
        "username": "admin@upcycle.com",
        "password": "adminpass123"
    }
    
    response = requests.post(f"{API_URL}/auth/login", data=payload)
    
    if response.status_code == 200:
        data = response.json()
        test_data["admin_token"] = data.get("access_token")
        print_test("Admin Login", True, f"Token received")
        return True
    else:
        print_test("Admin Login", False, response.text)
        return False

# ==================== MATERIAL CRUD TESTS ====================

def test_create_material():
    """Test material creation (Organization only)"""
    print_section("TEST 7: Create Material")
    
    headers = {"Authorization": f"Bearer {test_data['org_token']}"}
    payload = {
        "title": "Recycled Plastic Pellets",
        "category": "Plastic",
        "description": "High-quality recycled HDPE pellets",
        "quantity_value": 500,
        "quantity_unit": "kg",
        "condition": "excellent",
        "photos": [
            "https://example.com/photo1.jpg",
            "https://example.com/photo2.jpg"
        ]
    }
    
    response = requests.post(f"{API_URL}/materials/", json=payload, headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        test_data["material_id"] = data.get("material_id")
        print_test("Material Created", True, f"ID: {test_data['material_id']}")
        print(f"      Title: {data.get('title')}")
        print(f"      Category: {data.get('category')}")
        print(f"      Quantity: {data.get('quantity_value')} {data.get('quantity_unit')}")
        print(f"      Photos: {len(data.get('photos', []))} uploaded")
        return True
    else:
        print_test("Material Created", False, response.text)
        return False

def test_read_materials():
    """Test reading/listing materials"""
    print_section("TEST 8: List All Materials")
    
    response = requests.get(f"{API_URL}/materials/")
    
    if response.status_code == 200:
        data = response.json()
        print_test("Materials Retrieved", True, f"Count: {len(data)}")
        if data:
            print(f"      First Material: {data[0].get('title')}")
        return True
    else:
        print_test("Materials Retrieved", False, response.text)
        return False

def test_read_single_material():
    """Test reading a specific material"""
    print_section("TEST 9: Get Single Material")
    
    if not test_data["material_id"]:
        print_test("Get Material", False, "No material ID available")
        return False
    
    response = requests.get(f"{API_URL}/materials/{test_data['material_id']}")
    
    if response.status_code == 200:
        data = response.json()
        print_test("Material Retrieved", True, f"ID: {data.get('material_id')}")
        print(f"      Title: {data.get('title')}")
        print(f"      Status: {data.get('availability_status')}")
        return True
    else:
        print_test("Material Retrieved", False, response.text)
        return False

def test_update_material():
    """Test updating a material"""
    print_section("TEST 10: Update Material")
    
    if not test_data["material_id"] or not test_data["org_token"]:
        print_test("Update Material", False, "Missing prerequisites")
        return False
    
    headers = {"Authorization": f"Bearer {test_data['org_token']}"}
    payload = {
        "title": "Premium Recycled Plastic Pellets",
        "quantity_value": 750,
        "description": "Updated: High-quality recycled HDPE pellets - Premium Grade"
    }
    
    response = requests.put(
        f"{API_URL}/materials/{test_data['material_id']}", 
        json=payload, 
        headers=headers
    )
    
    if response.status_code == 200:
        data = response.json()
        print_test("Material Updated", True, f"ID: {data.get('material_id')}")
        print(f"      New Title: {data.get('title')}")
        print(f"      New Quantity: {data.get('quantity_value')} kg")
        return True
    else:
        print_test("Material Updated", False, response.text)
        return False

# ==================== REQUEST TESTS ====================

def test_create_request():
    """Test buyer creating a request for material"""
    print_section("TEST 11: Buyer Creates Request")
    
    if not test_data["material_id"] or not test_data["buyer_token"]:
        print_test("Create Request", False, "Missing prerequisites")
        return False
    
    headers = {"Authorization": f"Bearer {test_data['buyer_token']}"}
    payload = {
        "requested_quantity": 100,
        "message": "Interested in purchasing 100kg for our manufacturing unit"
    }
    
    response = requests.post(
        f"{API_URL}/materials/{test_data['material_id']}/request",
        json=payload,
        headers=headers
    )
    
    if response.status_code == 200:
        data = response.json()
        test_data["request_id"] = data.get("request_id")
        print_test("Request Created", True, f"ID: {test_data['request_id']}")
        print(f"      Quantity: {data.get('requested_quantity')} kg")
        print(f"      Message: {data.get('message')[:50]}...")
        return True
    else:
        print_test("Request Created", False, response.text)
        return False

def test_view_requests():
    """Test organization viewing requests for their material"""
    print_section("TEST 12: View Material Requests (Seller)")
    
    if not test_data["material_id"] or not test_data["org_token"]:
        print_test("View Requests", False, "Missing prerequisites")
        return False
    
    headers = {"Authorization": f"Bearer {test_data['org_token']}"}
    response = requests.get(
        f"{API_URL}/org/materials/{test_data['material_id']}/requests",
        headers=headers
    )
    
    if response.status_code == 200:
        data = response.json()
        print_test("Requests Retrieved", True, f"Count: {len(data)}")
        if data:
            print(f"      First Request: {data[0].get('requested_quantity')} kg")
        return True
    else:
        print_test("Requests Retrieved", False, response.text)
        return False

# ==================== MAP/DISCOVERY TEST ====================

def test_map_discovery():
    """Test geospatial material discovery"""
    print_section("TEST 13: Map Discovery")
    
    # Using Mumbai coordinates
    params = {
        "lat": 19.0760,
        "long": 72.8777,
        "radius_km": 100,
        "category": "Plastic"
    }
    
    response = requests.get(f"{API_URL}/map/", params=params)
    
    if response.status_code == 200:
        data = response.json()
        print_test("Map Discovery", True, f"Materials found: {len(data)}")
        if data:
            print(f"      Nearest: {data[0].get('title')} ({data[0].get('distance_km')} km)")
        return True
    else:
        print_test("Map Discovery", False, response.text)
        return False

# ==================== ADMIN TESTS ====================

def test_admin_analytics():
    """Test admin analytics endpoints"""
    print_section("TEST 14: Admin Analytics")
    
    if not test_data["admin_token"]:
        print_test("Admin Analytics", False, "No admin token")
        return False
    
    headers = {"Authorization": f"Bearer {test_data['admin_token']}"}
    
    # Test impact analytics
    response = requests.get(f"{API_URL}/admin/analytics/impact", headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        print_test("Impact Analytics", True)
        print(f"      Total Materials: {data.get('total_materials_listed')}")
        print(f"      Transferred: {data.get('total_materials_transferred')}")
        print(f"      Waste Diverted: {data.get('waste_diverted_kg')} kg")
        print(f"      CO2 Reduced: {data.get('co2_reduction_kg')} kg")
        return True
    else:
        print_test("Impact Analytics", False, response.text)
        return False

# ==================== DELETE TEST ====================

def test_delete_material():
    """Test deleting a material (run last to cleanup)"""
    print_section("TEST 15: Delete Material")
    
    if not test_data["material_id"] or not test_data["org_token"]:
        print_test("Delete Material", False, "Missing prerequisites")
        return False
    
    headers = {"Authorization": f"Bearer {test_data['org_token']}"}
    response = requests.delete(
        f"{API_URL}/materials/{test_data['material_id']}",
        headers=headers
    )
    
    if response.status_code == 200:
        print_test("Material Deleted", True, f"ID: {test_data['material_id']}")
        print(f"      Status: {response.json().get('status')}")
        
        # Verify deletion
        verify = requests.get(f"{API_URL}/materials/{test_data['material_id']}")
        if verify.status_code == 404:
            print_test("Deletion Verified", True, "Material no longer exists")
        return True
    else:
        print_test("Material Deleted", False, response.text)
        return False

# ==================== MAIN TEST RUNNER ====================

def run_all_tests():
    """Execute all tests in sequence"""
    print("\n" + "="*60)
    print("  UPCYCLE API TEST SUITE")
    print("  Testing Database CRUD Operations")
    if KEEP_DATA:
        print("  MODE: Data will be preserved in database")
    print("="*60)
    
    tests = [
        ("Signup Organization", test_signup_organization),
        ("Signup Buyer", test_signup_buyer),
        ("Signup Admin", test_signup_admin),
        ("Login Organization", test_login_organization),
        ("Login Buyer", test_login_buyer),
        ("Login Admin", test_login_admin),
        ("Create Material", test_create_material),
        ("List Materials", test_read_materials),
        ("Get Single Material", test_read_single_material),
        ("Update Material", test_update_material),
        ("Create Request", test_create_request),
        ("View Requests", test_view_requests),
        ("Map Discovery", test_map_discovery),
        ("Admin Analytics", test_admin_analytics),
    ]
    
    # Only add delete test if not keeping data
    if not KEEP_DATA:
        tests.append(("Delete Material", test_delete_material))
    
    results = []
    for name, test_func in tests:
        try:
            success = test_func()
            results.append((name, success))
        except Exception as e:
            print_test(name, False, f"Exception: {str(e)}")
            results.append((name, False))
    
    # Summary
    print_section("TEST SUMMARY")
    passed = sum(1 for _, success in results if success)
    total = len(results)
    
    print(f"Total Tests: {total}")
    print(f"Passed: {passed} ✅")
    print(f"Failed: {total - passed} ❌")
    print(f"Success Rate: {(passed/total)*100:.1f}%")
    
    if KEEP_DATA:
        print("\n" + "="*60)
        print("  ✅ DATA PRESERVED IN DATABASE")
        print("  Check PostgreSQL to see:")
        print(f"    - Organization ID: {test_data.get('org_id')}")
        print(f"    - Buyer ID: {test_data.get('buyer_id')}")  
        print(f"    - Material ID: {test_data.get('material_id')}")
        print(f"    - Request ID: {test_data.get('request_id')}")
        print("="*60)
    else:
        print("\n" + "="*60)
        print("  Check your database to verify data persistence!")
        print("="*60 + "\n")

if __name__ == "__main__":
    run_all_tests()
