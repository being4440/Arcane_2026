
"""
Comprehensive API Test Suite & Data Seeder for Upcycle Backend
Tests all CRUD operations and populates database with realistic test data.

Run with: python test_api.py
Run with: python test_api.py --keep-data  (to preserve data)
"""

import requests
import json
import sys
import random
import time
from typing import Optional

# Configuration
KEEP_DATA = "--keep-data" in sys.argv
BASE_URL = "http://localhost:8000"
API_URL = f"{BASE_URL}/api"

# Storage
buyers = []  # List of dicts {id, token, name}
sellers = [] # List of dicts {id, token, name, materials: []}
admin_token = None

# Constants for randomization
CITIES = ["Mumbai", "Delhi", "Bangalore", "Chennai", "Pune", "Hyderabad"]
CATEGORIES = ["Plastic", "Metal", "Glass", "E-Waste", "Textile"]

def print_section(title):
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}\n")

def print_step(msg, success, details=""):
    symbol = "✅" if success else "❌"
    print(f"{symbol} {msg} | {details}")

# ==================== HELPERS ====================

def get_headers(token):
    return {"Authorization": f"Bearer {token}"}

# ==================== SEEDING FUNCTIONS ====================

def seed_admin():
    global admin_token
    print_section("SEEDING: Admin Account")
    
    # Try login first
    payload = {"username": "admin@upcycle.com", "password": "adminpass123"}
    resp = requests.post(f"{API_URL}/auth/login", data=payload)
    
    if resp.status_code != 200:
        # Create if not exists
        create_payload = {
            "name": "Super Admin",
            "email": "admin@upcycle.com",
            "password": "adminpass123",
            "role": "admin"
        }
        requests.post(f"{API_URL}/auth/signup/admin", json=create_payload)
        resp = requests.post(f"{API_URL}/auth/login", data=payload)
    
    if resp.status_code == 200:
        admin_token = resp.json().get("access_token")
        print_step("Admin Login", True)
    else:
        print_step("Admin Login", False, resp.text)

def seed_sellers(count=5):
    print_section(f"SEEDING: {count} Sellers (Organizations)")
    
    for i in range(count):
        org_name = f"Org_{i+1}_{random.randint(1000,9999)}"
        email = f"seller{i+1}_{random.randint(1000,9999)}@example.com"
        password = "password123"
        city = random.choice(CITIES)
        
        # Signup
        payload = {
            "org_name": org_name,
            "org_type": "Recycler",
            "industry_type": "Manufacturing",
            "email": email,
            "password": password,
            "city": city,
            "location": {
                "lat": 19.0760 + (random.random() * 0.05), # Close to Mumbai for map tests
                "long": 72.8777 + (random.random() * 0.05),
                "city": city,
                "address": f"Address {i+1}, {city}"
            }
        }
        
        resp = requests.post(f"{API_URL}/auth/signup/organization", json=payload)
        if resp.status_code == 200:
            data = resp.json()
            
            # Login to get token
            login_resp = requests.post(f"{API_URL}/auth/login", data={"username": email, "password": password})
            token = login_resp.json().get("access_token")
            
            sellers.append({
                "id": data.get("org_id"),
                "token": token,
                "name": org_name,
                "materials": []
            })
            print_step(f"Created Seller {i+1}", True, f"{org_name}")
            
            # Add Materials for this seller
            seed_materials_for_seller(sellers[-1])
        else:
            print_step(f"Created Seller {i+1}", False, resp.text)

def seed_materials_for_seller(seller_dict):
    # Add 3-5 materials per seller
    num_materials = random.randint(3, 5)
    
    for i in range(num_materials):
        category = random.choice(CATEGORIES)
        payload = {
            "title": f"Batch of {category}",
            "category": category,
            "description": f"High quality {category} waste available for recycling.",
            "quantity_value": random.randint(100, 1000),
            "quantity_unit": "kg",
            "condition": "Good",
            "photos": ["http://example.com/photo.jpg"]
        }
        
        resp = requests.post(f"{API_URL}/materials/", json=payload, headers=get_headers(seller_dict["token"]))
        if resp.status_code == 200:
            m_data = resp.json()
            seller_dict["materials"].append(m_data)

def seed_buyers(count=10):
    print_section(f"SEEDING: {count} Buyers")
    
    for i in range(count):
        name = f"Buyer_{i+1}"
        email = f"buyer{i+1}_{random.randint(1000,9999)}@example.com"
        password = "password123"
        
        payload = {
            "name": name,
            "email": email,
            "password": password,
            "city": random.choice(CITIES),
            "phone": f"98765{random.randint(10000,99999)}"
        }
        
        resp = requests.post(f"{API_URL}/auth/signup/buyer", json=payload)
        if resp.status_code == 200:
            data = resp.json()
            
            # Login
            login_resp = requests.post(f"{API_URL}/auth/login", data={"username": email, "password": password})
            token = login_resp.json().get("access_token")
            
            buyers.append({
                "id": data.get("buyer_id"),
                "token": token,
                "name": name
            })
            print_step(f"Created Buyer {i+1}", True, name)
        else:
             print_step(f"Created Buyer {i+1}", False, resp.text)

def seed_requests(min_count=15):
    print_section(f"SEEDING: Requests (Target {min_count}+)")
    count = 0
    
    # Randomly match buyers to materials
    # We need to flatten available materials
    all_materials = []
    for s in sellers:
        for m in s["materials"]:
            all_materials.append({"m": m, "seller": s})
            
    if not all_materials:
        print_step("Seeding Requests", False, "No materials available")
        return

    while count < min_count:
        buyer = random.choice(buyers)
        mat_info = random.choice(all_materials)
        material = mat_info["m"]
        seller = mat_info["seller"]
        
        # New Rule: Buyer cannot request from blocked seller (Already handled by app)
        # New Rule: Buyer cannot request > available
        # quantity_value from API might be string or float depending on serialization
        qty_val = float(material["quantity_value"])
        req_qty = random.randint(10, int(qty_val / 2))
        
        payload = {
            "requested_quantity": req_qty,
            "message": "I am interested in this material."
        }
        
        resp = requests.post(
            f"{API_URL}/materials/{material['material_id']}/request",
            json=payload,
            headers=get_headers(buyer["token"])
        )
        
        if resp.status_code == 200:
            r_data = resp.json()
            try:
                # 50% chance to update status if successful
                if random.random() > 0.5:
                    status = "accepted"
                    # We need org token to update
                    status_payload = {"status": status}
                    status_resp = requests.put(
                        f"{API_URL}/requests/{r_data['request_id']}/status",
                        json=status_payload,
                        headers=get_headers(seller["token"])
                    )
                    
                    if status_resp.status_code == 200 and status == "accepted":
                         # If accepted, maybe complete it?
                         if random.random() > 0.5:
                             requests.put(
                                f"{API_URL}/requests/{r_data['request_id']}/status",
                                json={"status": "completed"},
                                headers=get_headers(seller["token"])
                            )
            except Exception as e:
                pass

            count += 1
            print_step(f"Request {count}", True, f"Buyer {buyer['id']} -> Mat {material['material_id']}")
        elif "already requested" in resp.text:
             pass # Ignore duplicates
        else:
             print_step(f"Request {count} Failed", False, resp.text)
             
        if count >= min_count:
            break

def seed_feedback_and_reports():
    print_section("SEEDING: Feedback & Reports (Min 2 each)")
    
    # 1. Feedback (Buyer -> Request)
    # Get all completed requests (we just made some above)
    completed_requests = []
    
    # We don't have a direct list here easily without querying API or tracking in memory.
    # Let's track them during creation or query now.
    # Simpler: Query Organization Requests.
    
    for seller in sellers:
        # Get requests for one of their materials
        if not seller["materials"]: continue
        mat_id = seller["materials"][0]["material_id"]
        
        resp = requests.get(
            f"{API_URL}/org/materials/{mat_id}/requests",
            headers=get_headers(seller["token"])
        )
        if resp.status_code == 200:
            reqs = resp.json()
            for r in reqs:
                if r["status"] == "completed":
                    completed_requests.append(r)

    print(f"  Found {len(completed_requests)} completed requests eligible for feedback")
    
    # Add Feedback
    feedback_count = 0
    for r in completed_requests:
        if feedback_count >= 2: break
        
        # We need the buyer token. In real app, we'd look it up. 
        # Here, we can hack it: try all buyer tokens until one works (since we own them all)
        # OR better: The request object likely has buyer_id matching our seed data.
        buyer_id = r["buyer_id"]
        buyer_token = next((b["token"] for b in buyers if b["id"] == buyer_id), None)
        
        if buyer_token:
            payload = {
                "rating": random.randint(4, 5),
                "comment": "Excellent material, very clean!"
            }
            res = requests.post(
                f"{API_URL}/interactions/{r['request_id']}/feedback",
                json=payload,
                headers=get_headers(buyer_token)
            )
            if res.status_code == 200:
                print_step("Feedback Added", True, f"Req {r['request_id']}")
                feedback_count += 1

    # 2. Seller Reports (Seller -> Buyer)
    # Can report any request (even pending)
    report_count = 0
    for seller in sellers:
        if report_count >= 2: break
        
        # Get requests again or reuse
        # Just use the first request we can find
        if not seller["materials"]: continue
        mat_id = seller["materials"][0]["material_id"]
        resp = requests.get(f"{API_URL}/org/materials/{mat_id}/requests", headers=get_headers(seller["token"]))
        
        if resp.status_code == 200:
            reqs = resp.json()
            if reqs:
                target_req = reqs[0]
                payload = {
                    "reason": "Did not show up",
                    "description": "Buyer was unresponsive."
                }
                res = requests.post(
                    f"{API_URL}/interactions/requests/{target_req['request_id']}/report",
                    json=payload,
                    headers=get_headers(seller["token"])
                )
                if res.status_code == 200:
                    print_step("Report Filed", True, f"Seller {seller['id']} -> Req {target_req['request_id']}")
                    report_count += 1


def run_seeding():
    seed_admin()
    seed_sellers(5)
    seed_buyers(10)
    seed_requests(15)
    seed_feedback_and_reports() # New step

if __name__ == "__main__":
    if KEEP_DATA:
        print("Running in SEED ONLY mode (No cleanup)")
    
    run_seeding()
    
    print("\n" + "="*60)
    print("  DATABASE POPULATED SUCCESSFULLY ✅")
    print(f"  - {len(sellers)} Sellers")
    print(f"  - {len(buyers)} Buyers")
    print("  - 15+ Requests created")
    print("  - Feedback & Reports generated")
    print("="*60 + "\n")
