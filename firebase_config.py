import os
import firebase_admin
from firebase_admin import credentials
from dotenv import load_dotenv

load_dotenv()

# --- MAKE SURE THIS FUNCTION IS DEFINED EXACTLY LIKE THIS ---
def init_firebase():
    """Initializes the Firebase Admin SDK using the local JSON key"""
    cred_path = "firebase-service-account.json"
    
    if not os.path.exists(cred_path):
        raise FileNotFoundError(f"Could not find {cred_path} in project root.")

    if not firebase_admin._apps:
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)
        print("✅ Firebase initialized successfully.")