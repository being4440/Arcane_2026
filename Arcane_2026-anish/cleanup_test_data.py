"""
Database Cleanup Script for Test Data
Removes all test users and related data

Run with: python cleanup_test_data.py
"""

import psycopg2
from dotenv import load_dotenv
import os

load_dotenv()

# Database connection parameters
DB_PARAMS = {
    "dbname": os.getenv("POSTGRES_DB", "upcycle_db"),
    "user": os.getenv("POSTGRES_USER", "postgres"),
    "password": os.getenv("POSTGRES_PASSWORD", "1810"),
    "host": os.getenv("POSTGRES_HOST", "localhost"),
    "port": os.getenv("POSTGRES_PORT", "5432")
}

def cleanup_test_data():
    """Delete all test-related data from database"""
    conn = None
    try:
        # Connect to database
        conn = psycopg2.connect(**DB_PARAMS)
        conn.autocommit = True
        cursor = conn.cursor()
        
        print("="*60)
        print("  DATABASE CLEANUP - REMOVING TEST DATA")
        print("="*60 + "\n")
        
        # Delete test users (CASCADE will handle related data)
        test_emails = [
            'eco@materials.com',
            'john@buyer.com',
            'admin@upcycle.com'
        ]
        
        for email in test_emails:
            # Delete from organization
            cursor.execute("DELETE FROM organization WHERE email = %s RETURNING org_id", (email,))
            deleted = cursor.fetchone()
            if deleted:
                print(f"✅ Deleted organization: {email} (ID: {deleted[0]})")
            
            # Delete from buyer
            cursor.execute("DELETE FROM buyer WHERE email = %s RETURNING buyer_id", (email,))
            deleted = cursor.fetchone()
            if deleted:
                print(f"✅ Deleted buyer: {email} (ID: {deleted[0]})")
            
            # Delete from admin
            cursor.execute("DELETE FROM admin WHERE email = %s RETURNING admin_id", (email,))
            deleted = cursor.fetchone()
            if deleted:
                print(f"✅ Deleted admin: {email} (ID: {deleted[0]})")
        
        # Count remaining records
        cursor.execute("SELECT COUNT(*) FROM organization")
        org_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM buyer")
        buyer_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM material")
        material_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM request")
        request_count = cursor.fetchone()[0]
        
        print("\n" + "="*60)
        print("  DATABASE STATUS AFTER CLEANUP")
        print("="*60)
        print(f"Organizations: {org_count}")
        print(f"Buyers: {buyer_count}")
        print(f"Materials: {material_count}")
        print(f"Requests: {request_count}")
        print("="*60 + "\n")
        
        cursor.close()
        print("✅ Cleanup completed successfully!")
        
    except Exception as e:
        print(f"❌ Error during cleanup: {e}")
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    cleanup_test_data()
