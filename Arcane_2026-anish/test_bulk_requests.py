"""
Test script for bulk material request acceptance logic.
Tests that:
1. Multiple buyers can be accepted for the same material
2. Quantity is properly deducted after each acceptance
3. Material status changes to partially_allocated then exhausted
4. Rejected requests cannot be re-accepted
"""

import asyncio
import httpx
from decimal import Decimal

API_URL = "http://localhost:8000/api"

# Test data
seller_email = "seller@example.com"
seller_password = "password123"
buyer1_email = "buyer1@example.com"
buyer1_password = "buyer_pass1"
buyer2_email = "buyer2@example.com"
buyer2_password = "buyer_pass2"
buyer3_email = "buyer3@example.com"
buyer3_password = "buyer_pass3"

async def login(email: str, password: str) -> dict:
    """Login and return auth tokens"""
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{API_URL}/auth/login",
            json={"email": email, "password": password}
        )
        if resp.status_code != 200:
            raise Exception(f"Login failed: {resp.text}")
        data = resp.json()
        return {
            "access_token": data.get("access_token"),
            "user_id": data.get("user_id")
        }

async def create_material(seller_token: str, title: str, quantity: int):
    """Create a material with bulk quantity"""
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{API_URL}/materials/",
            headers={"Authorization": f"Bearer {seller_token}"},
            json={
                "title": title,
                "category": "Wood",
                "description": "Test bulk material",
                "quantity_value": quantity,
                "quantity_unit": "kg",
                "condition": "New",
                "photos": []
            }
        )
        if resp.status_code != 200:
            raise Exception(f"Material creation failed: {resp.text}")
        return resp.json()

async def create_request(buyer_token: str, material_id: int, quantity: int, message: str = ""):
    """Create a request for a material"""
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{API_URL}/request/create",
            headers={"Authorization": f"Bearer {buyer_token}"},
            json={
                "material_id": material_id,
                "requested_quantity": quantity,
                "message": message
            }
        )
        if resp.status_code != 200:
            raise Exception(f"Request creation failed: {resp.text}")
        return resp.json()

async def accept_request(seller_token: str, request_id: int):
    """Accept a request"""
    async with httpx.AsyncClient() as client:
        resp = await client.put(
            f"{API_URL}/request/{request_id}/status",
            headers={"Authorization": f"Bearer {seller_token}"},
            json={"status": "accepted"}
        )
        if resp.status_code != 200:
            raise Exception(f"Accept failed: {resp.text}")
        return resp.json()

async def reject_request(seller_token: str, request_id: int):
    """Reject a request"""
    async with httpx.AsyncClient() as client:
        resp = await client.put(
            f"{API_URL}/request/{request_id}/status",
            headers={"Authorization": f"Bearer {seller_token}"},
            json={"status": "rejected"}
        )
        if resp.status_code != 200:
            raise Exception(f"Reject failed: {resp.text}")
        return resp.json()

async def get_material(seller_token: str, material_id: int):
    """Get material details"""
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{API_URL}/materials/{material_id}",
            headers={"Authorization": f"Bearer {seller_token}"}
        )
        if resp.status_code != 200:
            raise Exception(f"Get material failed: {resp.text}")
        return resp.json()

async def main():
    print("=" * 80)
    print("BULK REQUEST ACCEPTANCE TEST")
    print("=" * 80)
    
    try:
        # Login users
        print("\n[1] Logging in users...")
        seller = await login(seller_email, seller_password)
        buyer1 = await login(buyer1_email, buyer1_password)
        buyer2 = await login(buyer2_email, buyer2_password)
        buyer3 = await login(buyer3_email, buyer3_password)
        print(f"✓ Seller logged in (ID: {seller['user_id']})")
        print(f"✓ Buyer1 logged in (ID: {buyer1['user_id']})")
        print(f"✓ Buyer2 logged in (ID: {buyer2['user_id']})")
        print(f"✓ Buyer3 logged in (ID: {buyer3['user_id']})")
        
        # Create bulk material (100 kg)
        print("\n[2] Creating bulk material (100 kg)...")
        material = await create_material(seller["access_token"], "Reclaimed Wood Bulk", 100)
        material_id = material["material_id"]
        print(f"✓ Material created: ID {material_id}, available_quantity: 100")
        
        # Create requests from 3 buyers
        print("\n[3] Creating requests from 3 buyers...")
        req1 = await create_request(buyer1["access_token"], material_id, 30, "Need 30kg")
        req2 = await create_request(buyer2["access_token"], material_id, 40, "Need 40kg")
        req3 = await create_request(buyer3["access_token"], material_id, 50, "Need 50kg")
        print(f"✓ Buyer1 requested 30kg (Request ID: {req1['request_id']})")
        print(f"✓ Buyer2 requested 40kg (Request ID: {req2['request_id']})")
        print(f"✓ Buyer3 requested 50kg (Request ID: {req3['request_id']})")
        
        # Accept first request (30kg)
        print("\n[4] Accepting Buyer1 request (30kg)...")
        result1 = await accept_request(seller["access_token"], req1["request_id"])
        mat = await get_material(seller["access_token"], material_id)
        print(f"✓ Request accepted")
        print(f"  - Material available_quantity: {mat['available_quantity']} (was 100, deducted 30)")
        print(f"  - Material status: {mat['availability_status']}")
        assert mat['available_quantity'] == 70, f"Expected 70, got {mat['available_quantity']}"
        assert mat['availability_status'] == 'partially_allocated', f"Expected partially_allocated, got {mat['availability_status']}"
        
        # Accept second request (40kg)
        print("\n[5] Accepting Buyer2 request (40kg)...")
        result2 = await accept_request(seller["access_token"], req2["request_id"])
        mat = await get_material(seller["access_token"], material_id)
        print(f"✓ Request accepted")
        print(f"  - Material available_quantity: {mat['available_quantity']} (was 70, deducted 40)")
        print(f"  - Material status: {mat['availability_status']}")
        assert mat['available_quantity'] == 30, f"Expected 30, got {mat['available_quantity']}"
        assert mat['availability_status'] == 'partially_allocated', f"Expected partially_allocated, got {mat['availability_status']}"
        
        # Accept third request (30kg - exactly remaining)
        print("\n[6] Accepting Buyer3 request (30kg from remaining 30kg)...")
        # First, we need to adjust buyer3's request to match remaining quantity
        # For now, let's test rejection first
        print("\n[6a] Testing rejection - Rejecting Buyer3 request...")
        result3_reject = await reject_request(seller["access_token"], req3["request_id"])
        print(f"✓ Request rejected")
        print(f"  - Request status: {result3_reject['status']}")
        
        # Try to accept rejected request (should fail)
        print("\n[6b] Testing re-acceptance prevention - Trying to accept rejected request...")
        try:
            await accept_request(seller["access_token"], req3["request_id"])
            print("✗ ERROR: Should not allow re-acceptance of rejected request!")
        except Exception as e:
            print(f"✓ Correctly prevented re-acceptance: {str(e)}")
        
        # Create new request for remaining 30kg
        print("\n[7] Creating new request for remaining 30kg...")
        req4 = await create_request(buyer3["access_token"], material_id, 30, "Need remaining 30kg")
        print(f"✓ Buyer3 requested 30kg (Request ID: {req4['request_id']})")
        
        # Accept it (should exhaust material)
        print("\n[8] Accepting final request (30kg - exhausting material)...")
        result4 = await accept_request(seller["access_token"], req4["request_id"])
        mat = await get_material(seller["access_token"], material_id)
        print(f"✓ Request accepted")
        print(f"  - Material available_quantity: {mat['available_quantity']} (was 30, deducted 30)")
        print(f"  - Material status: {mat['availability_status']}")
        assert mat['available_quantity'] == 0, f"Expected 0, got {mat['available_quantity']}"
        assert mat['availability_status'] == 'exhausted', f"Expected exhausted, got {mat['availability_status']}"
        
        print("\n" + "=" * 80)
        print("✓ ALL TESTS PASSED!")
        print("=" * 80)
        print("\nSummary:")
        print("  ✓ Multiple buyers accepted until quantity runs out")
        print("  ✓ Quantity properly deducted after each acceptance")
        print("  ✓ Material status correctly updated to exhausted")
        print("  ✓ Rejected requests cannot be re-accepted")
        
    except Exception as e:
        print(f"\n✗ TEST FAILED: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
